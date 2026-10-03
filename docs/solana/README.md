# Solana design documents

> Status: **design only. Nothing on Solana native execution is delivered yet; it is Solana Foundation grant milestone work (M1–M3).**

| Doc | Topic | Milestone |
|---|---|---|
| [spl-normalization.md](./spl-normalization.md) | SOL / SPL / Token-2022 balance and mint normalization | M1 |
| [versioned-transactions.md](./versioned-transactions.md) | v0 transactions, Address Lookup Tables, compute budget, simulation | M1 |
| [wallet-signing-boundary.md](./wallet-signing-boundary.md) | What crosses the boundary to the user's wallet, and what never does | M1 |
| [jupiter-adapters.md](./jupiter-adapters.md) | Jupiter quote + route adapters, normalization, route decision | M2 |
| [stale-quote-guard.md](./stale-quote-guard.md) | Quote age + slot drift + blockhash validity | M2 |
| [reconciliation.md](./reconciliation.md) | Signed intent vs. `getTransaction`, failure recovery | M3 |

Interfaces: [`packages/solana/src/index.ts`](../../packages/solana/src/index.ts).
