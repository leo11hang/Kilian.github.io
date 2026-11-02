(function () {
  'use strict';

  document.querySelectorAll('[data-live-download-feed]').forEach(function (panel) {
    if (panel.dataset.liveDownloadInitialized === 'true') return;
    panel.dataset.liveDownloadInitialized = 'true';

    var feedUrl = panel.dataset.liveDownloadFeed;
    var officialUrl = panel.dataset.officialDownloadUrl;
    var status = panel.querySelector('[data-live-download-status]');

    fetch(feedUrl, { headers: { Accept: 'application/json' } })
      .then(function (response) {
        if (!response.ok) throw new Error('下载源返回 ' + response.status);
        return response.json();
      })
      .then(function (feed) {
        var assets = feed.assets || {};
        var updated = 0;
        panel.querySelectorAll('[data-live-asset]').forEach(function (link) {
          var assetUrl = assets[link.dataset.liveAsset];
          if (!assetUrl) {
            if (officialUrl) link.href = officialUrl;
            return;
          }
          link.href = assetUrl;
          updated += 1;
        });

        if (!updated) throw new Error('没有可用的安装包链接');
        if (status) {
          status.textContent = (feed.version ? 'Google Antigravity ' + feed.version + ' · ' : '') +
            '官方安装包地址已同步（每日更新）。';
        }
      })
      .catch(function () {
        panel.querySelectorAll('[data-live-asset]').forEach(function (link) {
          if (officialUrl) link.href = officialUrl;
        });
        if (status) status.textContent = '暂时无法同步直链，请前往 Google 官方下载页获取当前版本。';
      });
  });
}());
