# Jupiter quote + route adapters (Solana M2)

> Status: design. Implementation is grant milestone work. Jupiter endpoint versions and base URLs are pinned at implementation time against Jupiter's then-current official documentation.

## Quote adapter
- Request: `inputMint`, `outputMint`, `amount` (base units), `slippageBps`, optional `onlyDirectRoutes`, `maxAccounts` (keeps routes small enough for one v0 transaction).
- Response normalization → `NormalizedJupiterRoute`:
  - `expectedOut` = quoted out amount; `minOut` = out amount after slippage threshold;
  - `priceImpactBps` from the quote's price impact;
  - `legs[]` from the route plan (AMM label, input/output mint, fee amount where reported);
  - `contextSlot` from the quote response; `quotedAt` = local receive time;
  - `raw` retained for audit only.
- Validation: mints echo the request; amounts are integer strings; `minOut ≤ expectedOut`; route legs chain from input to output mint. Violations → `QUOTE_INVALID`.

## Route adapter
- Converts the chosen route into instructions + ALT addresses (Jupiter swap-instructions style), which the v0 builder compiles. The toolkit does **not** use a pre-built signed or partially-signed transaction from any API.
- Program ids in the returned instructions are checked against an allow-list (Jupiter program, token programs, ATA program, compute budget, system program for ATA creation only).

## Route decision
Multiple candidates (e.g. default, direct-only, restricted `maxAccounts`) are compared by: net output after network + priority + token transfer fees → price impact → hop count. The chosen route and rejected candidates with reasons are written into `ExecutionIntent.route`.

## Failure handling
Rate limiting / 5xx → bounded retry with backoff, then `QUOTE_UNAVAILABLE` (block). There is no fallback to unchecked routes.

## Tests (M2 acceptance)
Recorded quote fixtures → normalized routes; decision tests with reasons; malformed quote fixtures rejected.
