// --- PART 1: The Anti-Pause Injector ---
const injectScript = () => {
  const code = `
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
    Object.defineProperty(document, 'hidden', { get: () => false });
    document.hasFocus = () => true;

    ['visibilitychange', 'webkitvisibilitychange', 'blur', 'focusout'].forEach(evt => {
      window.addEventListener(evt, e => e.stopImmediatePropagation(), true);
      document.addEventListener(evt, e => e.stopImmediatePropagation(), true);
    });

    const patchVideo = (video) => {
      if (video.__patchedPause) return;
      video.__patchedPause = true;
      const originalPause = video.pause;
      video.pause = function() {
        if (!document.hasFocus()) return;
        return originalPause.apply(this, arguments);
      };
    };

    document.querySelectorAll('video').forEach(patchVideo);
    new MutationObserver(() => {
      document.querySelectorAll('video').forEach(patchVideo);
    }).observe(document.documentElement, { childList: true, subtree: true });
  `;

  const script = document.createElement('script');
  script.textContent = code;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
};

injectScript();


// --- PART 2: Video Ad Skipper (Runs in Extension Context) ---
setInterval(() => {
  // 1. Click standard "Skip Ad" buttons (YouTube, etc.)
  const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton');
  if (skipButton) skipButton.click();
  
  // 2. If it's an unskippable video ad, fast-forward it to the end
  const adVideo = document.querySelector('.ad-showing video, .ad-interrupting video');
  if (adVideo && adVideo.duration) {
    // Setting playback rate very high, or instantly jumping to the end
    adVideo.currentTime = adVideo.duration; 
  }
}, 500); // Checks every half-second