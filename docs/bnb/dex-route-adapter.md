# BNB DEX route adapter + quote aggregation (BNB M2)

> Status: design. Implementation is grant milestone work.

## Adapter
- First adapter: **PancakeSwap** on BSC and opBNB. Router / quoter / factory addresses are pinned per chain in a reviewed config file with the official source link, and verified at startup and in CI by on-chain readback (bytecode present at address; factory/WETH-equivalent getters match).
- `quote(req)` returns `BnbRouteCandidate[]`: `path`, `router`, `expectedOut`, `minOut` (after slippage), `gasEstimate`, `requiresApproval` (from `AllowanceState`), `quotedAt`, block.
- Quotes are computed by on-chain read calls (`eth_call` to the venue's quoter / pair reserves) at a pinned block, so the quote is reproducible.
- `buildSwap(candidate, deadline)` returns unsigned calldata with `amountOutMin = minOut`, `recipient = user`, and a short `deadline`.

## Quote aggregation interface
`QuoteAggregator.collect` queries all registered adapters (PancakeSwap first; other venues / aggregator APIs can be added behind the same interface) and returns all candidates **plus** failures with reasons — failures are never silently dropped.

## Execution routing
Choose by: net output after gas (BSC gas or opBNB L2 + L1 data fee) and venue fee → price impact → approval requirement (prefer no new approval) → hop count. Record chosen + rejected candidates with reasons in `ExecutionIntent.route`.

## Tests (M2 acceptance)
Fixed token-pair set per chain → normalized route fixtures; routing decision tests with reasons; address verification test on both chains.
