(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var carousel = document.querySelector('[data-hero-carousel]');
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
            var current = 0;
            var timer = null;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            }

            function startTimer() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    var index = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
                    showSlide(index);
                    startTimer();
                });
            });

            startTimer();
        }

        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q') || '';
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-catalog-search]'));
        searchInputs.forEach(function (input) {
            if (queryValue && !input.value) {
                input.value = queryValue;
            }
        });

        var catalogGrid = document.querySelector('[data-catalog-grid]');
        if (catalogGrid) {
            var cards = Array.prototype.slice.call(catalogGrid.querySelectorAll('.movie-card'));
            var input = document.querySelector('[data-catalog-search]');
            var typeFilter = document.querySelector('[data-filter-type]');
            var regionFilter = document.querySelector('[data-filter-region]');
            var categoryFilter = document.querySelector('[data-filter-category]');

            function normalize(value) {
                return (value || '').toString().trim().toLowerCase();
            }

            function applyFilters() {
                var term = normalize(input ? input.value : '');
                var type = normalize(typeFilter ? typeFilter.value : '');
                var region = normalize(regionFilter ? regionFilter.value : '');
                var category = normalize(categoryFilter ? categoryFilter.value : '');

                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute('data-search'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardCategory = normalize(card.getAttribute('data-category'));
                    var matched = true;

                    if (term && searchText.indexOf(term) === -1) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (region && cardRegion !== region) {
                        matched = false;
                    }
                    if (category && cardCategory !== category) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden', !matched);
                });
            }

            [input, typeFilter, regionFilter, categoryFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilters);
                    control.addEventListener('change', applyFilters);
                }
            });

            applyFilters();
        }
    });
})();
