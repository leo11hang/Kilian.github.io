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
  var svgNamespace = 'http://www.w3.org/2000/svg';

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

  function createSvg(key, viewBox, paths) {
    var svg = document.createElementNS(svgNamespace, 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('download-platform-icon', 'download-platform-icon-' + key);
    paths.forEach(function (definition) {
      var shape = document.createElementNS(svgNamespace, definition.tag || 'path');
      Object.keys(definition).forEach(function (attribute) {
        if (attribute !== 'tag') shape.setAttribute(attribute, definition[attribute]);
      });
      svg.appendChild(shape);
    });
    return svg;
  }

  function platformIcon(key) {
    if (key === 'windows') {
      return createSvg('windows', '0 0 24 24', [
        { d: 'M2 4.2 10.7 3v8H2V4.2Zm10.3-1.4L22 1.4V11h-9.7V2.8ZM2 12.8h8.7v8L2 19.5v-6.7Zm10.3 0H22v9.8l-9.7-1.4v-8.4Z' }
      ]);
    }
    if (key === 'macos') {
      return createSvg('macos', '0 0 384 512', [
        { d: 'M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-27-47.2-41.8-85.2-44.7-36-2.8-75.4 21.1-89.8 21.1-15.2 0-50.1-20.1-77.5-20.1C59 141.6 0 184.4 0 274.2c0 26.5 4.9 53.9 14.8 82.1 13.2 37 60.7 127.7 74.5 127.7 18.7 0 33.4-4 44.2-20.4 9.9-15.1 23.2-22.7 40-22.7 17.8 0 31.1 7.6 40 22.7 11.5 16.6 26.4 23.2 44.7 20.4 55-9 99.1-65 114.5-116.3-69.2-32.6-94-93-94-154.3zM258.9 95c27.6-34.6 25.1-66.4 24.4-78.6-24.5 1.4-52.9 17.4-69 36-17.8 19.8-28.2 44.4-26.2 70.9 26.5 2 51.1-11.1 70.8-28.3z' }
      ]);
    }
    if (key === 'linux') {
      return createSvg('linux', '4 0 56 64', [
        { d: 'M16 29c-5 1-9 6-10 12-1 5 1 9 5 10 4 1 7-3 10-7l4-7-9-8Zm32 0c5 1 9 6 10 12 1 5-1 9-5 10-4 1-7-3-10-7l-4-7 9-8Z', fill: '#202124' },
        { tag: 'ellipse', cx: '32', cy: '39', rx: '19', ry: '23', fill: '#202124' },
        { tag: 'ellipse', cx: '32', cy: '43', rx: '11', ry: '16', fill: '#fff' },
        { tag: 'ellipse', cx: '32', cy: '16', rx: '14', ry: '14', fill: '#202124' },
        { tag: 'ellipse', cx: '26.5', cy: '14.5', rx: '4', ry: '5', fill: '#fff' },
        { tag: 'ellipse', cx: '37.5', cy: '14.5', rx: '4', ry: '5', fill: '#fff' },
        { tag: 'circle', cx: '27.5', cy: '15.5', r: '1.8', fill: '#202124' },
        { tag: 'circle', cx: '36.5', cy: '15.5', r: '1.8', fill: '#202124' },
        { d: 'm25 22 7 6 7-6-7-2-7 2Z', fill: '#f4b400' },
        { d: 'M17 58c5-2 10-2 15 0l-2 5H14l3-5Zm30 0c-5-2-10-2-15 0l2 5h16l-3-5Z', fill: '#f4b400' }
      ]);
    }
    return null;
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
