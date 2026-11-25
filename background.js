chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  await chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    world: "MAIN",
    func: () => {
      if (typeof window.__runCourseVideoCmd === "function") {
        window.__runCourseVideoCmd("SKIP");
      }
    }
  });
});