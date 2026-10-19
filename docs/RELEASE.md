# Signed releases and hosting

The repository and hosting must be authorized before performing these publishing steps. Local files alone do not create anything in GitHub. The workflow runs only by manual dispatch.

## One-time identity setup

1. Create the approved repository (suggested `nfvcsd/eaglercraft-blocker`), upload this scaffold, and review it. Public Release downloads and public Pages must be reachable without GitHub login. Private source can be separate, but this workflow assumes a public distribution repository. Chrome cannot authenticate to private Releases with an Actions token.
2. Generate a dedicated RSA signing key on a trusted administrator workstation, outside the repository, and back it up in approved secret storage. Do not reuse the disposable key used for local scaffold testing. For example, choose a secure directory, set `umask 077`, then run `openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out signing.pem`. Do not commit the PEM or paste it in chat.
3. From the repository root, build once with that key:

   ```sh
   python3 scripts/build.py --key /secure/path/signing.pem --chrome '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
   ```

   `.dist/extension-id.txt` is the key-derived identity. Store it as the GitHub Actions variable `EXTENSION_ID`. Add a base64 encoding of the PEM as the environment secret `CRX_PRIVATE_KEY_B64` using the GitHub secret UI or your approved secret process. Base64 is encoding, not encryption.
4. Create the GitHub environment `pilot-release`; restrict deployment branches and require an administrator reviewer. Set Pages source to **GitHub Actions**. Permit this environment to deploy Pages. Restrict workflow edits and keep release permission narrow. Actions use official major-version references; pin to reviewed commit SHAs before broader production use.
5. Dispatch **Signed pilot release** from the reviewed branch. It tests, packages using the same key, checks the expected ID, publishes the CRX and checksum, verifies an anonymous download, then advertises it through Pages. The code assumes the runner has `google-chrome`, `gh`, OpenSSL and Python; a missing tool fails the job. Build output must be CRX3. This workflow itself has not been executed on GitHub.

Generated update XML is in `.dist/pages/updates.xml`; no placeholder XML is published. `appid` comes from the signing key, `version` from the packed manifest, and `codebase` from a versioned Release asset. The package includes the corresponding `update_url`. The workflow generates only the XML and `.nojekyll` into the Pages artifact; it never publishes keys or the source folder.

For a new release, increase `extension/manifest.json` to a numerically greater Chrome version (for example `0.1.1`), commit/review it, and dispatch again. Keep `package.json` aligned for bookkeeping. Versions have 1–4 integer components, each at most 65535. Keep the key forever: replacing it changes the extension ID. Do not overwrite a released CRX. The existing-tag failure is intentional; if publication succeeds but Pages fails, restore the Pages deployment from the completed artifact or release a higher version. Verify the live XML after every release. Roll back code by releasing a higher version containing the previous code; advertising an older version is not an automatic downgrade.

## GitHub transport gate

Run from the pilot Mac on the student network, after publication:

```sh
python3 scripts/probe-host.py https://nfvcsd.github.io/eaglercraft-blocker/updates.xml --expected-id YOUR_REAL_ID --expected-sha256 YOUR_RELEASE_SHA256
```

The helper performs anonymous HTTPS GETs, includes an update query string, follows HTTPS redirects, prints status/MIME/nosniff/disposition and redirect hosts, and checks CRX3 magic plus the expected release checksum. It omits signed redirect query strings. Compare the XML version to the packed manifest. Use the stable GitHub Release URL in XML, never the temporary signed redirect destination. A successful helper result is only a transport preflight.

**Required proof:** a fresh MDM policy force-install and an upgrade from 0.1.0 to 0.1.1 with the same ID. Neither has been performed for this project. Record Chrome/macOS versions, policy status, network path, final MIME headers, install result and update result in `PILOT-RESULTS.md`. Check proxy/TLS inspection and redirected asset hosts if download fails. Do not infer failure solely from `application/octet-stream`/`nosniff`: Chrome's cited header guidance specifically describes clicking a link, and the enterprise updater must be tested directly.

## Nginx / S3 fallback

Keep Pages `updates.xml` if it works. Copy the **same signed CRX** to a stable public HTTPS endpoint and change only `codebase` in the XML. This preserves the extension ID and Jamf update URL. Validate a fresh installation and a version upgrade again.

For Nginx, place versioned CRXs under a dedicated location, serve `Content-Type: application/x-chrome-extension`, and avoid authentication or redirects. Example inside an existing HTTPS server:

```nginx
location /eaglercraft/ {
    alias /srv/extensions/eaglercraft/;
    types { application/x-chrome-extension crx; application/xml xml; }
    add_header X-Content-Type-Options nosniff always;
}
```

Use your existing certificate/configuration practices. For S3, set object metadata `Content-Type=application/x-chrome-extension`; use HTTPS object delivery or CloudFront with private S3 origin access and anonymous public viewer access. S3 website endpoints alone are not HTTPS. Avoid expiring presigned URLs. No AWS infrastructure is deployed by this scaffold.

Upload the immutable CRX first, validate its checksum and anonymous download, then publish XML. Prefer short/no-cache XML and immutable versioned CRXs. If Pages itself is blocked, host XML too and change both the Jamf `update_url` and future manifest `update_url`. Keep `override_update_url=true`; it directs subsequent updates to the managed URL. Maintain the old endpoint through migration. Never disable TLS verification to make delivery work.
