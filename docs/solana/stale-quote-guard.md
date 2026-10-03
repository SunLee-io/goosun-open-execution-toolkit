# Stale-quote guard (Solana M2)

> Status: design. Implementation is grant milestone work.

A Solana quote is only meaningful for a short window. The guard combines three independent signals; any one failing blocks.

| Signal | Source | Default limit | Reason |
|---|---|---|---|
| Quote age | `now − quotedAt` | 10 s (policy `maxQuoteAgeMs`) | `QUOTE_TOO_OLD` |
| Slot drift | `currentSlot − contextSlot` | 25 slots (policy `maxBlockDrift`) | `SLOT_DRIFT_EXCEEDED` |
| Blockhash validity | `blockHeight < lastValidBlockHeight` at build and before returning to wallet | protocol window | `BLOCKHASH_EXPIRED` |
| Clock sanity | `quotedAt` not in the future, parseable | — | `QUOTE_TIME_INVALID` |

Notes
- Slot drift is measured against a slot read from the same RPC pool used for building, avoiding cross-provider skew.
- Limits are policy values recorded on every `RiskDecision`; defaults above are starting points to be calibrated by the M2 shadow run (≥ 100 cycles) and reported in the benchmark.
- After the wallet returns, a transaction whose blockhash expired is **not** rebuilt automatically; a new intent → new risk decision is required.
