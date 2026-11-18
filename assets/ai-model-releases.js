(function () {
  'use strict';

  function formatDate(value) {
    var match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return '';
    return Number(match[1]) + '年' + Number(match[2]) + '月' + Number(match[3]) + '日';
  }

  document.querySelectorAll('[data-model-release]').forEach(function (modelElement) {
    var endpoint = modelElement.getAttribute('data-worker-url');
    if (!endpoint) return;

    fetch(endpoint, { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('Model release feed returned ' + response.status);
        return response.json();
      })
      .then(function (release) {
        var date = formatDate(release && release.published_at);
        if (!release || typeof release.model !== 'string' || !date) {
          throw new Error('Model release feed has an unexpected shape');
        }

        modelElement.textContent = release.model + ' · 发布于 ' + date;
      })
      .catch(function () {});
  });
})();
