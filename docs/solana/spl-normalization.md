# SPL / Token-2022 normalization (Solana M1)

> Status: design. Implementation is grant milestone work.

## Problem
A wallet's holdings on Solana are spread across the system account (SOL in lamports) and token accounts owned by two token programs (SPL Token and Token-2022). Agents that read "the balance" naïvely miss tokens in non-associated accounts, mis-scale decimals, or ignore Token-2022 extensions that change trade economics.

## Design
1. **Native SOL** — `getBalance(owner)` in lamports → `Balance{asset.kind:'native', decimals:9}`; rent-exempt minimum for the account reported separately so agents do not plan to spend it.
2. **Token accounts** — `getTokenAccountsByOwner` for **both** program ids (SPL Token, Token-2022) with `jsonParsed` encoding, at a single `minContextSlot`/commitment so all balances share one slot.
3. **Aggregation** — balances are aggregated per mint; the associated token account (ATA) is recorded in `tokenAccount`; non-ATA accounts are kept as separate rows with a flag so a swap does not silently pull from them.
4. **Mint metadata** — `MintInfo` (decimals, program, freeze authority, extensions) is read once per mint and cached with slot; decimals always come from the mint, never from a token list.
5. **Token-2022 extensions** — parsed from mint account data: `transferFeeConfig` (fee bps + maximum fee for the current epoch), `transferHook`, `permanentDelegate`, `nonTransferable`, `defaultAccountState`, `interestBearingConfig`. Policy default: transfer fee is included in the `FEE` rule; `transferHook` and `permanentDelegate` mints are blocked unless explicitly allowed (`TOKEN_EXTENSION_BLOCKED`).
6. **Amounts** — kept as integer strings in base units (`Amount.raw`) with `decimals` from the mint.

## Tests (M1 acceptance)
Devnet fixtures with: SOL only; SPL ATA; SPL non-ATA; Token-2022 with transfer fee; Token-2022 with transfer hook (blocked). Assertions on raw amounts, decimals, extension list and slot consistency.
