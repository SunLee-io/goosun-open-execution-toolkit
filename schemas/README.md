# Schemas — v0 design specification

> **Status: v0 design spec (`schemaVersion: "0.1.0"`).** Written fresh for this repository. Not yet consumed by released code; breaking changes are expected before 1.0. JSON Schema draft 2020-12.

| Schema | File | Purpose |
|---|---|---|
| Common definitions | [common.schema.json](./common.schema.json) | `ChainId`, `Timestamp`, `Hash`, `Address`, `AssetRef`, `Amount`, `Side`, `Mode`, `ReasonCode` |
| Account | [account.schema.json](./account.schema.json) | User-controlled wallet / venue account (`custody` is always `"user"`) |
| Connection | [connection.schema.json](./connection.schema.json) | RPC / API connection health (no credentials) |
| Balance | [balance.schema.json](./balance.schema.json) | One asset balance at a known slot / block (incl. Token-2022 extensions) |
| Position | [position.schema.json](./position.schema.json) | Net position, cost basis, notional, leverage |
| Order | [order.schema.json](./order.schema.json) | Routed order and its lifecycle status |
| Fill | [fill.schema.json](./fill.schema.json) | Normalized execution from a Solana transaction or EVM receipt |
| PnL | [pnl.schema.json](./pnl.schema.json) | Realized / unrealized / fees; `null` = unknown, never 0 |
| VenueCapability | [venue-capability.schema.json](./venue-capability.schema.json) | What a route adapter can do on a chain, with evidence state |
| RiskDecision | [risk-decision.schema.json](./risk-decision.schema.json) | Pre-trade gate result, per-rule checks, reason codes, expiry |
| ExecutionIntent | [execution-intent.schema.json](./execution-intent.schema.json) | Agent intent (untrusted) + route candidates + status |
| ReconciliationRecord | [reconciliation-record.schema.json](./reconciliation-record.schema.json) | Signed intent vs. on-chain result; `duplicateSubmission` must be `false` |

## Conventions

- **Amounts** are `{ "raw": "<integer string>", "decimals": n }` in base units (lamports, token base units, wei). Floats are never used for on-chain amounts.
- **Chains** use CAIP-2 style ids: `solana:mainnet`, `solana:devnet`, `eip155:56` (BSC), `eip155:204` (opBNB).
- **Records link by `intentHash`** — the SHA-256 of the canonical ExecutionIntent (without status fields).
- `additionalProperties: false` everywhere: unknown fields from agents are rejected.

TypeScript equivalents live in [`packages/common/src/types.ts`](../packages/common/src/types.ts). Example payloads are in [`examples/`](../examples).
