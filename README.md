# GOOSUN Open Execution Toolkit

**Open-source, non-custodial execution and risk toolkit for AI trading agents — Solana and BNB Chain (BSC + opBNB) grant modules.**

License: [Apache-2.0](./LICENSE) · Maintainer: GOOSUN Quant (高顺数科量化) engineering team · Status: **v0 design specification — implementation is grant milestone work**

---

## What this is

AI agents are increasingly asked to place trades. Most agent stacks connect the model's output almost directly to a signer. This toolkit is the missing layer in between: a small, open, test-driven pipeline that turns an agent's *intent* into an **unsigned** transaction only after the intent has passed explicit, inspectable risk rules — and that afterwards reconciles what was signed against what actually landed on-chain.

```
 AI agent ─▶ market / venue context ─▶ pre-trade risk gate ─▶ execution routing ─▶ USER WALLET SIGNATURE ─▶ execution (broadcast) ─▶ reconciliation
 (intent)    (balances, quotes,        (fail-closed rules,     (route candidates,     (outside the toolkit;      (user/wallet or       (signed intent vs.
             capabilities, freshness)   kill switch)            recorded decision)     toolkit never sees keys)   user-run sender)      landed result)
```

The toolkit:

- **is non-custodial by construction** — it never accepts, stores, derives or transmits private keys or seed phrases; it never holds funds; its execution API only returns *unsigned* transactions plus a machine-readable "what you are signing" summary;
- **fails closed** — if any input needed by a risk rule is missing, stale or unverifiable, the intent is rejected with a reason code; no transaction is built;
- **records decisions** — every risk decision, route decision and reconciliation result is a typed, schema-validated record (see [`schemas/`](./schemas));
- **is chain-specific where it matters** — Solana (SPL/Token-2022, Versioned Transactions, Jupiter, blockhash expiry) and BNB Chain (BSC + opBNB RPC failover, BEP-20 allowances, receipts, BNB DEX routes) are first-class, not ports of each other.

It is **not** a trading app, strategy, signal service or custodian, and it contains no trading strategy logic.

## Honest status

Nothing in this repository is a delivered Solana or BNB Chain execution capability yet. What exists today is the design: schemas, interface specifications and chain design documents. Native execution code is the subject of the Solana Foundation and BNB Chain grant applications described in [MILESTONES.md](./MILESTONES.md).

| Component | Status (2026-10-03) |
|---|---|
| Unified data model — JSON Schemas (`schemas/`) | **v0 design spec, published** (not yet used by released code) |
| Common TypeScript interfaces (`packages/common`) | **Interface spec, published** — implementation is grant milestone |
| Solana interfaces (`packages/solana`) | **Interface spec, published** — implementation is Solana grant milestone (M1–M3) |
| BNB Chain interfaces (`packages/bnb`) | **Interface spec, published** — implementation is BNB Chain grant milestone (M1–M3) |
| Solana design docs (`docs/solana`) | **Design, published** |
| BNB Chain design docs (`docs/bnb`) | **Design, published** |
| Solana account adapter / SPL normalization / v0 tx builder / signing boundary | NOT DELIVERED — Solana M1 |
| Jupiter quote + route adapters / Solana risk bindings / shadow mode | NOT DELIVERED — Solana M2 |
| Solana mainnet reference pipeline / reconciliation / SDK 1.0 | NOT DELIVERED — Solana M3 |
| BSC/opBNB RPC abstraction + failover / token, allowance, receipt normalization | NOT DELIVERED — BNB M1 |
| BNB DEX route adapter / gas + approval validation / agent→risk→execution | NOT DELIVERED — BNB M2 |
| BSC + opBNB mainnet verification / SDK 1.0 / reference agent | NOT DELIVERED — BNB M3 |
| Published npm packages | NONE yet |
| On-chain transactions produced by this toolkit | NONE yet |
| Usage / adoption metrics | NONE yet — not claimed |

## Repository layout

```
.
├── README.md            — this file
├── ARCHITECTURE.md      — pipeline, trust boundaries, module map, invariants
├── MILESTONES.md        — Solana (M1/M2/M3) and BNB Chain (M1/M2/M3) grant milestones, acceptance criteria
├── SECURITY.md          — threat model summary and vulnerability reporting
├── CONTRIBUTING.md      — how to contribute; rules for what may enter this repo
├── LICENSE              — Apache License 2.0 (official text)
├── NOTICE
├── schemas/             — v0 JSON Schemas: Account, Connection, Balance, Position, Order, Fill, PnL,
│                          VenueCapability, RiskDecision, ExecutionIntent, ReconciliationRecord
├── packages/
│   ├── common/          — chain-agnostic TypeScript interfaces (risk gate, router, reconciliation)
│   ├── solana/          — Solana interface spec (account adapter, SPL, v0 tx, Jupiter, signing boundary)
│   └── bnb/             — BNB Chain interface spec (RPC failover, BEP-20/allowance, receipts, DEX route, gas)
├── docs/
│   ├── pipeline.md      — the agent → risk → execution → reconciliation pipeline in detail
│   ├── risk-rules.md    — rule catalogue, reason codes, fail-closed semantics
│   ├── solana/          — Solana design documents
│   └── bnb/             — BNB Chain design documents
├── examples/
│   ├── solana/          — illustrative ExecutionIntent / RiskDecision / ReconciliationRecord payloads (Solana)
│   └── bnb/             — illustrative payloads (BSC / opBNB)
└── scripts/validate-examples.mjs — validates example payloads against the schemas
```

## Checks you can run today

```sh
npm install
npm run typecheck          # compiles the interface specs (tsc, no emit)
npm run validate:examples  # validates example payloads against the v0 JSON Schemas
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — design overview and invariants
- [docs/pipeline.md](./docs/pipeline.md) — pipeline stages and record flow
- [docs/risk-rules.md](./docs/risk-rules.md) — pre-trade risk rule catalogue
- Solana: [docs/solana/](./docs/solana/README.md) — SPL normalization, Versioned Transactions, wallet signing boundary, Jupiter adapters, stale-quote guard, reconciliation
- BNB Chain: [docs/bnb/](./docs/bnb/README.md) — BSC/opBNB RPC abstraction + failover, token/allowance normalization, receipt normalization, BNB DEX route adapter, gas/approval validation
- [schemas/](./schemas/README.md) — v0 data model

## Grants and billing separation

This repository hosts the public deliverables for two separate grant applications:

- **Solana Foundation** — "Solana-Native Execution and Risk Toolkit for AI Trading Agents" (USD 48,000; M1 12,000 / M2 20,000 / M3 16,000)
- **BNB Chain** — "Open Execution and AI Risk Infrastructure for BNB Chain" (USD 60,000; M1 15,000 / M2 25,000 / M3 20,000)

Each deliverable is billed to exactly one grant. Chain-agnostic pieces (`schemas/`, `packages/common`) are published at no charge to either grant; chain-specific bindings are billed only to the grant of that chain. See [MILESTONES.md](./MILESTONES.md#billing-separation).

Neither application has been approved; both are in preparation. Grant status will be updated here when an official decision exists.

## Relationship to GOOSUN Quant

GOOSUN Quant's commercial application is a separate, private codebase and is not open-sourced by this repository. This toolkit is written fresh for public release; no code from the commercial application is included. Engineering experience from that codebase (venue adapters, pre-trade gates, order state machines, reconciliation) informs the design here.

## License

Copyright 2026 GOOSUN Quant (高顺数科量化) contributors. Licensed under the [Apache License, Version 2.0](./LICENSE).
