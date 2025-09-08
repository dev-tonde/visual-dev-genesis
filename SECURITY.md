# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please send an email to security@iamtonde.co.za. All security vulnerabilities will be promptly addressed.

### Please include the following information:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### What to expect:

- Acknowledgment of your report within 48 hours
- Regular updates on our progress
- A fix timeline based on severity
- Credit for responsible disclosure (if desired)

## Security Measures

### Frontend Security
- Content Security Policy (CSP) headers
- XSS protection via input sanitization
- Secure cookie configuration
- HTTPS enforcement

### Backend Security
- Row Level Security (RLS) on all database tables
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure headers configuration

### Infrastructure Security
- Automated dependency updates
- Security audit pipeline
- Regular vulnerability scanning
- Access control and monitoring

## Best Practices

- Never commit secrets or API keys to the repository
- Use environment variables for configuration
- Validate all user inputs
- Follow the principle of least privilege
- Keep dependencies updated

Thank you for helping keep our project secure!