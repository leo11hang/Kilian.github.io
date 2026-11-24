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

  function setupOptionGroup(container) {
    if (container.dataset.platformLayoutReady === 'true' || !container.parentNode) return;
    container.dataset.platformLayoutReady = 'true';

    var layout = document.createElement('div');
    layout.className = 'download-option-layout';
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
        link.classList.add('download-platform-button');
        Object.keys(platforms).forEach(function (platform) {
          link.classList.remove('download-platform-' + platform);
        });
        if (!key) return;
        link.classList.add('download-platform-' + key);
        found[key] = true;
      });

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
