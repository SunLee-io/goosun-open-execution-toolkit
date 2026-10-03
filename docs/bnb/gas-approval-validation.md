# Gas and approval validation (BNB M2)

> Status: design. Implementation is grant milestone work.

Runs inside the risk gate, before any calldata is returned for signing.

## Gas
| Check | Rule | Reason |
|---|---|---|
| Gas price / max fee per gas ≤ per-chain cap (`maxGasPriceGwei[chain]`) | GAS_CAP | `GAS_PRICE_ABOVE_CAP` |
| Gas limit ≤ `maxGasLimit` and ≥ estimate | GAS_CAP | `GAS_LIMIT_ABOVE_CAP` |
| (L2 fee + L1 data fee on opBNB) / notional ≤ `maxFeeShareBps` | FEE | `FEE_SHARE_ABOVE_CAP` |
| Estimate failed (would revert) | SIMULATION_MATCH | `SIMULATION_FAILED` |

## Approvals
| Check | Rule | Reason |
|---|---|---|
| Spender equals the pinned router for (venue, chain) | APPROVAL | `SPENDER_NOT_PINNED` |
| Allowance ≥ sell amount, or an exact-amount approval is prepended | APPROVAL | `ALLOWANCE_INSUFFICIENT` (if approval not permitted by policy) |
| Requested approval is unlimited and `allowUnlimitedApproval=false` | APPROVAL | `UNLIMITED_APPROVAL_BLOCKED` |
| Existing unlimited allowance to a non-pinned spender | APPROVAL (warning record) | `UNLIMITED_ALLOWANCE_PRESENT` |

## Kill switch and circuit breaker
Both are evaluated before these checks at every BNB entry point (agent pipeline, direct SDK call, example app). Circuit breaker triggers: revert rate over window, RPC failure rate (from `Connection` health), price deviation vs. reference quote.

## Tests (M2 acceptance)
One blocking test per row above, each asserting no calldata is produced.
