# Ad Blocker (v2.3)

A lightweight Chromium/Brave extension that keeps course videos playing in the background, adds instant speed/skip controls, and blocks common web and video ads.

## Features
- **Anti-Pause & Focus Spoofing:** Prevents course players (including embedded iframes and Shadow DOM players) from pausing when you switch tabs or Alt-Tab.
- **Top-Right Control Pill:** Automatically appears on pages with video players, giving one-click **16x** speed toggle and **Skip** to end buttons.
- **One-Click Toolbar Action:** Clicking the pinned extension icon in the browser toolbar immediately skips the active video to the end.
- **Built-In Ad Blocker:** Blocks major ad networks (`googlesyndication`, `doubleclick`, `taboola`) via `declarativeNetRequest`, hides empty ad containers, and auto-skips video ads.

## Installation
1. Clone or download this repository as a ZIP and extract it.
2. Open `chrome://extensions` or `brave://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the extracted folder.
5. (Optional) Pin the extension icon to your toolbar for one-click video skipping.
