# Reconciliation (Solana M3)

> Status: design. Implementation is grant milestone work.

## Inputs
`ExecutionIntent`, the transaction signature (if any), `lastValidBlockHeight`.

## Procedure
1. `getSignatureStatuses([sig], {searchTransactionHistory:true})`.
2. If found and finalized/confirmed: `getTransaction(sig, {maxSupportedTransactionVersion:0, commitment:'confirmed'})`.
3. Compute the signer's deltas from `meta.preTokenBalances` / `meta.postTokenBalances` (per mint, owner = user) and SOL delta from `preBalances` / `postBalances` minus `meta.fee`.
4. Compare with the intent: `sold` must equal intent `sellAmount` (+ transfer-fee extension effects); `bought` must be ≥ `minOut`. Within tolerance → `MATCH` / `WITHIN_TOLERANCE`; otherwise `MISMATCH` with reason codes.
5. If `meta.err` is set → `onchainStatus: FAILED`, `result: NOT_EXECUTED` (fees still recorded).
6. If not found and current block height > `lastValidBlockHeight` → `EXPIRED`, `NOT_EXECUTED`. If not found and still valid → `PENDING` (re-check later).
7. Emit `ReconciliationRecord` + `Fill[]`; update positions and daily exposure from fills only.

## Failure recovery
- Expired blockhash, dropped transaction, on-chain failure: recorded, never re-signed or re-submitted by the toolkit. `duplicateSubmission` is always `false`; any duplicate is an incident.
- The agent may submit a **new** intent, which goes through the full risk gate again.

## Evidence (M3 acceptance)
A reconciliation record for every mainnet transaction in the evidence set, published with signatures and slots.
