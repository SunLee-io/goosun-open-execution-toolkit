# Wallet, BEP-20 token and allowance normalization (BNB M1)

> Status: design. Implementation is grant milestone work.

## Wallet
Native BNB balance (`eth_getBalance`, wei, 18 decimals) and nonce (`eth_getTransactionCount`, `pending`) per chain, pinned to a block.

## Tokens
- `Bep20Token`: address (checksummed), `symbol`, `decimals` read from the contract (`decimals()`), never trusted from a list alone.
- Canonical token list per chain maintained in the repo with source links; tokens outside the list are allowed only by policy and flagged.
- Bridged-asset mapping between BSC and opBNB (`bridgedFrom`) so balances of the same asset on both chains are not double-counted or confused.
- Balance reads via batched `eth_call` (`balanceOf`) at one block.
- Non-standard tokens (fee-on-transfer, rebasing) detected by simulation of a transfer delta in M2 tests and blocked by default.

## Allowances
- `AllowanceState` for (owner, token, spender) at a block; `unlimited = allowance ≥ 2^255` (treated as unlimited).
- Spender must be a **pinned** router address for the venue/chain (`SPENDER_NOT_PINNED` otherwise).
- `buildApprove` produces exact-amount approvals; `buildRevoke` produces `approve(spender, 0)`. Both unsigned.
- Some tokens require resetting a non-zero allowance to 0 before changing it; the builder emits the reset step when needed.

## Tests (M1 acceptance)
Read-only mainnet readback on BSC and opBNB for a documented test wallet: native balance, ≥ 3 BEP-20 balances, ≥ 1 allowance — matching the explorer at the recorded block.
