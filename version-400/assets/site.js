(function () {
  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.getElementById('menuToggle');
    var nav = document.getElementById('mobileNav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = parseInt(dot.getAttribute('data-slide-to'), 10);
        if (!Number.isNaN(target)) {
          show(target);
          start();
        }
      });
    });
    var slider = document.querySelector('.hero-slider');
    if (slider) {
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
    }
    start();
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));
    var searchInput = document.getElementById('siteSearch');
    var genreSelect = document.getElementById('genreFilter');
    var yearSelect = document.getElementById('yearFilter');
    var categorySelect = document.getElementById('categoryFilter');
    var result = document.getElementById('filterResult');
    if (!cards.length || !searchInput) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      searchInput.value = q;
    }
    function apply() {
      var query = normalize(searchInput.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardGenre = normalize(card.getAttribute('data-genre'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var ok = true;
        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (genre && cardGenre.indexOf(genre) === -1) {
          ok = false;
        }
        if (year && cardYear !== year) {
          ok = false;
        }
        if (category && cardCategory !== category) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (result) {
        result.textContent = '显示 ' + visible + ' 部';
      }
    }
    ['input', 'change'].forEach(function (eventName) {
      searchInput.addEventListener(eventName, apply);
      if (genreSelect) {
        genreSelect.addEventListener(eventName, apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener(eventName, apply);
      }
      if (categorySelect) {
        categorySelect.addEventListener(eventName, apply);
      }
    });
    apply();
  }

  function setupPlayers() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll('.player-block'));
    blocks.forEach(function (block) {
      var video = block.querySelector('video');
      var button = block.querySelector('.play-button');
      var source = block.getAttribute('data-video-url');
      var hlsInstance = null;
      if (!video || !button || !source) {
        return;
      }
      function loadSource() {
        if (video.getAttribute('data-loaded') === 'true') {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
        video.setAttribute('data-loaded', 'true');
      }
      function play() {
        loadSource();
        block.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            block.classList.remove('is-playing');
          });
        }
      }
      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        block.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          block.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });
})();
