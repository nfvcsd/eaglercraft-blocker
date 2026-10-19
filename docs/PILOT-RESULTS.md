# Pilot evidence

Prepared October 19, 2026. Do not interpret pending tests as passed.

| Check | Status / evidence |
| --- | --- |
| Detector and worker tests | PASS: 18 Node tests |
| Signed CRX3 packaging | PASS: local installed Chrome, disposable RSA key; CRX3 header and embedded manifest checked |
| Actual browser fixture tests | PASS: Chrome for Testing 145.0.7632.6, isolated temporary profile; mention, positive, dynamic, cross-origin frame and CSP fixtures |
| Block navigation | PASS: browser test with a test-only managed-policy stub; not an MDM test |
| Jamf policy delivery | PENDING |
| GitHub Release redirects/headers | PENDING: no project release published |
| Fresh policy force-install on managed Mac | PENDING |
| Same-ID 0.1.0 → 0.1.1 upgrade | PENDING |
| Genuine Eaglercraft sample coverage | PENDING |
| School-site negative corpus | PENDING |
| Offline local HTML and real offline game | PENDING |
| Incognito / Guest / all relevant profiles | PENDING |
| Performance / fullscreen / rollback | PENDING |

For each managed-Mac run record: date, Chrome/macOS/Jamf versions, extension ID/version, policy values/status, relevant anonymous transport headers, fixture/sample label, expected and actual behavior. Do not attach student browsing logs or sensitive page content.
