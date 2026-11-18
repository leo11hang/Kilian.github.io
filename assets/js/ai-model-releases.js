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

    var content = modelElement.closest('.ai-tools-content');
    var statusElement = content && content.querySelector('[data-model-status]');
    var sourceLink = content && content.querySelector('[data-model-release-link]');

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
        if (sourceLink && typeof release.url === 'string' && /^https:\/\//i.test(release.url)) {
          sourceLink.href = release.url;
        }
        if (statusElement) statusElement.firstChild.textContent = '旗舰模型与发布日期每日同步自官方公告。';
      })
      .catch(function () {
        if (statusElement) {
          statusElement.firstChild.textContent = '暂时无法刷新模型信息，当前保留最近同步的数据。';
        }
      });
  });
})();
