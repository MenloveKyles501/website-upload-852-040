document.addEventListener('DOMContentLoaded', function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var status = player.querySelector('.player-status');
    var source = player.getAttribute('data-m3u8');

    if (!video || !overlay || !source) {
      return;
    }

    overlay.addEventListener('click', function () {
      overlay.classList.add('is-hidden');
      setStatus(status, '正在连接高清播放源...');
      loadHlsLibrary()
        .then(function () {
          return attachSource(video, source, status);
        })
        .then(function () {
          return video.play();
        })
        .then(function () {
          setStatus(status, '播放源已连接，可使用播放器控制栏切换进度与音量。');
        })
        .catch(function (error) {
          overlay.classList.remove('is-hidden');
          setStatus(status, '当前浏览器未能直接播放该 HLS 源，请刷新后重试或更换浏览器。');
          console.warn('HLS playback error:', error);
        });
    });
  });
});

function setStatus(node, message) {
  if (node) {
    node.textContent = message;
  }
}

function loadHlsLibrary() {
  if (window.Hls) {
    return Promise.resolve();
  }

  return new Promise(function (resolve, reject) {
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
    document.head.appendChild(script);
  });
}

function attachSource(video, source, status) {
  return new Promise(function (resolve, reject) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', resolve, { once: true });
      video.addEventListener('error', reject, { once: true });
      return;
    }

    if (!window.Hls || !window.Hls.isSupported()) {
      reject(new Error('HLS is not supported in this browser.'));
      return;
    }

    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
      setStatus(status, '播放清单加载完成，准备播放。');
      resolve();
    });
    hls.on(window.Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        reject(new Error(data.type || 'Fatal HLS error'));
        hls.destroy();
      }
    });
  });
}
