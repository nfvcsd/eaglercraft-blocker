# One-Mac pilot procedure

Use a district-owned, Jamf MDM-enrolled test Mac and an administrator-approved test account. Record current macOS, Chrome and Jamf versions. Do not scope to students yet. Keep a means of removing the pilot profiles from Jamf.

## 1. Local behavior before publishing

Load `extension/` unpacked in an administrator test profile. Start `python3 -m http.server 8765 --directory fixtures` from the project folder. Open each fixture from `http://127.0.0.1:8765/`. Inspect the popup before/after each page; counters are per Chrome session, not per tab. Detection takes roughly 1–2 seconds after qualifying DOM appears; background-tab timers can be throttled.

| Fixture | Detection-only expectation |
| --- | --- |
| `mention.html` | No detection despite article, code example in `<pre>`, and canvas |
| `positive.html` | One detection, page remains open |
| `dynamic.html` | One detection after the delayed script/canvas appears |
| `frame.html` | One detection from localhost frame inside 127.0.0.1 parent |
| `cached-loader.html` | One detection from synthetic q13x-style loader structure |
| `csp.html` | One detection even though CSP stops page code; known heuristic limitation |

Also open `https://eaglercraft.com/play`: version 0.1.2 should increment detection without clicking Launch game. This is a known-launcher hit, not evidence that game execution has started. In block mode, that page should navigate to the internal block page.

No fixture contains an actual game. Test approved genuine browser and downloaded HTML variants next, plus school LMS, coding lessons, WebGL lessons and search results. A zero count is not proof that a real game is absent. Capture only manual pass/fail and sanitized reason notes. If a school lesson triggers, keep detection mode and refine signatures before blocking.

## 2. Establish signed delivery

Complete `RELEASE.md` only after repository/publication approval. Publish 0.1.2 and run its anonymous transport preflight on the student network. Remove the unpacked test extension before testing the signed ID. Do not try to drag/drop the CRX as proof of enterprise installation.

Generate the Chrome preference plist:

```sh
python3 scripts/render-policy.py YOUR_REAL_SIGNING_KEY_ID
```

The result is `.dist/com.google.Chrome.plist`. Its `ExtensionSettings` entry uses `installation_mode=force_installed` (not `force_install`), an **XML update-manifest URL**, and `override_update_url=true`. It also sets `IncognitoModeAvailability=1` and disables Guest mode for this pilot.

## 3. Deliver two managed preference payloads with Jamf Pro

In **Computers → Configuration Profiles**, create a computer-level pilot profile. In **Application & Custom Settings**, use the option to upload a plist/custom settings (labels vary by Jamf version).

- Preference domain: **`com.google.Chrome`**. Upload the generated `.dist/com.google.Chrome.plist`.
- Add a second custom-settings payload (or separate pilot profile): preference domain **`com.google.Chrome.extensions.YOUR_REAL_SIGNING_KEY_ID`**. Upload **`deploy/extension-detect.plist`**.
- Scope only to a static group containing the one pilot Mac. Deliver through MDM.

These files are preference dictionaries for Jamf to wrap, not complete standalone `.mobileconfig` profiles. Do not upload the `.template` file or use its placeholder as an ID. Do not wrap the preferences in another `com.google.Chrome` dictionary when Jamf already asks for the preference domain.

Inspect existing Chrome profiles first. Merge the one extension entry into the authoritative existing `ExtensionSettings` dictionary if that policy is already managed. Do not create conflicting profile values or replace the district’s other extension entries. Review inherited `IncognitoModeUrlAllowlist`: current Chromium policy allows it to re-enable Incognito for matching URLs. Ensure no applicable exception exists for the pilot. The scaffold does not silently change a district allowlist.

Restart Chrome. In `chrome://policy`, reload policies and confirm correct values, mandatory status, source/scope and no errors. Confirm both browser policies and the extension's **Mode=detect** policy. In `chrome://management`, confirm management; in `chrome://extensions`, confirm the **signing-key ID**, version 0.1.2, and policy installation. Confirm the normal disable/remove controls cannot remove it, Incognito is unavailable, and Guest mode is unavailable. Verify each profile that students can use; don't assume one profile proves all profiles.

## 4. Delivery acceptance gate

Re-run fixtures in the signed extension. Publish 0.1.3 with the same key, then use the extension page’s Update control where available, or allow the normal update cycle. Verify the same ID becomes version 0.1.3. Restart Chrome and check persistence. Record actual observed results. If either fresh installation or upgrade fails, troubleshoot policies, XML, identity/version and networking; use the documented alternate CRX host if needed. A curl/Python download pass alone is insufficient.

For offline coverage, inspect “Allow access to file URLs” in extension details. Enable it on the test Mac if available and approved; confirm actual access rather than assuming force installation grants it. Open a local copy of `positive.html` and a local `mention.html` with network disconnected. Repeat with an approved offline game sample. If file access cannot be centrally enforced or the sample is missed, record offline coverage as unavailable and do not claim district-wide protection.

## 5. Controlled blocking test

Only after reviewing detection results, replace the extension-domain payload with `deploy/extension-block.plist` (Mode=block), preserving the same preference domain and pilot scope. Reload policies, verify the popup says block, and **reload all test tabs**. The positive fixture should navigate to the NFVCSD block page. A frame match should navigate the entire parent tab. Mere mentions should remain unchanged. Test fullscreen, pointer lock, rapid tab navigation and real samples; check the error counter. No restart of the extension is needed to read new mode for new detections.

## 6. Rollback and stop conditions

For a false positive or disruption: restore Mode=detect in Jamf, reload policies, verify the popup, and reopen affected tabs. Blocking previously navigated tabs cannot restore their contents automatically. To end the pilot, remove only its extension entry from the authoritative force-install policy and remove its mode payload; verify uninstallation/policy disappearance on the Mac. If needed, explicitly set that extension's installation mode to `removed` through the same authoritative policy. Restore prior Incognito and Guest settings by removing only pilot overrides, without disturbing district policy.

Stop before wider rollout if any false positive affects schoolwork, forced installation/update fails, mode policy is absent, required profiles escape coverage, performance degrades, or offline coverage is required but unproven. Bring back sanitized results and representative approved samples to refine the next iteration.
