# Pre-trade risk rules (v0 catalogue)

> Status: design. Each rule will ship with a blocking test (milestone acceptance criterion).

Order of evaluation: `KILL_SWITCH` → `SCHEMA` → `CHAIN_ALLOWED` → `ACCOUNT_OWNERSHIP` → freshness rules → amount / exposure rules → chain-specific rules → `SIMULATION_MATCH`. Any `FAIL` or `MISSING_INPUT` blocks.

| Rule | Checks | Reason codes | Chain |
|---|---|---|---|
| KILL_SWITCH | Global / per-agent / per-account switch | `KILL_SWITCH_ACTIVE` | all |
| SCHEMA | Intent validates against schema | `SCHEMA_INVALID` | all |
| CHAIN_ALLOWED | Chain in policy allow-list; mode allowed | `CHAIN_NOT_ALLOWED`, `MODE_NOT_ALLOWED` | all |
| ACCOUNT_OWNERSHIP | Account belongs to the requesting user; custody = user | `ACCOUNT_NOT_OWNED` | all |
| BALANCE_SUFFICIENT | Sell amount + fees ≤ balance at a fresh block | `BALANCE_INSUFFICIENT`, `BALANCE_STALE` | all |
| SLIPPAGE | Requested and quoted slippage ≤ policy; `minOut` consistent | `SLIPPAGE_ABOVE_LIMIT` | all |
| STALE_QUOTE | Quote age ≤ `maxQuoteAgeMs`; block / slot drift ≤ `maxBlockDrift` | `QUOTE_TOO_OLD`, `SLOT_DRIFT_EXCEEDED` | all |
| BLOCKHASH_VALIDITY | Recent blockhash still valid (block height < lastValidBlockHeight) | `BLOCKHASH_EXPIRED` | Solana |
| FEE | Network + venue + token transfer fees ≤ `maxFeeBps` of notional | `FEE_ABOVE_LIMIT`, `FEE_UNKNOWN` | all |
| GAS_CAP | Gas price / limit ≤ caps; opBNB L1 data fee included | `GAS_PRICE_ABOVE_CAP`, `GAS_LIMIT_ABOVE_CAP` | BNB |
| APPROVAL | Allowance sufficient; spender pinned; unlimited blocked by default | `ALLOWANCE_INSUFFICIENT`, `UNLIMITED_APPROVAL_BLOCKED`, `SPENDER_NOT_PINNED` | BNB |
| POSITION_LIMIT | Post-trade position ≤ limit per asset | `POSITION_LIMIT_EXCEEDED` | all |
| NOTIONAL_LIMIT | Order notional ≤ limit | `NOTIONAL_LIMIT_EXCEEDED` | all |
| DAILY_EXPOSURE | Sum of today's executed + pending notional ≤ limit (UTC day) | `DAILY_EXPOSURE_EXCEEDED` | all |
| LEVERAGE_LIMIT | Effective leverage ≤ limit (spot = 1) | `LEVERAGE_LIMIT_EXCEEDED` | BNB (where applicable) |
| CIRCUIT_BREAKER | Recent revert rate, RPC failure rate, price deviation vs. reference within thresholds | `CIRCUIT_OPEN_REVERTS`, `CIRCUIT_OPEN_RPC`, `CIRCUIT_OPEN_PRICE` | all |
| TOKEN_EXTENSION | Token-2022 extensions on the allow-list (transfer hook / permanent delegate blocked by default) | `TOKEN_EXTENSION_BLOCKED` | Solana |
| SIMULATION_MATCH | Simulated deltas match quote within tolerance; simulation succeeded | `SIMULATION_FAILED`, `SIMULATION_MISMATCH` | all |

## Semantics

- **Fail closed:** a rule that cannot get its input returns `MISSING_INPUT` (e.g. `FEE_UNKNOWN`), which blocks.
- **No partial allow:** one decision per intent.
- **Decisions expire:** builders refuse decisions past `expiresAt`.
- **Policies are versioned:** `policyId` + `policyVersion` are recorded on every decision.
