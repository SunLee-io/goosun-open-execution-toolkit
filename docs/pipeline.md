# Pipeline: AI agent → context → risk → routing → wallet signature → execution → reconciliation

> Status: design. Implementation is grant milestone work.

## Stage by stage

### 1. Intent (untrusted)
The agent emits a structured `ExecutionIntent` (see `schemas/execution-intent.schema.json`). Free text from the model is stored in `rationale` and never interpreted as an instruction. Validation rejects unknown fields, non-integer amounts, unsupported chains and `maxSlippageBps` outside 0–5000. The canonical JSON (status fields removed, keys sorted) is hashed with SHA-256 → `intentHash`.

### 2. Market / venue context (read-only)
The chain package reads: account balances (with slot/block), positions derived from prior fills, `VenueCapability` records, and route candidates (quotes). Each element carries its observation time and block so freshness can be checked by rules rather than assumed.

### 3. Pre-trade risk gate (fail-closed)
Rules run in a fixed order, kill switch first. Each returns `PASS`, `FAIL` or `MISSING_INPUT`. Any non-`PASS` → `BLOCK`. The resulting `RiskDecision` has a short TTL (`decisionTtlMs`, default 15 s) and is bound to `intentHash`. See [risk-rules.md](./risk-rules.md).

### 4. Execution routing
Among candidates that passed the gate, the router picks one by documented rules — net output after network and venue fees, then price impact, then hop count — and records the rejected candidates with reasons.

### 5. Build unsigned transaction
The builder checks the decision (ALLOW, matching hash, unexpired), builds the unsigned transaction(s) and a `SigningSummary` (what is sold, minimum received, programs/contracts touched, approvals, expiry). Solana: base64 v0 transaction + simulation. BNB Chain: unsigned EVM tx objects (approval first if required, exact amount).

### 6. User wallet signature (outside the toolkit)
The user's wallet shows the transaction and signs it. Agents that act autonomously do so with a key the **user** controls in their own environment; the toolkit still never sees it.

### 7. Execution
Broadcast is done by the wallet or a user-run sender. The toolkit records the returned signature / hash and moves the order to `SUBMITTED`.

### 8. Reconciliation
The reconciler reads the landed transaction (Solana `getTransaction`; EVM receipt) and compares it with the intent: amount sold, minimum received, fees, status. Outcomes: `MATCH`, `WITHIN_TOLERANCE`, `MISMATCH`, `NOT_EXECUTED`, `PENDING`. Expired / dropped transactions are recorded as such; the toolkit never re-signs or re-submits on its own.

## Modes

| Mode | Chain reads | Quotes | Simulation | Signing | Broadcast |
|---|---|---|---|---|---|
| PAPER | fixtures | fixtures | no | no | no |
| SHADOW | yes | live | yes | **no** | no |
| DEVNET | devnet / testnet | live where available | yes | user wallet | user |
| LIVE | mainnet | live | yes | user wallet | user |

## Record linkage

`ExecutionIntent.intentHash` → `RiskDecision.intentHash` → `Order.intentHash` → `Fill.orderId` → `ReconciliationRecord.intentHash`. A full audit trail for one trade is the set of records sharing one `intentHash`.
