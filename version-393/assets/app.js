document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  initHeroCarousel();
  initFilters();
  initSearchPage();
});

function initHeroCarousel() {
  var hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function activate(index) {
    current = index;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      activate(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5200);
  }
}

function initFilters() {
  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  forms.forEach(function (form) {
    var scope = document.querySelector(form.getAttribute('data-filter-target')) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = document.querySelector(form.getAttribute('data-empty-target'));
    var count = document.querySelector(form.getAttribute('data-count-target'));

    function filter() {
      var keyword = (form.querySelector('[name="keyword"]') || {}).value || '';
      var region = (form.querySelector('[name="region"]') || {}).value || '';
      var year = (form.querySelector('[name="year"]') || {}).value || '';
      var category = (form.querySelector('[name="category"]') || {}).value || '';
      var normalized = keyword.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category
        ].join(' ').toLowerCase();
        var ok = true;

        if (normalized && text.indexOf(normalized) === -1) {
          ok = false;
        }
        if (region && card.dataset.region !== region) {
          ok = false;
        }
        if (year && card.dataset.year !== year) {
          ok = false;
        }
        if (category && card.dataset.category !== category) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    form.addEventListener('input', filter);
    form.addEventListener('change', filter);
    filter();
  });
}

function initSearchPage() {
  var searchRoot = document.querySelector('[data-search-root]');
  if (!searchRoot || !window.movieData) {
    return;
  }

  var input = searchRoot.querySelector('[name="globalKeyword"]');
  var region = searchRoot.querySelector('[name="globalRegion"]');
  var category = searchRoot.querySelector('[name="globalCategory"]');
  var results = searchRoot.querySelector('[data-search-results]');
  var count = searchRoot.querySelector('[data-search-count]');

  function render() {
    var q = (input.value || '').trim().toLowerCase();
    var regionValue = region.value || '';
    var categoryValue = category.value || '';
    var matched = window.movieData.filter(function (movie) {
      var text = [movie.title, movie.region, movie.year, movie.genre, movie.tags.join(' '), movie.categoryName].join(' ').toLowerCase();
      if (q && text.indexOf(q) === -1) {
        return false;
      }
      if (regionValue && movie.region !== regionValue) {
        return false;
      }
      if (categoryValue && movie.categoryName !== categoryValue) {
        return false;
      }
      return true;
    }).slice(0, 120);

    results.innerHTML = matched.map(function (movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-card__cover" href="details/' + movie.id + '.html">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="movie-card__score">' + movie.score + '</span>',
        '  </a>',
        '  <div class="movie-card__body">',
        '    <div class="movie-card__meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '    <h3><a href="details/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-card__desc">' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="movie-card__tags">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>#' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
        '  </div>',
        '</article>'
      ].join('\n');
    }).join('\n');

    count.textContent = '搜索结果 ' + matched.length + ' 部；最多展示前 120 部，可继续输入关键词缩小范围。';
  }

  input.addEventListener('input', render);
  region.addEventListener('change', render);
  category.addEventListener('change', render);
  render();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
