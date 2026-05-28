(function () {
  'use strict';

  var searchCache = null;

  function rootPrefix() {
    return document.body.getAttribute('data-root-prefix') || '';
  }

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function closeSearchBoxes() {
    qsa('[data-search-results]').forEach(function (box) {
      box.classList.remove('open');
    });
  }

  function loadSearchIndex() {
    if (searchCache) {
      return Promise.resolve(searchCache);
    }

    return fetch(rootPrefix() + 'assets/search-index.json')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('search index load failed');
        }
        return response.json();
      })
      .then(function (data) {
        searchCache = data;
        return data;
      })
      .catch(function () {
        return [];
      });
  }

  function renderSearchResults(input) {
    var keyword = input.value.trim().toLowerCase();
    var wrapper = input.parentElement.querySelector('[data-search-results]') || qs('[data-search-results]');

    if (!wrapper || keyword.length < 2) {
      if (wrapper) {
        wrapper.classList.remove('open');
        wrapper.innerHTML = '';
      }
      return;
    }

    loadSearchIndex().then(function (items) {
      var results = items.filter(function (item) {
        return item.searchText.indexOf(keyword) !== -1;
      }).slice(0, 12);

      if (!results.length) {
        wrapper.innerHTML = '<div class="search-result-item"><strong>未找到相关影片</strong><span>请尝试更换片名、地区或题材关键词。</span></div>';
        wrapper.classList.add('open');
        return;
      }

      wrapper.innerHTML = results.map(function (item) {
        return [
          '<a class="search-result-item" href="' + rootPrefix() + item.href + '">',
          '<strong>' + escapeHtml(item.title) + '</strong>',
          '<span>' + escapeHtml(item.region + ' · ' + item.type + ' · ' + item.year + ' · ' + item.category) + '</span>',
          '</a>'
        ].join('');
      }).join('');
      wrapper.classList.add('open');
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupGlobalSearch() {
    qsa('[data-search-input]').forEach(function (input) {
      input.addEventListener('input', function () {
        renderSearchResults(input);
      });

      input.addEventListener('focus', function () {
        renderSearchResults(input);
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.header-search') && !event.target.closest('.home-search-box')) {
        closeSearchBoxes();
      }
    });
  }

  function setupHero() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  function setupLocalFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-filter-grid]');
    if (!panel || !grid) {
      return;
    }

    var controls = qsa('[data-local-filter]', panel);
    var cards = qsa('[data-title]', grid);
    var count = qs('[data-filter-count]', panel);

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var criteria = {};
      controls.forEach(function (control) {
        criteria[control.getAttribute('data-local-filter')] = normalize(control.value);
      });

      var visible = 0;
      cards.forEach(function (card) {
        var title = normalize(card.getAttribute('data-title'));
        var region = normalize(card.getAttribute('data-region'));
        var type = normalize(card.getAttribute('data-type'));
        var year = normalize(card.getAttribute('data-year'));
        var haystack = title + ' ' + region + ' ' + type + ' ' + year;
        var matched = true;

        if (criteria.search && haystack.indexOf(criteria.search) === -1) {
          matched = false;
        }
        if (criteria.region && region !== criteria.region) {
          matched = false;
        }
        if (criteria.type && type !== criteria.type) {
          matched = false;
        }
        if (criteria.year && year !== criteria.year) {
          matched = false;
        }

        card.classList.toggle('hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visible + ' 部';
      }
    }

    controls.forEach(function (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });
  }

  function setupPlayer() {
    qsa('[data-player-shell]').forEach(function (shell) {
      var video = qs('video[data-hls-src]', shell);
      var button = qs('[data-play-button]', shell);
      var status = qs('[data-player-status]', shell);
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function playVideo() {
        var source = video.getAttribute('data-hls-src');
        if (!source) {
          setStatus('未找到可用播放源。');
          return;
        }

        shell.classList.add('playing');
        video.setAttribute('controls', 'controls');
        setStatus('正在加载 HLS 播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setStatus('浏览器阻止自动播放，请再次点击播放。');
            });
            setStatus('播放源加载完成。');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请稍后重试。');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {
              setStatus('浏览器阻止自动播放，请再次点击播放。');
            });
            setStatus('播放源加载完成。');
          }, { once: true });
        } else {
          setStatus('当前浏览器不支持 HLS 播放。');
        }
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
    });
  }

  function setupMobileNav() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-main-nav]');
    var search = qs('.header-search');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      if (search) {
        search.classList.toggle('open');
      }
    });
  }

  function setupImageFallbacks() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupGlobalSearch();
    setupHero();
    setupLocalFilters();
    setupPlayer();
    setupImageFallbacks();
  });
})();
