(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function renderSearchResults(panel, query) {
    if (typeof movieSearchRecords === 'undefined' || !query) {
      panel.classList.remove('is-open');
      panel.innerHTML = '';
      return;
    }
    var key = normalize(query);
    var matches = movieSearchRecords.filter(function (movie) {
      return normalize(movie.text).indexOf(key) !== -1;
    }).slice(0, 8);
    if (!matches.length) {
      panel.innerHTML = '<div class="empty-result">暂无相关影片</div>';
      panel.classList.add('is-open');
      return;
    }
    panel.innerHTML = matches.map(function (movie) {
      return '<a href="' + movie.url + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
        '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
        '<span>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</span></span>' +
        '</a>';
    }).join('');
    panel.classList.add('is-open');
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupHeaderSearch() {
    qsa('[data-search-form]').forEach(function (form) {
      var input = qs('[data-search-input]', form);
      var panel = qs('[data-search-panel]', form);
      if (!input || !panel) {
        return;
      }
      input.addEventListener('input', function () {
        renderSearchResults(panel, input.value);
      });
      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove('is-open');
        }
      });
    });
  }

  function setupPageFilter() {
    var input = qs('[data-page-filter]');
    var grid = qs('[data-filter-grid]');
    var chips = qsa('[data-filter-chip]');
    if (!grid) {
      return;
    }
    var cards = qsa('.movie-card', grid);
    function applyFilter(value) {
      var key = normalize(value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' '));
        card.classList.toggle('is-hidden', key && text.indexOf(key) === -1);
      });
    }
    if (input) {
      input.addEventListener('input', function () {
        applyFilter(input.value);
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter-chip') || '';
        if (input) {
          input.value = value;
        }
        applyFilter(value);
      });
    });
  }

  function setupVideo() {
    qsa('video[data-video-url]').forEach(function (video) {
      var source = video.getAttribute('data-video-url');
      var box = video.closest('.player-box');
      var button = box ? qs('.player-start', box) : null;
      if (!source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      }
      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener('click', playVideo);
      }
      video.addEventListener('play', function () {
        if (box) {
          box.classList.add('is-playing');
        }
      });
      video.addEventListener('pause', function () {
        if (box) {
          box.classList.remove('is-playing');
        }
      });
    });
  }

  function setupSearchPage() {
    var results = qs('#search-results');
    var title = qs('#search-title');
    var input = qs('[data-main-search]');
    if (!results || typeof movieSearchRecords === 'undefined') {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var key = normalize(query);
    var matches = movieSearchRecords.filter(function (movie) {
      return normalize(movie.text).indexOf(key) !== -1;
    }).slice(0, 120);
    if (title) {
      title.innerHTML = '<div><h2>搜索结果</h2><p>关键词：' + escapeHtml(query) + '</p></div>';
    }
    if (!matches.length) {
      results.innerHTML = '<div class="detail-card"><h2>暂无相关影片</h2><p>可以尝试使用影片名、地区、年份或题材标签继续搜索。</p></div>';
      return;
    }
    results.innerHTML = matches.map(function (movie) {
      return '<article class="movie-card compact">' +
        '<a class="poster-frame" href="' + movie.url + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="play-hover">▶</span><span class="duration">高清</span></a>' +
        '<div class="card-body"><h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.genre) + '</p>' +
        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span></div></div></article>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupHeaderSearch();
    setupPageFilter();
    setupVideo();
    setupSearchPage();
  });
})();
