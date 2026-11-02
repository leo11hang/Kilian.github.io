(function () {
  'use strict';

  var grid = document.querySelector('.download-accordions');
  if (!grid) return;

  var products = Array.prototype.slice.call(grid.querySelectorAll(':scope > details.download-accordion'));
  if (!products.length) return;

  var contentStore = document.createElement('div');
  contentStore.className = 'download-content-store';
  contentStore.hidden = true;

  var panel = document.createElement('div');
  panel.className = 'download-shared-panel';
  panel.id = 'download-shared-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', '所选软件的下载详情');
  panel.hidden = true;

  var activeProduct = null;

  products.forEach(function (product) {
    var summary = product.querySelector(':scope > summary');
    var content = product.querySelector(':scope > section');
    if (!summary || !content) return;

    summary.setAttribute('aria-controls', panel.id);
    summary.setAttribute('aria-expanded', 'false');
    product._sharedDownloadContent = content;
    contentStore.appendChild(content);

    summary.addEventListener('click', function (event) {
      event.preventDefault();
      var wasActive = activeProduct === product;

      if (activeProduct) {
        activeProduct.open = false;
        activeProduct.querySelector(':scope > summary').setAttribute('aria-expanded', 'false');
        contentStore.appendChild(activeProduct._sharedDownloadContent);
        activeProduct = null;
      }

      if (wasActive) {
        panel.hidden = true;
        return;
      }

      product.open = true;
      summary.setAttribute('aria-expanded', 'true');
      panel.appendChild(content);
      panel.hidden = false;
      activeProduct = product;
      window.requestAnimationFrame(function () {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  });

  grid.appendChild(contentStore);
  grid.appendChild(panel);
}());
