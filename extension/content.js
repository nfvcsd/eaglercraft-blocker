(() => {
  let timer, reported = false, scans = 0;
  // Work cap: 256 scripts, 2 MiB total per scan, at most one scan per second.
  function scan() {
    timer = null;
    if (reported) return;
    scans++;
    let remaining = 2 * 1024 * 1024;
    const inline = [], sources = [];
    for (const script of Array.from(document.scripts).slice(0, 256)) {
      if (script.src) sources.push(script.src);
      else if (!script.type || /^(module|(?:text|application)\/javascript)$/i.test(script.type)) {
        const text = script.textContent.slice(0, remaining);
        inline.push(text); remaining -= text.length;
      }
    }
    const reason = NFVDetector.classify({documentUrl: location.href, canvas: !!document.querySelector('canvas'), inline, sources});
    if (!reason) return;
    reported = true;
    observer.disconnect();
    chrome.runtime.sendMessage({type: 'detection', reason}).catch(() => {});
  }
  function schedule() { if (!reported && !timer) timer = setTimeout(scan, 1000); }
  const observer = new MutationObserver(schedule);
  observer.observe(document, {subtree:true, childList:true, attributes:true, attributeFilter:['src','type'], characterData:true});
  schedule();
  // Rescan periodically for missed changes; no MAIN-world hooks or page bridges.
  const interval = setInterval(() => { if (reported) clearInterval(interval); else schedule(); }, 10000);
})();
chrome.runtime.onMessage.addListener((m, s, reply) => { if (m?.type === 'confirm') reply({alive:true}); });
