(function () {
  var root = document.getElementById('playerRoot');
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playOverlay');
  if (!root || !video || !overlay) {
    return;
  }

  var stream = root.getAttribute('data-stream');
  var hls = null;
  var attached = false;

  function attach() {
    if (attached || !stream) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }
    video.src = stream;
  }

  function play() {
    attach();
    overlay.classList.add('is-hidden');
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', play);
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('error', function () {
    overlay.classList.remove('is-hidden');
  });
})();
