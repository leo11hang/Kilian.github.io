(function () {
  'use strict';

  var panel = document.querySelector('.cc-download');
  if (!panel) return;

  // Replace with a Cloudflare Worker URL when one is available.
  var apiUrl = panel.dataset.apiUrl;
  var releaseUrl = panel.dataset.releaseUrl;
  var meta = panel.querySelector('[data-release-meta]');
  var status = panel.querySelector('[data-download-status]');
  var grid = panel.querySelector('[data-platform-grid]');

  function architecture(name) {
    var value = name.toLowerCase();
    if (/(arm64|aarch64|apple.?silicon)/.test(value)) return 'ARM64';
    if (/(x64|x86_64|amd64|64.?bit)/.test(value)) return 'x64';
    if (/(x86|i[3-6]86|32.?bit)/.test(value)) return 'x86';
    return '通用架构';
  }

  function platform(name) {
    var value = name.toLowerCase();
    if (/(\.exe$|\.msi$|\.msix$|windows|win32?)/.test(value)) return 'Windows';
    if (/(\.dmg$|\.pkg$|\.app\.tar\.|macos|macos|darwin|osx)/.test(value)) return 'macOS';
    if (/(\.appimage$|\.deb$|\.rpm$|\.flatpak$|linux)/.test(value)) return 'Linux';
    return null;
  }

  function isInstaller(asset) {
    var name = asset.name.toLowerCase();
    if (!asset.browser_download_url || /(^|[._-])(source|sources|src)([._-]|$)/.test(name)) return false;
    if (/^source code\s*\.(zip|tar\.gz)$/.test(name)) return false;
    return /\.(exe|msi|msix|dmg|pkg|appimage|deb|rpm|flatpak)$/.test(name) || /\.app\.tar\.(gz|zst)$/.test(name);
  }

  function makeCard(asset, os) {
    var card = document.createElement('article');
    card.className = 'cc-platform-card';
    var title = document.createElement('h3');
    title.textContent = os;
    var arch = document.createElement('span');
    arch.className = 'cc-arch';
    arch.textContent = architecture(asset.name);
    var filename = document.createElement('p');
    filename.className = 'cc-asset-name';
    filename.textContent = asset.name;
    var link = document.createElement('a');
    link.className = 'cc-download-button';
    link.href = asset.browser_download_url;
    link.textContent = '下载 ' + os + ' 版';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    card.append(title, arch, filename, link);
    return card;
  }

  fetch(apiUrl, { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (response) {
      if (!response.ok) throw new Error('GitHub API 返回 ' + response.status);
      return response.json();
    })
    .then(function (release) {
      var assets = (release.assets || []).filter(isInstaller);
      var groups = { Windows: [], macOS: [], Linux: [] };
      assets.forEach(function (asset) {
        var os = platform(asset.name);
        if (os) groups[os].push(asset);
      });
      var count = Object.keys(groups).reduce(function (total, os) { return total + groups[os].length; }, 0);
      if (!count) throw new Error('此 Release 暂无可识别的安装包');

      var version = release.tag_name || release.name || '最新版本';
      var published = release.published_at ? new Date(release.published_at) : null;
      meta.textContent = version + (published && !isNaN(published) ? ' · 发布于 ' + published.toLocaleDateString() : '');
      grid.replaceChildren();
      Object.keys(groups).forEach(function (os) {
        groups[os].forEach(function (asset) { grid.appendChild(makeCard(asset, os)); });
      });
      status.textContent = '选择对应系统与架构的安装包；下载地址来自 GitHub 官方 Release。';
      status.classList.add('is-success');
    })
    .catch(function () {
      meta.textContent = '版本信息暂不可用';
      status.textContent = '暂时无法获取下载信息，请稍后重试或前往 GitHub 官方 Release 下载。';
      status.classList.add('is-error');
    });
}());
