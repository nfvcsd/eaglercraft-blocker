# School branding and forks

Edit `extension/_locales/en/messages.json`. Change the `message` values and keep the three key names intact:

```json
{
  "extensionName": { "message": "Example Schools Game Filter" },
  "blockHeading": { "message": "This game is unavailable at school" },
  "blockMessage": { "message": "Please return to your class activity. If this page is needed for a lesson, contact Example Schools Technology Support." }
}
```

`extensionName` supplies the name in Chrome's extension list, the popup heading, and both extension page titles. `blockHeading` and `blockMessage` supply the blocked page. Text is displayed as plain text; HTML and links are not interpreted. Use JSON `\n` for a line break in the block message. Chrome message files use `$$` for a literal dollar sign.

This uses [Chrome's built-in localization support](https://developer.chrome.com/docs/extensions/reference/api/i18n). English is the default for all browser languages unless you add another locale. No extra permissions, remote configuration requests, or telemetry are needed.

## Test and release branding changes

1. Edit the messages file, then run `npm test`.
2. Reload your unpacked extension at `chrome://extensions`. Open its popup and test blocking using your pilot policy. Reopen existing extension pages to see new text.
3. For installed managed copies, increase the version in both `extension/manifest.json` and `package.json`, commit the changes, and run the signed release workflow. Version 0.1.4 is already prepared for the first branding release.
4. Verify the new name/message after the installed extension updates. Keep your existing signing key and extension ID when rebranding an existing deployment.

The file is bundled inside the signed extension. Editing it on GitHub does not live-update installed copies; a new signed release is required. Mode switching still uses Jamf's existing `Mode` setting.

## Set up another school's fork

1. Fork the source and edit the messages file. Review your intended use and distribution permissions; the repository currently does not include an open-source license.
2. Generate your school's own signing key and store it securely. Do not copy NFVCSD's key, extension ID, or Jamf profile. Follow [release setup](RELEASE.md) to configure the fork's `pilot-release` environment, secret, expected ID, reviewer, and GitHub Pages deployment. Secrets and environments must be configured in the fork.
3. Change the source manifest's `update_url` to `https://YOUR-OWNER.github.io/YOUR-REPOSITORY/updates.xml`. The Actions build also derives the packaged update URL and CRX download URL from the fork's actual repository name. For a local signed build, pass `--repository YOUR-OWNER/YOUR-REPOSITORY` to `scripts/build.py`.
4. Generate your school's Chrome policy with `scripts/render-policy.py` using the new extension ID and your own update URL (see `--help`). Use `com.google.Chrome.extensions.YOUR_EXTENSION_ID` for the mode policy domain.
5. Start your own one-Mac pilot in detection-only mode. Verify installation, false positives, blocking/rollback, and automatic updates before expanding deployment.

The detector and privacy behavior are independent of the branding. A new fork with a new signing key is a separate extension; renaming does not migrate an existing installation to that fork.
