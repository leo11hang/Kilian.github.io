(function () {
  'use strict';

  var panel = document.querySelector('.grokbot-download-content');
  if (!panel || panel.dataset.grokbotInitialized === 'true') return;
  panel.dataset.grokbotInitialized = 'true';

  var feedUrl = panel.dataset.grokbotFeedUrl;
  var upstreamBase = panel.dataset.grokbotUpstreamBase;
  var fallbackUrl = panel.dataset.grokbotFallback || 'https://x.ai/bot';
  var versionNode = panel.querySelector('[data-grokbot-version]');
  var statusNode = panel.querySelector('[data-grokbot-status]');
  var links = Array.prototype.slice.call(panel.querySelectorAll('[data-grokbot-platform][data-grokbot-field]'));
  var platforms = Array.from(new Set(links.map(function (link) { return link.dataset.grokbotPlatform; })));

  links.forEach(function (link) { link.href = fallbackUrl; });

  function fetchJson(url) {
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (response) {
      if (!response.ok) throw new Error('Feed returned ' + response.status);
      return response.json();
    });
  }

  function loadFeeds() {
    return fetchJson(feedUrl).then(function (result) {
      if (!result || !result.feeds) throw new Error('Worker returned no platform feeds');
      return result.feeds;
    }).catch(function () {
      return Promise.all(platforms.map(function (platform) {
        return fetchJson(upstreamBase + encodeURIComponent(platform) + '/sand')
          .then(function (feed) { return [platform, feed]; })
          .catch(function () { return [platform, null]; });
      })).then(function (entries) {
        return entries.reduce(function (result, entry) {
          result[entry[0]] = entry[1];
          return result;
        }, Object.create(null));
      });
    });
  }

  loadFeeds().then(function (feeds) {
    var directLinks = 0;
    var versions = [];

    links.forEach(function (link) {
      var feed = feeds[link.dataset.grokbotPlatform];
      var value = feed && feed[link.dataset.grokbotField];
      if (typeof value !== 'string' || !value) return;

      try {
        var url = new URL(value);
        if (url.protocol !== 'https:' || url.hostname !== 'downloads.cursor.com') return;
        link.href = url.href;
        directLinks += 1;
      } catch (error) {
        return;
      }
    });

    platforms.forEach(function (platform) {
      var feed = feeds[platform];
      if (feed && feed.version && versions.indexOf(feed.version) === -1) versions.push(feed.version);
    });

    if (versionNode) {
      versionNode.textContent = versions.length
        ? 'Grok Bot ' + versions[0] + ' · 当前稳定版'
        : 'Grok Bot · 官方版本信息暂不可用';
    }
    if (statusNode) {
      var allFeedsAvailable = platforms.every(function (platform) { return !!feeds[platform]; });
      statusNode.textContent = allFeedsAvailable && directLinks === links.length
        ? '已同步官方当前版本的各平台安装包。'
        : '部分安装包地址暂不可用；点击对应平台可前往 Grok Bot 官方下载页。';
    }
  });
}());
