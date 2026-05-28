(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    show(0);

    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(input) {
    var listing = document.querySelector('[data-listing]');
    var countNode = document.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var keyword = normalize(input.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-title'));
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.classList.toggle('hidden-by-filter', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (countNode) {
      countNode.textContent = visible + ' 部';
    }

    if (listing) {
      listing.setAttribute('data-visible-count', visible);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener('input', function () {
      applyFilter(filterInput);
    });

    applyFilter(filterInput);
  }

  function playVideo(shell) {
    if (shell.dataset.ready === 'true') {
      var readyVideo = shell.querySelector('video');
      shell.classList.add('is-playing');

      if (readyVideo) {
        readyVideo.play().catch(function () {});
      }

      return;
    }

    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-source');

    if (!video || !source) {
      return;
    }

    shell.dataset.ready = 'true';
    shell.classList.add('is-playing');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      shell.hlsPlayer = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
      video.load();
      return;
    }

    video.src = source;
    video.play().catch(function () {});
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var button = shell.querySelector('[data-play-button]');
    var video = shell.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        playVideo(shell);
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === button) {
        return;
      }

      if (!shell.classList.contains('is-playing')) {
        playVideo(shell);
      }
    });

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    }
  });
}());
