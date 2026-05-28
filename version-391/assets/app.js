(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupImageFallbacks() {
        document.querySelectorAll("img[data-fallback-title]").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-fallback-hidden");
                image.setAttribute("aria-label", image.getAttribute("data-fallback-title") || "poster");
            }, { once: true });
        });
    }

    function setupHero() {
        if (!window.HERO_ITEMS || !Array.isArray(window.HERO_ITEMS) || window.HERO_ITEMS.length === 0) {
            return;
        }
        var items = window.HERO_ITEMS;
        var index = 0;
        var title = document.querySelector("[data-hero-title]");
        var description = document.querySelector("[data-hero-description]");
        var meta = document.querySelector("[data-hero-meta]");
        var background = document.querySelector("[data-hero-background]");
        var link = document.querySelector("[data-hero-link]");
        var posterLink = document.querySelector("[data-hero-poster-link]");
        var posterImage = document.querySelector(".hero-poster-image");
        var score = document.querySelector("[data-hero-score]");
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

        function render(nextIndex) {
            index = (nextIndex + items.length) % items.length;
            var item = items[index];
            if (title) {
                title.textContent = item.title;
            }
            if (description) {
                description.textContent = item.oneLine;
            }
            if (meta) {
                meta.textContent = item.meta;
            }
            if (background) {
                background.style.backgroundImage = "url('" + item.cover + "')";
            }
            if (link) {
                link.href = item.url;
            }
            if (posterLink) {
                posterLink.href = item.url;
            }
            if (posterImage) {
                posterImage.src = item.cover;
                posterImage.alt = item.title + " 海报";
                posterImage.classList.remove("image-fallback-hidden");
            }
            if (score) {
                score.textContent = item.score;
            }
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                render(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        window.setInterval(function () {
            render(index + 1);
        }, 5200);
    }

    function setupLocalFilters() {
        document.querySelectorAll("[data-filter-toolbar]").forEach(function (toolbar) {
            var scope = toolbar.closest(".site-container") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var input = toolbar.querySelector("[data-filter-search]");
            var year = toolbar.querySelector("[data-filter-year]");
            var region = toolbar.querySelector("[data-filter-region]");
            var reset = toolbar.querySelector("[data-filter-reset]");
            var status = scope.querySelector("[data-filter-status]");

            function apply() {
                var query = normalize(input && input.value);
                var selectedYear = year ? year.value : "";
                var selectedRegion = region ? region.value : "";
                var count = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardRegion = card.getAttribute("data-region") || "";
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }
                    if (selectedRegion && cardRegion !== selectedRegion) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        count += 1;
                    }
                });
                if (status) {
                    status.textContent = "显示 " + count + " 部内容";
                }
            }

            [input, year, region].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag-badge">' + escapeHtml(tag) + '</span>';
        }).join("");
        return '' +
            '<article class="movie-card group">' +
                '<a href="' + escapeHtml(movie.url) + '" class="movie-poster-link" aria-label="查看 ' + escapeHtml(movie.title) + '">' +
                    '<span class="poster-frame">' +
                        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" class="poster-image" data-fallback-title="' + escapeHtml(movie.title) + '">' +
                        '<span class="poster-gradient"></span>' +
                        '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
                        '<span class="poster-play">▶</span>' +
                    '</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<h3 class="movie-card-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p class="movie-meta">' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year) + '</p>' +
                    '<p class="movie-line">' + escapeHtml(movie.oneLine || '') + '</p>' +
                    '<div class="movie-tags">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupGlobalSearch() {
        var grid = document.querySelector("[data-search-results]");
        if (!grid || !window.MOVIE_DATA) {
            return;
        }
        var input = document.querySelector("[data-global-search]");
        var year = document.querySelector("[data-global-year]");
        var region = document.querySelector("[data-global-region]");
        var reset = document.querySelector("[data-global-reset]");
        var status = document.querySelector("[data-global-status]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function render() {
            var query = normalize(input && input.value);
            var selectedYear = year ? year.value : "";
            var selectedRegion = region ? region.value : "";
            var matches = window.MOVIE_DATA.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(" "),
                    movie.oneLine
                ].join(" "));
                if (query && text.indexOf(query) === -1) {
                    return false;
                }
                if (selectedYear && String(movie.year) !== selectedYear) {
                    return false;
                }
                if (selectedRegion && movie.region !== selectedRegion) {
                    return false;
                }
                return true;
            });
            var shown = matches.slice(0, 120);
            grid.innerHTML = shown.map(movieCardTemplate).join("");
            setupImageFallbacks();
            if (status) {
                status.textContent = "找到 " + matches.length + " 部内容，当前显示 " + shown.length + " 部";
            }
        }

        [input, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", render);
                control.addEventListener("change", render);
            }
        });
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                if (year) {
                    year.value = "";
                }
                if (region) {
                    region.value = "";
                }
                render();
            });
        }
        render();
    }

    function setupPlayers() {
        document.querySelectorAll("[data-video-stage]").forEach(function (stage) {
            var video = stage.querySelector("video[data-src]");
            var button = stage.querySelector("[data-play-button]");
            if (!video || !button) {
                return;
            }
            var initialized = false;
            function start() {
                if (!initialized) {
                    initialized = true;
                    var source = video.getAttribute("data-src");
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                    } else {
                        video.src = source;
                    }
                }
                button.classList.add("is-hidden");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            }
            button.addEventListener("click", start);
            stage.addEventListener("dblclick", start);
        });
    }

    ready(function () {
        setupMobileMenu();
        setupImageFallbacks();
        setupHero();
        setupLocalFilters();
        setupGlobalSearch();
        setupPlayers();
    });
}());
