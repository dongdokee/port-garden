# Security — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| Vulnerability description | R | What the security issue is — CVE, advisory, or discovered weakness |
| Affected components | R | Which code, libraries, or services are exposed — scopes exploration |
| Threat model | R | Who could exploit this, how, and what's the impact — prioritizes severity |
| Remediation options | R | Known fixes, patches, or mitigation strategies — triggers web-researcher for advisories |
| Verification method | R | How to confirm the vulnerability is resolved — e.g., scan passes, exploit no longer works |
| Non-goals | O | Side-effects to avoid — e.g., "don't break backward compatibility for API consumers" |
| Alternative approaches | O | Phase 4 requires 2-3 approaches — exploration must surface them |

## DoD Template

- [ ] Vulnerability remediated per chosen approach
- [ ] Verification method executed — vulnerability no longer exploitable
- [ ] No new attack surface introduced
- [ ] Non-goals confirmed untouched
- [ ] Security advisory documented (if applicable)
- [ ] Dependent systems notified (if applicable)
