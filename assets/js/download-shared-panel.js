(function () {
  'use strict';

  var grid = document.querySelector('.download-accordions');
  if (!grid) return;

  var products = Array.prototype.slice.call(grid.querySelectorAll(':scope > details.download-accordion'));
  if (!products.length) return;

  var contentStore = document.createElement('div');
  contentStore.className = 'download-content-store';
  contentStore.hidden = true;

  var rows = [];
  products.forEach(function (product, index) {
    var rowIndex = Math.floor(index / 2);
    if (!rows[rowIndex]) {
      var panel = document.createElement('div');
      panel.className = 'download-shared-panel';
      panel.id = 'download-shared-panel-' + (rowIndex + 1);
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-label', '本行软件的下载详情');
      panel.hidden = true;
      rows[rowIndex] = { products: [], panel: panel };
    }
    rows[rowIndex].products.push(product);
    product._sharedDownloadRow = rows[rowIndex];
  });

  rows.forEach(function (row) {
    row.products[row.products.length - 1].after(row.panel);
  });

  var activeProduct = null;
  var mobileLayout = window.matchMedia('(max-width: 600px)');

  function placePanel(row, product) {
    if (mobileLayout.matches && product) {
      product.after(row.panel);
    } else {
      row.products[row.products.length - 1].after(row.panel);
    }
  }

  function closeActiveProduct() {
    if (!activeProduct) return;
    var activeRow = activeProduct._sharedDownloadRow;
    activeProduct.open = false;
    activeProduct.querySelector(':scope > summary').setAttribute('aria-expanded', 'false');
    contentStore.appendChild(activeProduct._sharedDownloadContent);
    activeRow.panel.hidden = true;
    activeProduct = null;
  }

  products.forEach(function (product) {
    var summary = product.querySelector(':scope > summary');
    var content = product.querySelector(':scope > section');
    var row = product._sharedDownloadRow;
    if (!summary || !content || !row) return;

    summary.setAttribute('aria-controls', row.panel.id);
    summary.setAttribute('aria-expanded', 'false');
    product._sharedDownloadContent = content;
    contentStore.appendChild(content);

    summary.addEventListener('click', function (event) {
      event.preventDefault();
      var wasActive = activeProduct === product;
      closeActiveProduct();
      if (wasActive) return;

      placePanel(row, product);
      product.open = true;
      summary.setAttribute('aria-expanded', 'true');
      row.panel.appendChild(content);
      row.panel.hidden = false;
      activeProduct = product;
      window.requestAnimationFrame(function () {
        row.panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  });

  window.addEventListener('resize', function () {
    if (activeProduct) placePanel(activeProduct._sharedDownloadRow, activeProduct);
  });

  grid.appendChild(contentStore);
}());
