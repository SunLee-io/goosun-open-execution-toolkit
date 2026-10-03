# Architecture (v0 design)

> Status: design specification. Interfaces in `packages/*` and schemas in `schemas/` describe the target system; implementations are grant milestone work (see [MILESTONES.md](./MILESTONES.md)).

## 1. Goals

1. An AI agent can only cause a transaction to exist by passing through one risk gate.
2. The toolkit never holds keys or funds. Signing happens in the user's wallet (or a user-controlled key held outside the toolkit).
3. Every decision is recorded in an open, versioned schema, so behaviour can be audited and compared across agents and chains.
4. Chain-specific correctness (Solana token accounts and blockhash expiry; BSC/opBNB allowances, gas and receipts) is handled in chain packages, not hidden behind a lowest-common-denominator abstraction.

Non-goals: strategies, signals, portfolio management, custody, order books, a hosted service, a user interface.

## 2. Pipeline

| # | Stage | Input | Output record | Where |
|---|---|---|---|---|
| 1 | Intent | Agent output (natural language → structured) | `ExecutionIntent` (status `PROPOSED`) | agent / caller |
| 2 | Context | Intent + chain reads | `Account`, `Balance[]`, `Position[]`, `VenueCapability`, quote(s) | chain package |
| 3 | Pre-trade risk | Intent + context + policy | `RiskDecision` (`ALLOW` / `BLOCK` + reason codes) | `common` risk gate + chain bindings |
| 4 | Routing | Allowed intent + route candidates | route decision embedded in `ExecutionIntent.route` | chain package router |
| 5 | Build | Chosen route | unsigned transaction + `SigningSummary` | chain package builder |
| 6 | Sign | Unsigned transaction | signed transaction | **user wallet — outside toolkit** |
| 7 | Execute | Signed transaction | signature / tx hash | user wallet or caller-run sender |
| 8 | Reconcile | Intent + on-chain result | `Fill[]`, `ReconciliationRecord`, `PnL` | chain package reconciler |

Stage 3 is the only path from 1 to 5. The builder API requires a `RiskDecision` with `decision = "ALLOW"` whose `intentHash` matches the intent and whose `expiresAt` is in the future; otherwise it throws `RISK_DECISION_REQUIRED` and builds nothing.

## 3. Trust boundaries

```
┌──────────── untrusted ────────────┐   ┌──────────────── toolkit (no keys) ───────────────┐   ┌──── user-controlled ────┐
│ AI agent output, prompts, tools   │──▶│ schema validation → context → risk gate → router │──▶│ wallet: review + sign   │
│ third-party quotes / RPC answers  │──▶│ → unsigned tx builder → SigningSummary            │   │ (Phantom, MetaMask, HW, │
└───────────────────────────────────┘   │ reconciler ◀──────── chain reads ◀────────────────┼───│  user-run agent key)    │
                                        └───────────────────────────────────────────────────┘   └─────────────────────────┘
```

- Agent output is untrusted input. It is parsed into `ExecutionIntent` and validated against the schema; unknown fields are rejected.
- Quotes and RPC responses are untrusted. Freshness and consistency checks (quote age, slot / block drift, chain id, simulation vs. quote) are risk rules, not assumptions.
- The toolkit has no code path that accepts a private key, mnemonic or keypair file. A test in each chain package asserts that public APIs reject such inputs.

## 4. Module map

| Module | Package | Responsibility |
|---|---|---|
| Data model | `schemas/`, `packages/common` | Account, Connection, Balance, Position, Order, Fill, PnL, VenueCapability, RiskDecision, ExecutionIntent, ReconciliationRecord |
| Risk gate | `packages/common` | Rule evaluation, fail-closed semantics, kill switch, reason codes, decision expiry |
| Router contract | `packages/common` | `RouteCandidate` comparison, recorded reason |
| Reconciler contract | `packages/common` | Intent vs. result comparison, tolerance rules |
| Solana account adapter + SPL normalization | `packages/solana` | SOL / SPL / Token-2022 balances, ATAs, mint metadata, extensions |
| Solana v0 transaction builder + signing boundary | `packages/solana` | Versioned Transactions, Address Lookup Tables, compute budget, simulation, `SigningSummary` |
| Jupiter quote + route adapters | `packages/solana` | Quote normalization, route legs, expiry |
| Solana reconciler | `packages/solana` | `getTransaction` pre/post token balances and fees |
| BSC/opBNB RPC abstraction + failover | `packages/bnb` | Endpoint pools, health scoring, chain-id check, stale-head detection |
| BEP-20 token + allowance normalization | `packages/bnb` | Metadata, decimals, allowance state, exact-amount approvals, revocation |
| BNB receipt normalization | `packages/bnb` | Status, revert reason, effective gas, transfer decoding → `Fill` |
| BNB DEX route adapter | `packages/bnb` | PancakeSwap routes on BSC and opBNB behind a quote-aggregation interface |
| Gas + approval validation | `packages/bnb` | Gas caps (BSC and opBNB fee models), approval checks before calldata |

## 5. Invariants (each will have a test)

1. **No keys.** No public function accepts or returns key material.
2. **No unsigned transaction without ALLOW.** Builders require a matching, unexpired `RiskDecision`.
3. **Kill switch first.** When the kill switch is active every entry point returns `BLOCK` with `KILL_SWITCH_ACTIVE` before any other work.
4. **Fail closed.** Missing or stale inputs produce `BLOCK`, never a default allow.
5. **Exact amounts.** On-chain amounts are integers in base units (`string` in JSON); human-readable decimals are derived, never the source of truth.
6. **No duplicate submission.** Ambiguous outcomes (timeout, dropped transaction) go to reconciliation; the toolkit never re-signs or re-submits automatically.
7. **Everything recorded.** Each pipeline run emits schema-valid records with an `intentHash` linking them.

## 6. Data model principles

- Amounts: `{ "raw": "<integer string>", "decimals": <int> }`.
- Time: RFC 3339 UTC strings.
- Identifiers: `chain` uses CAIP-2 style ids (`solana:mainnet`, `solana:devnet`, `eip155:56`, `eip155:204`).
- Versioning: each schema carries `schemaVersion` (`"0.1.0"` in this release). Breaking changes bump the minor version until 1.0.

## 7. What is shared vs. chain-specific

Shared (`schemas/`, `packages/common`) is published free and not billed to either grant. Chain packages are billed to exactly one grant each: `packages/solana` → Solana Foundation grant; `packages/bnb` → BNB Chain grant.
