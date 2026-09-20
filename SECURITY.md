# Security Policy

TermsGuard is a browser extension that analyzes Terms of Service and Privacy Policies. Because it processes third-party web content, security and privacy are core concerns.

## Reporting a Vulnerability

Do not publish exploitable vulnerabilities in public issues. Report them privately to the repository owner through GitHub or the contact information published on https://allkvd.dev/.

Include the affected component, reproduction steps, impact, and a minimal proof of concept when safe.

## Security Practices

- Distributed extension builds must not contain embedded production API credentials.
- Untrusted page content is bounded before analysis.
- DOM content is extracted from relevant document regions rather than trusting arbitrary page metadata.
- Extension operations use Chrome extension APIs and local storage boundaries.
- Secrets belong in environment/configuration systems, never committed source files.

## Privacy

TermsGuard is not a legal service and generated analysis should not be treated as legal advice. Users should review the original agreement before relying on an interpretation.
