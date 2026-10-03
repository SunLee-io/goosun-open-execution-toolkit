# BSC / opBNB RPC abstraction + failover (BNB M1)

> Status: design. Implementation is grant milestone work.

## Endpoint pools
One pool per chain (`eip155:56`, `eip155:204`), configured by the caller (public endpoints or the caller's own providers; credentials are injected by the caller's transport and never stored in this repo).

## Health scoring
Every `healthIntervalMs` each endpoint is probed with `eth_chainId` and `eth_blockNumber`:
- wrong chain id → `WRONG_CHAIN` (permanently excluded until reconfigured);
- head lag > `maxHeadLagBlocks` behind the best head in the pool → `STALE_HEAD`;
- timeout / 5xx / JSON-RPC error ≥ `failureThreshold` in a row → `DOWN` for `cooldownMs`;
- otherwise `HEALTHY`, ranked by latency EWMA and weight.

## Request routing
- Reads go to the best `HEALTHY` endpoint; on failure → next endpoint (bounded attempts), each response tagged with provider and block.
- Read-method allow-list (e.g. `eth_call`, `eth_getBalance`, `eth_getTransactionReceipt`, `eth_getTransactionCount`, `eth_estimateGas`, `eth_gasPrice`, `eth_feeHistory`, `eth_getLogs` with bounded ranges). Anything else is rejected (`METHOD_NOT_ALLOWED`).
- Consistency: multi-call reads for one decision are pinned to a block number (`blockTag`) to avoid mixing heads.
- The toolkit does not broadcast; `eth_sendRawTransaction` is not in the read pool.

## Outputs
`Connection` records (schema) per endpoint, used by the `CIRCUIT_BREAKER` rule (RPC failure rate).

## Tests (M1 acceptance)
Simulated endpoints for: primary down, wrong chain id, stale head, flapping endpoint — on both chain ids; assertions on chosen provider and recorded health.
