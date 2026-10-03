# Milestones

Two independent grant applications. **Each deliverable is billed to exactly one grant.** Nothing listed below is delivered yet; dates are relative to each grant's start (Day 0 = agreement signed). Neither grant has been approved.

## Billing separation

| Work item | Billed to |
|---|---|
| `schemas/` v0 data model, `packages/common` interfaces, docs/pipeline.md, docs/risk-rules.md | **Neither** (published before any grant, free) |
| `packages/solana`, `docs/solana`, `examples/solana`, Solana mainnet/devnet evidence | **Solana Foundation grant only** |
| `packages/bnb`, `docs/bnb`, `examples/bnb`, BSC/opBNB mainnet evidence | **BNB Chain grant only** |
| Chain-agnostic risk-rule engine core | **Neither** (shared; chain *bindings* are billed per chain) |

A work item that appears in one table below never appears in the other.

---

## Solana Foundation — Solana-Native Execution and Risk Toolkit for AI Trading Agents

Total **USD 48,000**, 3 months, 3 milestones.

### Solana M1 — Native Account & Execution Foundation — USD 12,000 — Day 30

Deliverables
- Solana account adapter: SOL + SPL + Token-2022 balances, associated token accounts, mint metadata → `Balance` schema
- SPL normalization: decimals, mint/ATA mapping, Token-2022 extension detection (e.g. transfer fee)
- Solana mapping of the unified Account / Balance / Order / Fill / Position schemas
- Versioned Transaction (v0) builder: Address Lookup Tables, compute-budget instructions, size checks, simulation
- User-wallet signing boundary: API returns only unsigned v0 transactions + `SigningSummary`
- Devnet test suite, SDK 0.1 pre-release, developer docs v0

Acceptance criteria
1. Tagged release in this repository with CI test log.
2. Tests for SOL / SPL / Token-2022 balance reads on devnet fixtures, v0 build + simulate, and a test proving no API accepts or returns key material.
3. At least one devnet transaction built by the toolkit, signed by a user wallet and verified by `getTransaction` readback (signature + slot recorded).
4. Published Solana schema mapping; SDK pre-release (e.g. `0.1.0-alpha`).

### Solana M2 — Jupiter Routing + Risk — USD 20,000 — Day 60

Deliverables
- Jupiter quote adapter + route normalization (`RouteCandidate`), recorded route decision
- Solana risk bindings: slippage, stale quote (quote age + slot drift + blockhash validity), fee validation, position limit, notional limit, daily exposure, kill switch — evaluated before any unsigned transaction is returned
- Paper / shadow execution mode (simulation only, same records)

Acceptance criteria
1. Recorded Jupiter quote fixtures normalize to the route schema; route-selection tests show decision + reason.
2. One blocking test per risk rule, each rejecting before a transaction is produced; kill-switch test covers every entry point.
3. In-policy request returns an unsigned v0 transaction whose simulated token deltas match the quote within tolerance.
4. Shadow-run report: ≥ 100 quote → check → simulate cycles on mainnet quotes (no signing), published as JSON.
5. SDK beta with documented risk configuration.

### Solana M3 — Mainnet Reference Implementation — USD 16,000 — Day 90

Deliverables
- Reference agent → risk → execution pipeline
- Transaction reconciliation + failure recovery (expired blockhash, dropped, failed — no duplicate submission)
- SDK 1.0 + developer example, benchmark, final technical report

Acceptance criteria
1. ≥ 10 approved small-value mainnet swaps through the reference pipeline (signatures + slots) and at least one logged block per risk rule.
2. Reconciliation record for every mainnet transaction (`getTransaction` pre/post token balances + fees vs. signed intent).
3. Failure-recovery tests show no duplicate submission.
4. SDK 1.0.0 published with changelog; example runs end-to-end on devnet.
5. Benchmark methodology + raw data (≥ 200 devnet/shadow runs + mainnet set); final report in this repository.
6. Adoption reported as measured after release (package downloads, external integrations) — no targets claimed as achieved.

---

## BNB Chain — Open Execution and AI Risk Infrastructure for BNB Chain

Total **USD 60,000**, 3 months, 3 milestones. Chains: BSC (chain id 56) and opBNB (chain id 204).

### BNB M1 — BSC / opBNB Execution Foundation — USD 15,000 — Day 30

Deliverables
- RPC abstraction with provider failover for BSC and opBNB (health scoring, chain-id verification, stale-head detection, read-method allowlist)
- Wallet normalization (nonce, native BNB balance)
- BEP-20 token normalization (metadata, decimals, canonical list for both chains)
- Allowance state (per-spender reads, unlimited-approval detection, exact-amount approval builder, revocation helper)
- Transaction normalization (BSC and opBNB fee models) and receipt normalization (status, revert reason, effective gas, transfer decoding → `Fill`)
- BSC/opBNB mapping of the unified account model

Acceptance criteria
1. Tagged release with CI test log.
2. Failover tests (endpoint down / wrong chain id / stale head → next provider) on both chain ids 56 and 204.
3. Read-only mainnet readback for a documented test wallet on BSC and opBNB — native balance, ≥ 3 BEP-20 balances, ≥ 1 allowance — matching the explorer.
4. Published schemas for wallet, token, allowance, transaction, receipt, balance.
5. Receipt normalization fixtures for success, revert and out-of-gas receipts on both chains.

### BNB M2 — DeFi Routing + AI Risk — USD 25,000 — Day 60

Deliverables
- BNB DEX route adapter (PancakeSwap on BSC and opBNB, router/factory addresses pinned and verified by on-chain readback) behind a quote-aggregation interface
- Execution routing with recorded reason (net output after gas and fees, price impact, approval requirement)
- Slippage, gas-cap and approval validation before calldata is returned
- Agent → risk → execution pipeline with leverage / position / notional limits, circuit breaker (revert-rate, RPC-failure, price-deviation triggers) and kill switch on every BNB entry point

Acceptance criteria
1. Router/factory addresses verified on-chain on both chains (bytecode present, documented source).
2. Normalized routes for a fixed token-pair set on each chain; side-by-side candidates + chosen route with reason.
3. One blocking test per rule (slippage, gas cap, missing allowance, unlimited approval, leverage/position/notional, circuit breaker, kill switch), each rejecting before calldata exists.
4. Kill-switch test covers every BNB entry point, including the agent pipeline.
5. Reference agent intents → published risk-decision log (allowed / blocked with reason).

### BNB M3 — Open Developer Toolkit + Mainnet Verification — USD 20,000 — Day 90

Deliverables
- SDK 1.0, API docs, integration example, reference agent
- Mainnet verification on BSC and opBNB, audit log export, reconciliation, benchmark, final report

Acceptance criteria
1. ≥ 10 BSC and ≥ 5 opBNB approved small-value mainnet swaps via the reference agent (tx hashes + block numbers).
2. Exact-amount approval and revocation demonstrated on mainnet.
3. Reconciliation record for every mainnet transaction; audit-log export published.
4. Benchmark (methodology + raw data) and final technical report in this repository.
5. SDK 1.0.0 + integration example public.

---

## Out of scope for both grants

Advertising, KOLs, user acquisition, trading volume, incentives or subsidies, trading strategies, custody, and any work on non-toolkit commercial products.
