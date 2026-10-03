# Versioned Transactions (v0) (Solana M1)

> Status: design. Implementation is grant milestone work.

## Why v0
Multi-hop swaps reference many accounts. Legacy transactions hit the 1232-byte packet limit quickly; v0 transactions with Address Lookup Tables (ALTs) compress account references to 1-byte indexes, so routed swaps fit in one transaction.

## Builder
1. Inputs: chosen route instructions, payer (= user's wallet public key), ALT addresses, compute-budget options, a matching `ALLOW` `RiskDecision`.
2. Fetch ALTs (`getAddressLookupTable`) and verify each is active (not deactivated) at the current slot.
3. Prepend `ComputeBudgetProgram.setComputeUnitLimit` / `setComputeUnitPrice` when configured; priority-fee price is capped by policy and counted in the `FEE` rule.
4. `getLatestBlockhash` (commitment `confirmed`) → `recentBlockhash` + `lastValidBlockHeight`.
5. Compile a `MessageV0`, serialize, check size ≤ 1232 bytes; fail with `TX_TOO_LARGE` otherwise (never silently drop instructions).
6. `simulateTransaction` with `sigVerify:false`, `replaceRecentBlockhash:false`, requesting post-token balances for the signer's token accounts; derive `tokenDeltas`.
7. Return base64 unsigned transaction + `SimulationResult` + `SigningSummary`.

## Invariants
- Payer and only signer = the user's wallet. The toolkit adds no signer of its own.
- No `SystemProgram.transfer` or token `approve`/`setAuthority` instructions to non-route accounts are allowed; the builder inspects compiled instructions against an allow-list of program ids for the route (`PROGRAM_NOT_ALLOWED`).
- Simulation failure blocks (`SIMULATION_FAILED`).
