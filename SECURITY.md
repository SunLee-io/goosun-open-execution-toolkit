# Security Policy

## Status

This repository currently contains design specifications, schemas and TypeScript interface definitions only. There is no released executable code and no deployed service. Security-relevant implementation is grant milestone work and will be reviewed as described below.

## Reporting a vulnerability

Please report suspected vulnerabilities **privately** through GitHub's "Report a vulnerability" button (Security → Advisories) on this repository. Do not open a public issue for security problems.

Please include: affected file / interface / version, a description of the issue, reproduction steps or a proof of concept, and the impact you expect. We aim to acknowledge reports within 5 business days.

## Security model (summary)

| Property | Design rule |
|---|---|
| Key custody | The toolkit never accepts, stores, derives, logs or transmits private keys, seed phrases or keypair files. Public APIs reject such inputs. |
| Funds | The toolkit never holds funds. Transactions are signed by the user's wallet and broadcast by the user or a user-run sender. |
| Agent input | Agent output is untrusted; it is parsed into a strict `ExecutionIntent` schema with unknown fields rejected. |
| Pre-trade gate | No unsigned transaction is built without a matching, unexpired `ALLOW` `RiskDecision`. Missing / stale inputs fail closed. |
| Kill switch | Checked first at every entry point. |
| Approvals (EVM) | Exact-amount approvals by default; unlimited approvals are blocked unless explicitly allowed by policy. |
| Replay / duplicates | Ambiguous outcomes go to reconciliation; no automatic re-sign or re-submit. |
| Third-party data | Quotes and RPC responses are untrusted; freshness, chain-id and simulation consistency are enforced by rules. |
| Secrets in repo | Secret scanning is run before every push; `.env`, key and keypair files are git-ignored. |

## Planned reviews

- Solana grant: internal review of risk-gate bypass paths and signing boundary (M2), final review (M3).
- BNB Chain grant: internal security review of routing, approval and kill-switch coverage (M2), final review (M3).

Review reports will be published in this repository.

## Supported versions

No version is released yet. Once releases exist, the latest minor version receives security fixes.
