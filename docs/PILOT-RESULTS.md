# Pilot evidence

Prepared October 19, 2026. Do not interpret pending tests as passed.

| Check | Status / evidence |
| --- | --- |
| Detector and worker tests | PASS: 38 Node tests |
| Signed CRX3 packaging | PASS: local installed Chrome, disposable RSA key; CRX3 header and embedded manifest checked |
| Actual browser fixture tests | PASS: Chrome for Testing 145.0.7632.6, isolated temporary profile; mention, positive, dynamic, cross-origin frame and CSP fixtures |
| Block navigation | PASS: browser test with a test-only managed-policy stub; not an MDM test |
| Jamf policy delivery | PENDING |
| GitHub Release redirects/headers | PENDING: no project release published |
| Fresh policy force-install on managed Mac | PENDING |
| Managed same-ID version upgrade | PENDING |
| Genuine Eaglercraft sample coverage | PASS for supplied q13x JavaScript page only: live detection and whole-tab blocking with a test-only managed-policy stub, Chrome for Testing 145.0.7632.6; other builds pending |
| School-site negative corpus | PENDING |
| Offline local HTML and real offline game | PENDING |
| Incognito / Guest / all relevant profiles | PENDING |
| Performance / fullscreen / rollback | PENDING |

For each managed-Mac run record: date, Chrome/macOS/Jamf versions, extension ID/version, policy values/status, relevant anonymous transport headers, fixture/sample label, expected and actual behavior. Do not attach student browsing logs or sensitive page content.

## 0.1.1 live sample check

The supplied [q13x JavaScript build](https://eaglercraft.q13x.com/1.8.8_2/js/) uses a cached-asset loader and passes an options variable to an external launcher. Version 0.1.0 expected a literal configuration object and did not specifically cover that loader. Version 0.1.1 adds combined loader-structure evidence plus canvas presence, without relying on page text or the hostname alone.

Observed live detection at approximately 10 seconds after navigation, following asset download and canvas creation. A separate fresh-browser run with a test-only Mode=block policy stub reached the internal blocked page: detected=1, blocked=1, errors=0. An initial attempt to reuse/reload the detection session timed out; the fresh-session blocking test passed. Managed Jamf policy delivery is still untested. These results show post-load detection/blocking, not prevention of game code execution or universal Eaglercraft coverage.

Regression checks: 22 unit tests; six browser fixtures including the new cached-loader fixture; synthetic blocking navigation; signed CRX3 0.1.1 built using the same disposable test key as 0.1.0. Test key and CRX are excluded from the delivered ZIP.

## 0.1.2 launcher check

The supplied https://eaglercraft.com/play page exposed a separate launcher that downloaded a WebAssembly client archive. In the initial inspection it remained at client preparation for the 60-second observation window; no successful WASM game execution is claimed. Earlier canvas/config heuristics did not cover this launcher.

Added exact HTTPS origin/path coverage for /play and /en/play, including trailing slashes. It deliberately recognizes the launcher before game execution. Live Chrome for Testing 145.0.7632.6 checks passed with the actual unpacked extension: default detection-only recorded one detection and left the page open; a separate fresh browser with a test-only managed Mode=block stub navigated to the internal block page, with detected=1, blocked=1, errors=0. Initial fixed five-second sampling was too early; polling for detection confirmed the result. Timing depends on page load and browser scheduling.

All 38 unit tests passed, including exclusions for articles, guide pages, URL mentions in query strings, lookalike domains, and path-prefix collisions. The six existing browser fixtures and synthetic block navigation passed again. Signed CRX3 0.1.2 packaging passed using the same disposable key. Jamf delivery, policy enforcement on a managed Mac, GitHub hosting, and broader real-game coverage remain pending.
