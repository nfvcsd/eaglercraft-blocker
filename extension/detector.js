/* No page text, titles, query parameters, or network requests are classified. */
(() => {
  function classify({canvas, inline = [], sources = []}) {
    if (!canvas) return null;
    const code = inline.join('\n');
    const config = /\b(?:window\s*\.\s*)?eaglercraftX?Opts\s*=\s*\{/.test(code)
      && /\b(?:container|assetsURI)\s*:/.test(code)
      && /\b(?:serverList|worldsDB|localesURI|assetsURI)\s*:/.test(code);
    const runtime = /\bnet_lax1dude_eaglercraft(?:_v1_8)?_/.test(code);
    const bundle = sources.some(src => {
      try { return /\/(?:eaglercraft|eaglercraftx)(?:[._-][a-z0-9._-]+)?\.js$/i.test(new URL(src).pathname); }
      catch { return false; }
    });
    if (config && (runtime || bundle)) return 'config-runtime-canvas';
    return null;
  }
  globalThis.NFVDetector = Object.freeze({classify});
  if (typeof module !== 'undefined') module.exports = {classify};
})();
