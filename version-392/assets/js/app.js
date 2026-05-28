(function () {
  var header = document.querySelector('[data-site-header]');
  var button = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  if (button && mobileNav) {
    button.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(active - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(active + 1);
      restartHero();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
      restartHero();
    });
  });

  showSlide(0);
  startHero();

  var homeSearch = document.querySelector('[data-home-search]');
  if (homeSearch) {
    homeSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = homeSearch.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var url = './search.html';
      if (query) {
        url += '?q=' + encodeURIComponent(query);
      }
      window.location.href = url;
    });
  }

  function textOf(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupSearch(scope) {
    var search = scope.querySelector('[data-site-search], [data-local-search]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
    var filters = Array.prototype.slice.call(scope.querySelectorAll('[data-site-filter], [data-local-filter]'));
    if (!search && !filters.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial && search) {
      search.value = initial;
    }

    function apply() {
      var query = textOf(search ? search.value : '');
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ').toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        filters.forEach(function (filter) {
          var key = filter.getAttribute('data-site-filter') || filter.getAttribute('data-local-filter');
          var value = textOf(filter.value);
          if (value && textOf(card.getAttribute('data-' + key)) !== value) {
            matched = false;
          }
        });
        card.classList.toggle('is-filtered-out', !matched);
      });
    }

    if (search) {
      search.addEventListener('input', apply);
    }
    filters.forEach(function (filter) {
      filter.addEventListener('change', apply);
    });
    apply();
  }

  setupSearch(document);
})();
