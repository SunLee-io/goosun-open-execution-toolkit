# packages/common — chain-agnostic contracts

> **Status: interface spec. Implementation is grant milestone work.** No runtime code yet. Newly written for this repository.

Contents
- `src/types.ts` — TypeScript mirror of the v0 JSON Schemas in [`/schemas`](../../schemas).
- `src/pipeline.ts` — contracts for `RiskGate`, `RiskRuleEvaluator`, `ExecutionRouter`, `UnsignedTransactionBuilder`, `SigningSummary`, `Reconciler`, `RiskPolicy`, `MarketContext`.

Billing: shared; not billed to either grant (see [MILESTONES.md](../../MILESTONES.md#billing-separation)).
