# Security — Exploration Scope & DoD

| Field | Req | Why it matters |
|-------|-----|---------------|
| Vulnerability description | R | What the security issue is — CVE, advisory, or discovered weakness |
| Affected components | R | Which code, libraries, or services are exposed |
| Threat model | R | Who could exploit this, how, and what's the impact |
| Remediation options | R | Known fixes, patches, or mitigation strategies |
| Verification method | R | How to confirm the vulnerability is resolved |
| Non-goals | O | Scope boundaries — what is explicitly excluded to prevent over-exploration |

## DoD Template

- [ ] Vulnerability remediated per chosen approach
- [ ] Verification method executed — vulnerability no longer exploitable
- [ ] No new attack surface introduced
- [ ] Security advisory documented (if applicable)
- [ ] `[human]` Dependent systems notified (if applicable)
