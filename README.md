# NFVCSD Eaglercraft pilot

Manifest V3 proof of concept for managed school Macs. Repository: `nfvcsd/eaglercraft-blocker`.

**Start with [the one-Mac pilot](docs/PILOT.md).** Default mode is `detect`. Change to `block` only through the extension’s managed policy after reviewing the pilot results. This is a heuristic, not a complete or tamper-proof Eaglercraft prevention control.

## Included

- Manifest V3 extension with isolated content scripts in matching frames, mutation detection, local session counters, and an optional whole-tab blocking action.
- Exact URL rule for the verified `https://eaglercraft.com/play` launcher (also `/en/play` and trailing slashes), plus a conservative script/configuration + canvas detector; ordinary page text, titles, links, and search-query mentions are not evidence.
- Signed CRX3 build via Chrome, stable signing-key identity checks, manual GitHub Actions release workflow, and generated GitHub Pages `updates.xml`.
- Jamf custom-settings plist template for `com.google.Chrome`, plus separate extension-mode policies.
- Synthetic fixtures, detector/worker tests, optional actual-browser smoke test, anonymous hosting preflight, fallback hosting procedure.

## Customize for your school

Edit **[`extension/_locales/en/messages.json`](extension/_locales/en/messages.json)** to change the extension name, block heading, and block message. See [branding and fork setup](docs/CUSTOMIZATION.md) for examples and release instructions.

## Local quick start

Requires Node.js 22+ and Python 3.10+; unit tests have no third-party dependencies.

```sh
npm test
python3 -m http.server 8765 --directory fixtures
```

On an administrator’s test browser, open `chrome://extensions`, enable Developer mode, and Load unpacked → `extension/`. Visit `http://127.0.0.1:8765/mention.html` and `positive.html`. Open the extension popup to inspect counters. Refresh pages opened before installation. Unpacked testing does not validate enterprise installation or use the production signing-key identity.

Read [design and limitations](docs/DESIGN.md), [release setup](docs/RELEASE.md), and [verified references](docs/SOURCES.md) before deployment. The extension has no external analytics endpoint and never sends browsing data.
