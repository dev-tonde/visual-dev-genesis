# Validation Results — Baseline Audit

Audit date: 2026-07-23
Environment: Linux aarch64 sandbox, Node v22.22.3, npm 10.9.8.
Method note: validation ran against a byte-identical copy of the working tree (commit `5070149`, clean) placed on fast local disk; the repository checkout itself was not modified. All commands are the exact `package.json` scripts.

| #   | Command                           | Result                       | Duration              | Warnings                                             | Errors | Pre-existing failure? | Tree changed?                        |
| --- | --------------------------------- | ---------------------------- | --------------------- | ---------------------------------------------------- | ------ | --------------------- | ------------------------------------ |
| 1   | `npm ci` (`--no-audit --no-fund`) | PASS — 584 packages          | 5.6 s                 | 0                                                    | 0      | n/a                   | no (node_modules only)               |
| 2   | `npm run lint`                    | PASS                         | 2.3 s                 | 0                                                    | 0      | n/a                   | no                                   |
| 3   | `npm run type-check`              | PASS                         | 0.2 s                 | 0                                                    | 0      | n/a                   | no                                   |
| 4   | `npm test`                        | PASS — 11 files, 30/30 tests | 3.1 s (vitest 2.64 s) | React Router v7 future-flag warnings (informational) | 0      | warnings pre-existing | no                                   |
| 5   | `npm run build`                   | PASS — built in 776 ms       | 1.1 s                 | 0                                                    | 0      | n/a                   | `dist/` created in scratch copy only |

Notes:

- The repo defines `type-check`, not `typecheck`; the existing script was used as instructed.
- No `typecheck`, `format:check` or `audit` scripts exist; none were invented.
- Test stderr contains two React Router v7 deprecation-path warnings (`v7_startTransition`, `v7_relativeSplatPath`). Classification: VERIFIED, pre-existing, non-failing.

`git status --short` after validation (repository checkout): output below — only the baseline audit files created by this task are present; no source files changed.

```
?? docs/audits/baseline/
```
