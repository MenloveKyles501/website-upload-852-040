(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            var hlsUrl = shell.getAttribute('data-hls');
            var started = false;
            var hls = null;

            function beginPlayback() {
                if (!video || !hlsUrl || started) {
                    return;
                }

                started = true;
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                video.controls = true;

                function playNow() {
                    var playRequest = video.play();
                    if (playRequest && typeof playRequest.catch === 'function') {
                        playRequest.catch(function () {
                            started = false;
                            if (overlay) {
                                overlay.classList.remove('is-hidden');
                            }
                        });
                    }
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = hlsUrl;
                    video.addEventListener('loadedmetadata', playNow, { once: true });
                    video.load();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                        hls.loadSource(hlsUrl);
                    });
                    hls.on(window.Hls.Events.MANIFEST_PARSED, playNow);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            hls.destroy();
                            hls = null;
                            video.src = hlsUrl;
                            video.load();
                            playNow();
                        }
                    });
                    return;
                }

                video.src = hlsUrl;
                video.addEventListener('loadedmetadata', playNow, { once: true });
                video.load();
            }

            if (overlay) {
                overlay.addEventListener('click', beginPlayback);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!started) {
                        beginPlayback();
                    }
                });
            }
        });
    });
})();
