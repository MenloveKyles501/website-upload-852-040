(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (!timer) {
        return;
      }
      window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stopTimer();
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  function setupMovieLists(root) {
    var lists = Array.prototype.slice.call(root.querySelectorAll('[data-movie-list]'));

    lists.forEach(function (list) {
      var scope = list.closest('section') || document;
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var searchInput = scope.querySelector('[data-movie-search]');
      var typeButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-type-filter] button'));
      var sortSelect = scope.querySelector('[data-sort-select]');
      var activeType = 'all';
      var originalCards = cards.slice();

      function cardValue(card, key) {
        return (card.getAttribute(key) || '').toLowerCase();
      }

      function applyFilters() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';

        cards.forEach(function (card) {
          var matchesSearch = !query || cardValue(card, 'data-search').indexOf(query) !== -1;
          var cardType = card.getAttribute('data-type') || '';
          var matchesType = activeType === 'all' || cardType === activeType;
          card.classList.toggle('is-hidden', !(matchesSearch && matchesType));
        });
      }

      function applySort() {
        var sort = sortSelect ? sortSelect.value : 'default';
        var sorted = originalCards.slice();

        if (sort === 'score') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
          });
        }

        if (sort === 'year') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
          });
        }

        if (sort === 'title') {
          sorted.sort(function (a, b) {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
          });
        }

        sorted.forEach(function (card) {
          list.appendChild(card);
        });
        cards = sorted;
        applyFilters();
      }

      if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
      }

      typeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeType = button.getAttribute('data-type') || 'all';
          typeButtons.forEach(function (other) {
            other.classList.toggle('active', other === button);
          });
          applyFilters();
        });
      });

      if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
      }
    });
  }

  setupMovieLists(document);
})();
