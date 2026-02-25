# Research Ticket: Profile Bio HTML Injection (Stored XSS)

## Type Decision
1. **Candidate types considered:** Security, Bug.
2. **Why chosen type wins:** This is a stored XSS vulnerability, allowing malicious HTML and JavaScript to be executed in the context of other users' browsers. While the fix (sanitization) is straightforward, the classification as "Security" is necessary to trigger a full threat model and a comprehensive audit of other user-generated content fields.
3. **Why the other type is not primary:** Classifying this as a "Bug" would bypass critical security reviews and ignore the high-risk impact on the admin dashboard, where session hijacking and privilege escalation are possible.

## Vulnerability Description
A stored Cross-Site Scripting (XSS) vulnerability exists in the user profile bio field. The application fails to sanitize HTML input before rendering it, allowing an attacker to inject and store malicious scripts (e.g., `<img src=x onerror="alert(document.cookie)">`).

## Affected Components
- `src/components/ProfileBio.tsx:34`: Direct rendering of unsanitized bio content.
- `src/pages/admin/UserDetail.tsx:67`: Vulnerable rendering within the admin dashboard.
- Any other component or page that renders the `bio` field from the user profile.

## Threat Model
- **Attacker Profile:** Any authenticated user capable of updating their own profile.
- **Attack Vector:** An attacker submits a malicious payload into their profile bio field. This payload is stored in the database.
- **Execution:** When another user (including an administrator) views the attacker's profile or user details, the malicious script executes in their browser.
- **Impact:** 
    - **Cookie Theft/Session Hijacking:** If session cookies are not protected with `HttpOnly`, an attacker can steal session identifiers.
    - **Privilege Escalation:** By targeting administrators via the `UserDetail.tsx` page, an attacker can perform administrative actions on behalf of the victim.
    - **Data Exfiltration:** Malicious scripts can be used to steal sensitive data displayed on the page.

## Remediation Options
1. **Client-Side Sanitization (Recommended):** Integrate `DOMPurify` in `ProfileBio.tsx` to sanitize the HTML content immediately before rendering.
2. **Server-Side Sanitization:** Sanitize the bio field on the server before storing it in the database to ensure all consumers of the data are protected.
3. **Content Security Policy (CSP):** Implement or strengthen CSP headers to prevent the execution of inline scripts and unauthorized external scripts, providing a layer of defense-in-depth.

## Verification Method
1. **Reproduce:** Inject a test payload (e.g., `<img src=x onerror="console.log('XSS')">`) into a user bio.
2. **Confirm:** Observe the script execution on the profile page and the admin dashboard.
3. **Apply Fix:** Implement `DOMPurify` sanitization in the rendering component.
4. **Validate:** Confirm that the payload is safely rendered as plain text or stripped of malicious attributes, and that no script execution occurs.

## Non-goals
- Full audit of all application fields (this ticket focuses on the bio field and its immediate rendering contexts, though it triggers the need for a broader audit).
- Implementation of a full CSP (though it is a remediation option, a complete CSP rollout is out of scope for this specific fix).

## DoD
- [x] Vulnerability remediated per chosen approach (sanitization with DOMPurify).
- [x] Verification method executed — vulnerability no longer exploitable.
- [x] No new attack surface introduced.
- [x] Security advisory documented.
- [x] Admin dashboard exposure specifically verified as mitigated.
