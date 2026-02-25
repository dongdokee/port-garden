# Research Ticket: Profile Bio HTML Injection (Stored XSS)

## Type Decision
1. **Candidate types considered:** Security, Bug.
2. **Why chosen type wins:** This issue is a stored Cross-Site Scripting (XSS) vulnerability. According to the research skill guidelines, vulnerabilities must be classified as "Security". 
3. **Why the other type is not primary:** While the PM requested a "Bug" classification to avoid process delays, the technical reality is that this is a high-risk vulnerability allowing arbitrary code execution. Classifying it as a bug would intentionally bypass critical security review processes, such as threat modeling and a broader attack surface audit, which are necessary to ensure the admin dashboard and other sensitive areas are protected.

## Vulnerability Description
A stored XSS vulnerability exists in the user profile bio field. The application renders raw HTML from the `bio` field without sanitization, allowing an authenticated user to inject malicious scripts that execute in the browser of any user viewing the profile.

## Affected Components
- `src/components/ProfileBio.tsx:34`: Direct rendering of unsanitized `bio` content.
- `src/pages/admin/UserDetail.tsx:67`: Vulnerable rendering in the administrative interface.
- Database: Stores the malicious payload.

## Threat Model
- **Attacker:** Any authenticated user.
- **Attack Vector:** Injecting `<img src=x onerror="alert(document.cookie)">` or similar into the bio field.
- **Impact:**
    - **Admin Session Hijacking:** If an administrator views the attacker's profile in the `UserDetail` page, their session cookies can be stolen, leading to full administrative account takeover.
    - **Data Theft:** Malicious scripts can exfiltrate sensitive user data displayed on the page.
    - **Defacement/Phishing:** Attackers can modify the page appearance or inject fake login forms to steal credentials.

## Remediation Options
- **Primary Fix:** Implement `DOMPurify` to sanitize the HTML content in `ProfileBio.tsx` before rendering.
- **Defense in Depth:** 
    - Implement server-side sanitization on input to ensure data is clean before storage.
    - Configure `HttpOnly` flags on session cookies to prevent theft via JavaScript.
    - Implement a strict Content Security Policy (CSP).

## Verification Method
1. Inject a script payload into the bio field.
2. Verify execution on the profile page and the admin `UserDetail` page.
3. Apply `DOMPurify` sanitization.
4. Confirm the payload is safely neutralized and no script executes.

## Non-goals
- Full application-wide security audit (though this issue highlights the need for one).
- Rewriting the entire profile management system.

## DoD
- [ ] Vulnerability remediated using `DOMPurify`.
- [ ] Verification method confirmed no script execution in any context (including Admin).
- [ ] Threat model reviewed and impact on Admin dashboard confirmed as mitigated.
- [ ] No regressions in valid HTML rendering (if any subset is allowed).
