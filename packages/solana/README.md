# packages/solana — Solana interface spec

> **Status: interface spec, implementation is grant milestone.** Nothing in this package is delivered. Billed only to the Solana Foundation grant.

| Interface | Milestone | Design doc |
|---|---|---|
| `SolanaAccountAdapter`, `MintInfo` | M1 | [spl-normalization.md](../../docs/solana/spl-normalization.md) |
| `SolanaSigningBoundary`, `UnsignedV0Transaction`, `SimulationResult` | M1 | [versioned-transactions.md](../../docs/solana/versioned-transactions.md), [wallet-signing-boundary.md](../../docs/solana/wallet-signing-boundary.md) |
| `JupiterQuoteAdapter`, `JupiterRouteAdapter`, `NormalizedJupiterRoute` | M2 | [jupiter-adapters.md](../../docs/solana/jupiter-adapters.md) |
| `StaleQuoteGuard` | M2 | [stale-quote-guard.md](../../docs/solana/stale-quote-guard.md) |
| `SolanaReconciler` | M3 | [reconciliation.md](../../docs/solana/reconciliation.md) |

Transactions cross the boundary as base64-serialized unsigned `VersionedTransaction`s. The package will never accept a `Keypair`, secret key bytes or a keypair file path.
