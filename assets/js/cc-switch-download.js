(function () {
  'use strict';

  document.querySelectorAll('.download-accordion').forEach(function (accordion) {
    accordion.addEventListener('toggle', function () {
      if (!accordion.open) return;
      document.querySelectorAll('.download-accordion[open]').forEach(function (other) {
        if (other !== accordion) other.open = false;
      });
    });
  });

  document.querySelectorAll('.cc-download').forEach(function (panel) {
  if (panel.dataset.initialized === 'true') return;
  panel.dataset.initialized = 'true';

  // Replace with a Cloudflare Worker URL when one is available.
  var apiUrl = panel.dataset.apiUrl;
  var workerUrl = (panel.dataset.workerUrl || '').trim();
  var releaseUrl = panel.dataset.releaseUrl;
  var meta = panel.querySelector('[data-release-meta]');
  var status = panel.querySelector('[data-download-status]');
  var tabs = panel.querySelector('[data-platform-tabs]');
  var grid = panel.querySelector('[data-platform-grid]');

  function architecture(name) {
    var value = name.toLowerCase();
    if (/(arm64|aarch64|apple.?silicon)/.test(value)) return 'ARM64';
    if (/(armv7|armhf|armhfp)/.test(value)) return 'ARMv7';
    if (/(x64|x86_64|amd64|64.?bit)/.test(value)) return 'x64';
    if (/(x86|i[3-6]86|32.?bit)/.test(value)) return 'x86';
    return '通用架构';
  }

  function platform(name) {
    var value = name.toLowerCase();
    if (/(\.exe$|\.msi$|\.msix$|windows|win32?)/.test(value)) return 'Windows';
    if (/(\.dmg$|\.pkg$|\.app\.tar\.|macos|darwin|osx)/.test(value)) return 'macOS';
    if (/(\.appimage$|\.deb$|\.rpm$|\.flatpak$|linux)/.test(value)) return 'Linux';
    return null;
  }

  function isInstaller(asset) {
    var name = asset.name.toLowerCase();
    if (!asset.browser_download_url || /(^|[._-])(source|sources|src)([._-]|$)/.test(name)) return false;
    if (/^source code\s*\.(zip|tar\.gz)$/.test(name)) return false;
    return /\.(exe|msi|msix|dmg|pkg|appimage|deb|rpm|flatpak)$/.test(name) || /\.app\.tar\.(gz|zst)$/.test(name);
  }

  function packageFormat(name) {
    var match = name.match(/\.(app\.tar\.(?:gz|zst)|appimage|deb|rpm|flatpak|dmg|pkg|msi|msix|exe)$/i);
    return match ? match[1].toUpperCase() : '安装包';
  }

  function packageVariant(name) {
    if (/webview2/i.test(name)) return 'WebView2 版';
    if (/portable|standalone/i.test(name)) return '便携版';
    if (/fixed|bundled|bundle/i.test(name)) return '完整包';
    if (/setup|installer/i.test(name)) return '安装包';
    return packageFormat(name);
  }

  function fetchRelease(url) {
    return fetch(url, { headers: { Accept: 'application/vnd.github+json' } }).then(function (response) {
      if (!response.ok) throw new Error('Release API 返回 ' + response.status);
      return response.json();
    });
  }

  (workerUrl ? fetchRelease(workerUrl).catch(function () { return fetchRelease(apiUrl); }) : fetchRelease(apiUrl))
    .then(function (release) {
      var assets = (release.assets || []).filter(isInstaller);
      var entries = assets.map(function (asset) {
        var os = platform(asset.name);
        if (!os) return null;
        var arch = architecture(asset.name);
        return { asset: asset, os: os, arch: arch, baseLabel: os + ' ' + (arch === '通用架构' ? '通用版' : arch) };
      }).filter(Boolean);
      if (!entries.length) throw new Error('此 Release 暂无可识别的安装包');

      var labelCounts = {};
      var variantCounts = {};
      entries.forEach(function (entry) {
        labelCounts[entry.baseLabel] = (labelCounts[entry.baseLabel] || 0) + 1;
        entry.variantLabel = packageVariant(entry.asset.name);
        var variantKey = entry.baseLabel + '|' + entry.variantLabel;
        variantCounts[variantKey] = (variantCounts[variantKey] || 0) + 1;
      });

      var version = release.tag_name || release.name || '最新版本';
      var published = release.published_at ? new Date(release.published_at) : null;
      var publishedText = published && !isNaN(published)
        ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(published)
        : '';
      meta.textContent = version + (publishedText ? ' · 发布于 ' + publishedText : '');
      tabs.replaceChildren();
      grid.replaceChildren();
      grid.hidden = true;
      var renderedVariants = {};
      entries.forEach(function (entry) {
        var link = document.createElement('a');
        link.className = 'cc-download-option';
        link.href = entry.asset.browser_download_url;
        link.title = entry.asset.name;
        link.setAttribute('aria-label', entry.baseLabel + '，下载 ' + entry.asset.name);

        var label = entry.baseLabel;
        if (labelCounts[entry.baseLabel] > 1) {
          label += ' · ' + entry.variantLabel;
          var variantKey = entry.baseLabel + '|' + entry.variantLabel;
          if (variantCounts[variantKey] > 1) {
            renderedVariants[variantKey] = (renderedVariants[variantKey] || 0) + 1;
            label += ' ' + renderedVariants[variantKey];
          }
        }
        link.textContent = label;
        tabs.appendChild(link);
      });
      status.textContent = '选择对应系统与架构的安装包；下载地址来自 GitHub 官方 Release。';
      status.classList.add('is-success');
    })
    .catch(function () {
      meta.textContent = '版本信息暂不可用';
      status.textContent = '暂时无法获取下载信息，请稍后重试或前往 GitHub 官方 Release 下载。';
      status.classList.add('is-error');
    });
  });
}());
