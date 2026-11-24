(function () {
  'use strict';

  var platforms = {
    windows: { label: 'Windows', order: 1 },
    macos: { label: 'macOS', order: 2 },
    linux: { label: 'Linux', order: 3 },
    ios: { label: 'iOS', order: 4 },
    android: { label: 'Android', order: 5 },
    tv: { label: 'TV', order: 6 }
  };

  function detectPlatform(link) {
    var label = (link.textContent || '').toLowerCase();
    var source = [link.dataset.liveAsset, link.dataset.grokbotPlatform, link.getAttribute('href')]
      .filter(Boolean).join(' ').toLowerCase();
    var value = label + ' ' + source;

    if (/windows|win32|win64/.test(value)) return 'windows';
    if (/macos|macintosh|darwin|apple\s*芯片|\bmac\b/.test(value)) return 'macos';
    if (/linux/.test(value)) return 'linux';
    if (/\bios\b/.test(value)) return 'ios';
    if (/android/.test(value)) return 'android';
    if (/\btv\b/.test(value)) return 'tv';
    return '';
  }

  function packageVariant(link, fallback) {
    var name = (link.title || '').toLowerCase();
    var value = name + ' ' + (fallback || '').toLowerCase();
    if (/webview2/.test(value)) return '内置 WebView2';
    if (/portable|standalone|便携/.test(value)) return '便携版';
    if (/\.app\.tar\.(gz|zst)|app\.?tar\.?gz/.test(value)) return '应用压缩包';
    if (/\.dmg|\bdmg\b/.test(value)) return 'DMG 安装包';
    if (/\.msix|\bmsix\b/.test(value)) return 'MSIX 安装包';
    if (/\.msi|\bmsi\b/.test(value)) return 'MSI 安装程序';
    if (/\.exe|\bexe\b/.test(value)) return 'EXE 安装程序';
    if (/\.appimage|\bappimage\b/.test(value)) return 'AppImage 安装包';
    if (/\.deb|\bdeb\b/.test(value)) return 'DEB 安装包';
    if (/\.rpm|\brpm\b/.test(value)) return 'RPM 安装包';
    if (/\.flatpak|\bflatpak\b/.test(value)) return 'Flatpak 安装包';
    if (/\.pkg|\bpkg\b/.test(value)) return 'PKG 安装包';
    return '';
  }

  function normalizeLabel(link, key) {
    if (link.dataset.platformLabelNormalized === 'true') return;
    var label = link.textContent || '';
    if (key === 'macos') {
      label = label.replace(/\bARM64\b/gi, 'Apple 芯片').replace(/\bx64\b/gi, 'Intel');
    }
    if (containerHasReleaseOptions(link)) {
      var separator = label.indexOf(' · ');
      if (separator >= 0) {
        var suffix = packageVariant(link, label.slice(separator + 3));
        if (suffix) label = label.slice(0, separator) + ' · ' + suffix;
      }
    }
    if (label !== link.textContent) link.textContent = label;
    link.dataset.platformLabelNormalized = 'true';
  }

  function containerHasReleaseOptions(link) {
    return !!link.closest('.cc-platform-tabs');
  }

  function architectureOrder(link, key) {
    var label = (link.textContent || '').toLowerCase();
    if (key === 'macos') {
      if (/apple|arm64|aarch64/.test(label)) return 1;
      if (/intel|x64/.test(label)) return 2;
      if (/通用|universal/.test(label)) return 3;
    } else if (key === 'windows') {
      if (/x64|amd64/.test(label)) return 1;
      if (/arm64/.test(label)) return 2;
      if (/x86|32 位/.test(label)) return 3;
    } else if (key === 'linux') {
      if (/x64|amd64/.test(label)) return 1;
      if (/arm64/.test(label)) return 2;
      if (/armv7|arm 32|armhf/.test(label)) return 3;
      if (/x86|32 位/.test(label)) return 4;
    }
    return 99;
  }

  function sortPlatformOptions(container) {
    var links = Array.from(container.children).filter(function (child) { return child.tagName === 'A'; });
    if (links.length !== container.children.length) return;
    var order = links.map(function (link, index) {
      var key = detectPlatform(link);
      return { link: link, index: index, platform: key ? platforms[key].order : 99, arch: architectureOrder(link, key) };
    }).sort(function (a, b) {
      return a.platform - b.platform || a.arch - b.arch || a.index - b.index;
    });
    if (order.some(function (entry, index) { return entry.link !== links[index]; })) {
      order.forEach(function (entry) { container.appendChild(entry.link); });
    }
  }

  function setupOptionGroup(container) {
    if (container.dataset.platformLayoutReady === 'true' || !container.parentNode) return;
    container.dataset.platformLayoutReady = 'true';

    var layout = document.createElement('div');
    layout.className = 'download-option-layout';
    if (container.matches('.cc-platform-tabs')) layout.classList.add('download-option-layout-release');
    var legend = document.createElement('aside');
    legend.className = 'download-platform-legend';
    legend.setAttribute('aria-label', '下载按钮颜色对应的操作系统');

    container.parentNode.insertBefore(layout, container);
    layout.append(container, legend);

    function refresh() {
      var links = Array.from(container.querySelectorAll('a'));
      var found = Object.create(null);

      links.forEach(function (link) {
        var key = detectPlatform(link);
        normalizeLabel(link, key);
        link.classList.add('download-platform-button');
        Object.keys(platforms).forEach(function (platform) {
          link.classList.remove('download-platform-' + platform);
        });
        if (!key) return;
        link.classList.add('download-platform-' + key);
        found[key] = true;
      });
      sortPlatformOptions(container);

      var keys = Object.keys(found).sort(function (a, b) {
        return platforms[a].order - platforms[b].order;
      });
      legend.replaceChildren();
      layout.classList.toggle('has-platform-legend', keys.length > 1);
      legend.hidden = keys.length < 2;
      if (keys.length < 2) return;

      var title = document.createElement('strong');
      title.className = 'download-platform-legend-title';
      title.textContent = '系统颜色';
      legend.appendChild(title);

      var list = document.createElement('div');
      list.className = 'download-platform-legend-list';
      keys.forEach(function (key) {
        var item = document.createElement('span');
        item.className = 'download-platform-legend-item download-platform-' + key;
        var dot = document.createElement('i');
        dot.setAttribute('aria-hidden', 'true');
        var label = document.createElement('span');
        label.textContent = platforms[key].label;
        item.append(dot, label);
        list.appendChild(item);
      });
      legend.appendChild(list);
    }

    refresh();
    new MutationObserver(refresh).observe(container, { childList: true, subtree: true });
  }

  document.querySelectorAll('.ai-download-options, .cc-platform-tabs, .uu-platform-grid')
    .forEach(setupOptionGroup);
}());
