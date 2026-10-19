# Current requirements reviewed October 19, 2026

These primary sources establish platform behavior; the pending pilot establishes compatibility with this district's deployment.

- [Chrome distribution](https://developer.chrome.com/docs/extensions/how-to/distribute): self-hosting is supported through enterprise policies on Windows/macOS.
- [Chromium ExtensionSettings definition](https://raw.githubusercontent.com/chromium/chromium/main/components/policy/resources/templates/policy_definitions/Extensions/ExtensionSettings.yaml): macOS management prerequisites, force_installed and override_update_url. The Mac must be managed through supported enterprise enrollment; simply writing a local preference is not the deployment proof.
- [Hosting and updating CRXs](https://developer.chrome.com/docs/extensions/how-to/distribute/host-on-linux): update-manifest structure, same-key signed updates, version comparison, HTTPS codebase and header guidance. Despite its Linux title, the distribution guide points here for self-hosting mechanics; the unmanaged Linux installation path is not the Mac policy path. Header discussion explicitly concerns clickable installation, so it does not settle enterprise-updater compatibility.
- [Mac extension policy](https://support.google.com/chrome/a/answer/7517624?hl=en): ExtensionSettings, force installation and override behavior. Use XML for the self-hosted update endpoint; CRX goes in XML codebase.
- [Managed extension policy on Mac](https://www.chromium.org/administrators/configuring-policy-for-extensions/): extension-specific preference domain `com.google.Chrome.extensions.ID`.
- [Managed storage schema](https://developer.chrome.com/docs/extensions/reference/manifest/storage) and [storage API](https://developer.chrome.com/docs/extensions/reference/api/storage): policy-backed configuration and session storage.
- [Incognito policy source](https://raw.githubusercontent.com/chromium/chromium/main/components/policy/resources/templates/policy_definitions/Miscellaneous/IncognitoModeAvailability.yaml): disabled value 1, and allowlist precedence caveat.
- [Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts): isolated worlds, frame matching, origin fallback and CSP distinctions.
- [Extension API](https://developer.chrome.com/docs/extensions/reference/api/extension): separate file-scheme access state.
- [MV3 bundled-code requirements](https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code): package extension logic locally; no remote executable rules.
- [DNR](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest): request-level rules for a future complementary endpoint blocklist.
- [GitHub release assets](https://docs.github.com/en/rest/releases/assets): download URLs, binary asset responses and redirects. No claim that GitHub certifies Chrome enterprise CRX delivery.
- [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages): artifact publishing and deployment permissions/environment.

- [Jamf custom settings](https://learn.jamf.com/r/en-US/technical-articles/Deploying_Custom_Computer_Configuration_Profiles_Using_the_Application_and_Custom_Settings_Payload): uploading app preference plists through computer configuration profiles.

- [Supplied q13x game loader](https://eaglercraft.q13x.com/1.8.8_2/js/) and [launcher implementation](https://eaglercraft.q13x.com/lib/launcher.js): directly inspected for the 0.1.1 cached-loader rule.

- [Eaglercraft play launcher](https://eaglercraft.com/play): inspected directly for 0.1.2; separate launch action and WebAssembly client preparation observed.
