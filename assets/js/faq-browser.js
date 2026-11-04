(function () {
  'use strict';

  document.querySelectorAll('[data-faq-browser]').forEach(function (browser) {
    var items = Array.prototype.slice.call(browser.querySelectorAll('[data-faq-item]'));
    var search = browser.querySelector('[data-faq-search-input]');
    var clear = browser.querySelector('[data-faq-clear]');
    var topics = Array.prototype.slice.call(browser.querySelectorAll('[data-faq-topic]'));
    var count = browser.querySelector('[data-faq-result-count]');
    var empty = browser.querySelector('[data-faq-empty]');
    var more = browser.querySelector('[data-faq-more]');
    var topicGuide = browser.querySelector('[data-faq-guide-topic]');
    var selectedTopic = 'all';
    var pageSize = 12;
    var visibleLimit = pageSize;

    function closeOpenItems(except) {
      items.forEach(function (item) {
        if (item !== except && item.open) item.open = false;
      });
    }

    function update(resetLimit) {
      if (resetLimit) visibleLimit = pageSize;
      var term = search ? search.value.trim().toLocaleLowerCase() : '';
      var matches = items.filter(function (item) {
        var topicMatch = selectedTopic === 'all' || item.getAttribute('data-faq-topic-value') === selectedTopic;
        var textMatch = !term || (item.getAttribute('data-faq-search') || '').toLocaleLowerCase().indexOf(term) !== -1;
        return topicMatch && textMatch;
      });

      items.forEach(function (item) {
        var index = matches.indexOf(item);
        var shouldShow = index !== -1 && index < visibleLimit;
        item.hidden = !shouldShow;
        if (!shouldShow && item.open) item.open = false;
      });

      if (count) {
        count.textContent = term || selectedTopic !== 'all'
          ? '找到 ' + matches.length + ' 个问题'
          : '共 ' + matches.length + ' 个问题';
      }
      if (empty) empty.hidden = matches.length !== 0;
      if (topicGuide) {
        topicGuide.hidden = selectedTopic !== topicGuide.getAttribute('data-faq-guide-topic') || matches.length === 0;
      }
      if (more) {
        more.hidden = matches.length <= visibleLimit;
        more.textContent = matches.length > visibleLimit
          ? '显示更多问题（还有 ' + (matches.length - visibleLimit) + ' 个）'
          : '显示更多问题';
      }
      if (clear && search) clear.hidden = search.value.length === 0;
    }

    if (!items.length) {
      if (empty) empty.hidden = false;
      return;
    }

    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (item.open) closeOpenItems(item);
      });
    });
    if (search) search.addEventListener('input', function () { update(true); });
    if (clear && search) {
      clear.addEventListener('click', function () {
        search.value = '';
        search.focus();
        update(true);
      });
    }
    topics.forEach(function (button) {
      button.addEventListener('click', function () {
        selectedTopic = button.getAttribute('data-faq-topic') || 'all';
        topics.forEach(function (topicButton) {
          var active = topicButton === button;
          topicButton.classList.toggle('is-active', active);
          topicButton.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        closeOpenItems(null);
        update(true);
      });
    });
    if (more) more.addEventListener('click', function () {
      visibleLimit += pageSize;
      update(false);
    });

    update(false);
  });

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-copy-url]');
    if (!button) return;

    var value = button.getAttribute('data-copy-url');
    var status = button.parentNode.querySelector('.faq-google-copy-status');
    var copyText = function () {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(value);
      var field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      var copied = document.execCommand('copy');
      document.body.removeChild(field);
      return copied ? Promise.resolve() : Promise.reject(new Error('copy failed'));
    };

    copyText().then(function () {
      if (status) status.textContent = '已复制';
    }).catch(function () {
      if (status) status.textContent = '复制失败，请手动复制链接';
    });
  });
})();
