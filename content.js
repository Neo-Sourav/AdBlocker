(function() {
  if (window.__courseHelperLoaded) return;
  window.__courseHelperLoaded = true;

  const isTopFrame = (window === window.top);
  const trackedVideos = new Set();
  const origPlay = HTMLMediaElement.prototype.play;

  // 1. Hook HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function() {
    if (this.tagName === 'VIDEO') {
      trackedVideos.add(this);
      patchVideo(this);
      notifyVideoFound();
    }
    return origPlay.apply(this, arguments);
  };

  // 2. Anti-Pause & Anti-Snapback
  Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
  Object.defineProperty(document, 'hidden', { get: () => false });
  document.hasFocus = () => true;

  ['visibilitychange', 'webkitvisibilitychange', 'blur', 'focusout', 'seeking', 'seeked', 'ratechange'].forEach(evt => {
    window.addEventListener(evt, e => e.stopImmediatePropagation(), true);
    document.addEventListener(evt, e => e.stopImmediatePropagation(), true);
  });

  const patchVideo = (video) => {
    if (video.__patchedAll) return;
    video.__patchedAll = true;
    trackedVideos.add(video);

    ['seeking', 'seeked', 'ratechange'].forEach(evt => {
      video.addEventListener(evt, e => e.stopImmediatePropagation(), true);
    });

    const originalPause = video.pause;
    video.pause = function() {
      if (!document.hasFocus()) return;
      return originalPause.apply(this, arguments);
    };
  };

  const scanVideos = (root = document) => {
    let found = trackedVideos.size > 0;
    root.querySelectorAll('video').forEach(v => {
      patchVideo(v);
      found = true;
    });
    root.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot && scanVideos(el.shadowRoot)) found = true;
    });
    if (found) notifyVideoFound();
    return found;
  };

  function notifyVideoFound() {
    if (isTopFrame) {
      showTopBar();
    } else {
      try { window.top.postMessage({ __zohoVideoDetected: true }, '*'); } catch (_) {}
    }
  }

  setInterval(() => scanVideos(), 1000);

  // 3. Video Command Runner (Called by Top-Right Bar OR 1-Click Brave Toolbar Icon)
  window.__runCourseVideoCmd = (cmd) => {
    scanVideos();
    trackedVideos.forEach(v => {
      if (cmd === 'FAST') {
        if (v.playbackRate < 16) {
          v.playbackRate = 16;
          v.muted = true;
          origPlay.call(v);
        } else {
          v.playbackRate = 1;
          v.muted = false;
        }
      }
      if (cmd === 'SKIP' && v.duration && !isNaN(v.duration)) {
        v.currentTime = Math.max(0, v.duration - 1.5);
        origPlay.call(v);
      }
    });
  };

  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.__zohoCourseCmd) {
      window.__runCourseVideoCmd(e.data.__zohoCourseCmd);
    }
    if (e.data.__zohoVideoDetected && isTopFrame) {
      showTopBar();
    }
  });

  const broadcastCommand = (cmd) => {
    window.__runCourseVideoCmd(cmd);
    const sendToFrames = (win) => {
      for (let i = 0; i < win.frames.length; i++) {
        try {
          win.frames[i].postMessage({ __zohoCourseCmd: cmd }, '*');
          sendToFrames(win.frames[i]);
        } catch (_) {}
      }
    };
    sendToFrames(window.top);
  };

  // 4. Permanent Top-Right Control Pill (Only appears on pages with videos)
  let isFast = false;
  function showTopBar() {
    if (!isTopFrame || !document.body || document.getElementById('__course_top_bar')) return;

    const bar = document.createElement('div');
    bar.id = '__course_top_bar';
    Object.assign(bar.style, {
      position: 'fixed', top: '10px', right: '14px', zIndex: '2147483647',
      display: 'flex', gap: '6px', background: 'rgba(18, 18, 18, 0.92)',
      padding: '6px 8px', borderRadius: '999px',
      border: '1px solid rgba(0, 255, 136, 0.4)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)'
    });

    const btnBase = {
      border: 'none', borderRadius: '999px', padding: '5px 11px',
      fontWeight: '700', fontSize: '12px', cursor: 'pointer',
      fontFamily: 'system-ui, sans-serif'
    };

    const fastBtn = document.createElement('button');
    fastBtn.textContent = '16x';
    Object.assign(fastBtn.style, btnBase, { background: '#262626', color: '#00ff88' });
    fastBtn.onclick = () => {
      isFast = !isFast;
      fastBtn.textContent = isFast ? '1x' : '16x';
      fastBtn.style.background = isFast ? '#00ff88' : '#262626';
      fastBtn.style.color = isFast ? '#111' : '#00ff88';
      broadcastCommand('FAST');
    };

    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'Skip';
    Object.assign(skipBtn.style, btnBase, { background: '#00ff88', color: '#111' });
    skipBtn.onclick = () => broadcastCommand('SKIP');

    bar.appendChild(fastBtn);
    bar.appendChild(skipBtn);
    document.body.appendChild(bar);
  }

  // 5. Video Ad Skipper
  setInterval(() => {
    const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton');
    if (skipButton) skipButton.click();

    const adVideo = document.querySelector('.ad-showing video, .ad-interrupting video');
    if (adVideo && adVideo.duration) {
      adVideo.currentTime = adVideo.duration;
    }
  }, 500);
})();