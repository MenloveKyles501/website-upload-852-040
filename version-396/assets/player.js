(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video[data-video]');
    var overlay = shell.querySelector('.player-overlay');
    var hls = null;
    var ready = false;

    if (!video || !overlay) {
      return;
    }

    function loadStream() {
      if (ready) {
        return;
      }

      ready = true;
      var source = video.getAttribute('data-video');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function begin() {
      shell.classList.add('is-playing');
      loadStream();
      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    overlay.addEventListener('click', begin);

    video.addEventListener('click', function () {
      if (!ready) {
        begin();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('error', function () {
      if (hls && typeof hls.recoverMediaError === 'function') {
        hls.recoverMediaError();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
