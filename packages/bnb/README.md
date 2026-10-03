# packages/bnb — BNB Chain (BSC + opBNB) interface spec

> **Status: interface spec, implementation is grant milestone.** Nothing in this package is delivered. Billed only to the BNB Chain grant.

| Interface | Milestone | Design doc |
|---|---|---|
| `BnbRpcClient`, `RpcEndpoint`, `FailoverPolicy` | M1 | [rpc-failover.md](../../docs/bnb/rpc-failover.md) |
| `BnbAccountAdapter`, `Bep20Token`, `AllowanceState` | M1 | [token-allowance-normalization.md](../../docs/bnb/token-allowance-normalization.md) |
| `UnsignedEvmTx`, `NormalizedReceipt`, `ReceiptNormalizer` | M1 | [receipt-normalization.md](../../docs/bnb/receipt-normalization.md) |
| `BnbDexRouteAdapter`, `QuoteAggregator`, `BnbRouteCandidate` | M2 | [dex-route-adapter.md](../../docs/bnb/dex-route-adapter.md) |
| `GasApprovalValidator`, `GasPolicy` | M2 | [gas-approval-validation.md](../../docs/bnb/gas-approval-validation.md) |
| `BnbSigningBoundary`, `BnbReconciler` | M2/M3 | [receipt-normalization.md](../../docs/bnb/receipt-normalization.md) |

Chains: BSC (`eip155:56`) and opBNB (`eip155:204`). The package will never accept a private key or mnemonic.
