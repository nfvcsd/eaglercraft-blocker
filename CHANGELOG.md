# 0.1.2

Recognize the verified eaglercraft.com/play launcher by exact origin/path, including /en/play and trailing-slash forms, without waiting for a game canvas. Preserve detection-only default and existing q13x/structural rules. No URL is stored or sent. This adds known-site coverage, not a general WebAssembly detector.

## Update your unpacked pilot

1. Extract the new ZIP and replace the files in the same extension folder you previously loaded.
2. At chrome://extensions, click Reload for NFVCSD Eaglercraft Pilot.
3. Confirm version 0.1.2, then refresh the game tabs (existing content scripts are not updated in place).
4. Visit https://eaglercraft.com/play and inspect the popup. Detection should increase before clicking Launch game; detection-only mode leaves the page open.

If using a different folder, remove the old unpacked copy before loading the new one to avoid duplicate detectors. The managed release workflow remains pending deployment approval.
