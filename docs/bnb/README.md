# BNB Chain design documents (BSC + opBNB)

> Status: **design only. Nothing on BNB Chain native DEX routing or execution is delivered yet; it is BNB Chain grant milestone work (M1–M3).**

| Doc | Topic | Milestone |
|---|---|---|
| [rpc-failover.md](./rpc-failover.md) | BSC / opBNB RPC abstraction + provider failover | M1 |
| [token-allowance-normalization.md](./token-allowance-normalization.md) | Wallet, BEP-20 token and allowance normalization | M1 |
| [receipt-normalization.md](./receipt-normalization.md) | Transaction + receipt normalization, reconciliation | M1 / M3 |
| [dex-route-adapter.md](./dex-route-adapter.md) | BNB DEX route adapter (PancakeSwap on BSC + opBNB), quote aggregation, routing | M2 |
| [gas-approval-validation.md](./gas-approval-validation.md) | Gas caps (BSC + opBNB fee models), approval validation | M2 |

Interfaces: [`packages/bnb/src/index.ts`](../../packages/bnb/src/index.ts). Chain ids: BSC `56`, opBNB `204`.
