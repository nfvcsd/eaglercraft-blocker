/* No page text, titles, query parameters, or network requests are classified.
 * Known launcher rules inspect only the current document origin and pathname. */
(() => {
  function classify({canvas, inline = [], sources = [], documentUrl = ''}) {
    // Verified dedicated launcher, not a keyword or whole-domain block.
    // Evaluate before canvas evidence: the launcher builds the client on demand.
    try {
      const url = new URL(documentUrl);
      if (url.origin === 'https://eaglercraft.com'
          && /^\/(?:en\/)?play\/?$/.test(url.pathname)) return 'known-game-launcher';
    } catch { /* Non-URL and unsupported documents fall through to heuristics. */ }
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
    // q13x cached loader: options are passed to an external launch function.
    // Require the loader's combined structure, never a hostname or page mention.
    const paths = new Set(sources.flatMap(src => {
      try { return [new URL(src).pathname]; } catch { return []; }
    }));
    const cachedLoader = ['/lib/launcher.js', '/lib/util.js', '/lib/largeEPK.js']
      .every(path => paths.has(path))
      && /loadCachedAssetUI\(\s*["']javascript\/meta\.json["']/.test(code)
      && /loadCachedAssetUI\(\s*["']game-assets\/meta\.json["']/.test(code)
      && /launch\(\s*utf8ToString\(\s*js\s*\)\s*,\s*params\s*\)/.test(code)
      && /\bcontainer\s*:\s*["']game_frame["']/.test(code)
      && /\bassetsURI\s*:\s*epk\b/.test(code)
      && /\bworldsDB\s*:/.test(code);
    if (cachedLoader) return 'cached-loader-canvas';
    return null;
  }
  globalThis.NFVDetector = Object.freeze({classify});
  if (typeof module !== 'undefined') module.exports = {classify};
})();
