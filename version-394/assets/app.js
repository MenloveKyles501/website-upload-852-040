(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function norm(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = one(".menu-toggle");
    var panel = one(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
      button.textContent = isOpen ? "×" : "☰";
    });
  }

  function setupSearchPage() {
    var page = one("[data-search-page]");
    if (!page) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = norm(params.get("q"));
    var input = one(".search-large input[name='q']", page);
    var cards = all(".movie-card", page);
    var empty = one(".search-empty", page);
    var resultText = one(".result-text", page);
    if (input) {
      input.value = query;
    }
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = norm(card.getAttribute("data-search"));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.hidden = visible !== 0;
    }
    if (resultText && query) {
      resultText.textContent = "关键词“" + query + "”相关影片";
    }
  }

  function setupFilters() {
    all("[data-filter-area]").forEach(function (area) {
      var buttons = all("[data-filter-value]", area);
      var cards = all(".movie-card", area);
      var empty = one(".filter-empty", area);
      if (!buttons.length || !cards.length) {
        return;
      }
      buttons[0].classList.add("is-active");
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          var value = norm(button.getAttribute("data-filter-value"));
          var visible = 0;
          cards.forEach(function (card) {
            var haystack = norm(card.getAttribute("data-filter"));
            var matched = value === "all" || haystack.indexOf(value) !== -1;
            card.hidden = !matched;
            if (matched) {
              visible += 1;
            }
          });
          if (empty) {
            empty.hidden = visible !== 0;
          }
        });
      });
    });
  }

  function setupPlayers() {
    all("[data-player]").forEach(function (box) {
      var video = one("video", box);
      var button = one("[data-play]", box);
      var src = box.getAttribute("data-video-url");
      var hlsInstance = null;
      if (!video || !button || !src) {
        return;
      }

      function begin() {
        box.classList.add("is-playing");
        if (video.getAttribute("data-ready") === "yes") {
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.setAttribute("data-ready", "yes");
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.setAttribute("data-ready", "yes");
          video.addEventListener(
            "loadedmetadata",
            function () {
              video.play().catch(function () {});
            },
            { once: true }
          );
          video.load();
        } else {
          video.src = src;
          video.setAttribute("data-ready", "yes");
          video.play().catch(function () {});
        }
      }

      button.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupSearchPage();
    setupFilters();
    setupPlayers();
  });
})();
