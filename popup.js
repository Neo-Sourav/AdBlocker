async function sendCommand(cmd) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    world: "MAIN",
    func: (command) => {
      if (typeof window.__runCourseVideoCmd === "function") {
        window.__runCourseVideoCmd(command);
      }
    },
    args: [cmd]
  });

  const status = document.getElementById("status");
  status.textContent = cmd === "FAST" ? "Toggled 16x / 1x speed!" : "Skipped to end!";
}

document.getElementById("fastBtn").addEventListener("click", () => sendCommand("FAST"));
document.getElementById("skipBtn").addEventListener("click", () => sendCommand("SKIP"));