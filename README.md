# Ad Blocker and Video Unpauser

A lightweight Chrome/Chromium extension that prevents course videos and media players from auto-pausing when you switch tabs, minimize the window, or press Alt-Tab.

## How It Works
- Overrides `document.visibilityState`, `document.hidden`, and `document.hasFocus()`.
- Captures and drops `blur`, `focusout`, and `visibilitychange` events before player scripts can intercept them.
- Patches the HTML5 `<video>` element's `.pause()` method so background pause events are ignored while leaving manual user pause functional.

## Installation

1. Clone or download this repository as a ZIP and extract it.
2. Open your browser and navigate to `chrome://extensions` (or `edge://extensions` / `brave://extensions`).
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the extracted folder.
6. Refresh the tab with your video.
