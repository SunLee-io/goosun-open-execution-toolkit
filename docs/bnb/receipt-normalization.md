# Transaction + receipt normalization and reconciliation (BNB M1 / M3)

> Status: design. Implementation is grant milestone work.

## Unsigned transaction normalization (`UnsignedEvmTx`)
- `chain`, `to`, `data`, `value`, `gasLimit` (from `eth_estimateGas` × safety margin, capped by policy), `nonce` (optional; the wallet may fill it).
- Fee fields: legacy `gasPrice` or EIP-1559 `maxFeePerGas`/`maxPriorityFeePerGas`, as supported by the chain's nodes at implementation time.
- opBNB is an OP Stack L2: total cost = L2 execution fee + **L1 data fee**. The L1 data fee is estimated (via the chain's gas-price oracle predeploy) and stored in `l1DataFeeEstimate` so the `FEE` / `GAS_CAP` rules see the full cost.

## Receipt normalization (`NormalizedReceipt`)
- `status`: `SUCCESS` (status 1), `REVERTED` (status 0 with revert data), `OUT_OF_GAS` (status 0 and gasUsed == gasLimit), `NOT_FOUND`.
- Revert reason decoded from `Error(string)` / `Panic(uint256)` / custom error selector via re-execution (`eth_call` at the block) when available.
- `gasUsed`, `effectiveGasPrice`, and on opBNB `l1Fee` from the receipt.
- `transfers`: decoded ERC-20 `Transfer` logs plus native value movement relevant to the owner → mapped to `Fill` (`sold`, `bought`, `networkFee`).

## Reconciliation
Same contract as Solana: compare intent (`sellAmount`, `minOut`) with decoded transfers; `MATCH` / `WITHIN_TOLERANCE` / `MISMATCH` / `NOT_EXECUTED` / `PENDING`. Replaced/dropped transactions (nonce consumed by another tx) are detected by nonce + hash lookup and recorded; the toolkit never re-submits.

## Tests (M1 acceptance)
Receipt fixtures for success, revert and out-of-gas on both BSC and opBNB.
