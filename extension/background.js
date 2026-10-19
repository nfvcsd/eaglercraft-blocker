// Session-only aggregate counters. Never persist URLs, names, content, or device IDs.
let queue = Promise.resolve();
async function mode() {
  try { return (await chrome.storage.managed.get('Mode')).Mode === 'block' ? 'block' : 'detect'; }
  catch { return 'detect'; }
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.type !== 'detection' || !['config-runtime-canvas', 'cached-loader-canvas', 'known-game-launcher'].includes(message.reason)
      || sender.id !== chrome.runtime.id || !sender.tab || !sender.documentId) return;
  queue = queue.catch(() => {}).then(async () => {
    const currentMode = await mode();
    const {seen = [], stats = {detected:0, blocked:0, errors:0}} = await chrome.storage.session.get(['seen','stats']);
    if (seen.includes(sender.documentId)) return;
    seen.push(sender.documentId);
    stats.detected++;
    if (currentMode === 'block') {
      try {
        // Avoid acting on a stale tab after navigation: ping that exact document.
        await chrome.tabs.sendMessage(sender.tab.id, {type:'confirm'}, {documentId:sender.documentId});
        await chrome.tabs.update(sender.tab.id, {url:chrome.runtime.getURL('blocked.html')});
        stats.blocked++;
      } catch { stats.errors++; }
    }
    await chrome.storage.session.set({seen:seen.slice(-500), stats});
    await chrome.action.setBadgeText({text:currentMode === 'block' ? 'B' : 'D', tabId:sender.tab.id}).catch(() => {});
  });
});
