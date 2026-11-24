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
  var scriptUrl = document.currentScript && document.currentScript.src;
  var platformLogoRoot = scriptUrl
    ? new URL('../images/platform-logos/', scriptUrl)
    : new URL('/assets/images/platform-logos/', document.baseURI);

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

  function platformIcon(key) {
    var files = { windows: 'windows.png', macos: 'macos.svg', linux: 'linux.svg' };
    if (!files[key]) return null;

    var image = document.createElement('img');
    image.src = new URL(files[key], platformLogoRoot).href;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    image.classList.add('download-platform-icon', 'download-platform-icon-' + key);
    return image;
  }

  function normalizeLabel(link, key) {
    if (link.dataset.platformLabelNormalized === 'true') return;
    var label = link.textContent || '';
    if (key === 'macos') {
      label = label.replace(/\bARM64\b/gi, 'Apple 芯片').replace(/\bx64\b/gi, 'Intel');
    }
    if (link.closest('.cc-platform-tabs')) {
      var separator = label.indexOf(' · ');
      if (separator >= 0) {
        var suffix = packageVariant(link, label.slice(separator + 3));
        if (suffix) label = label.slice(0, separator) + ' · ' + suffix;
      }
    }
    if (label !== link.textContent) link.textContent = label;
    link.dataset.platformLabelNormalized = 'true';
  }

  function packageVariant(link, fallback) {
    var value = ((link.title || '') + ' ' + (fallback || '')).toLowerCase();
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

  function sortOptions(container) {
    var links = Array.from(container.children).filter(function (child) { return child.tagName === 'A'; });
    if (links.length !== container.children.length) return;
    var sorted = links.map(function (link, index) {
      var key = detectPlatform(link);
      return { link: link, index: index, platform: key ? platforms[key].order : 99, arch: architectureOrder(link, key) };
    }).sort(function (a, b) {
      return a.platform - b.platform || a.arch - b.arch || a.index - b.index;
    });
    if (sorted.some(function (entry, index) { return entry.link !== links[index]; })) {
      sorted.forEach(function (entry) { container.appendChild(entry.link); });
    }
  }

  function applyPlatformIcon(link, key) {
    if (!key || link.dataset.platformIconAdded === 'true') return;
    var icon = platformIcon(key);
    if (!icon) return;

    var existingIcon = link.querySelector('.uu-platform-icon');
    if (existingIcon) existingIcon.replaceChildren(icon);
    else link.prepend(icon);
    link.classList.add('download-platform-button', 'download-platform-' + key);
    link.dataset.platformIconAdded = 'true';
  }

  function setupOptionGroup(container) {
    if (container.dataset.platformIconsReady === 'true') return;
    container.dataset.platformIconsReady = 'true';

    function refresh() {
      Array.from(container.querySelectorAll('a')).forEach(function (link) {
        var key = detectPlatform(link);
        normalizeLabel(link, key);
        applyPlatformIcon(link, key);
      });
      sortOptions(container);
    }

    refresh();
    new MutationObserver(refresh).observe(container, { childList: true, subtree: true });
  }

  document.querySelectorAll('.ai-download-options, .cc-platform-tabs, .uu-platform-grid')
    .forEach(setupOptionGroup);
}());
