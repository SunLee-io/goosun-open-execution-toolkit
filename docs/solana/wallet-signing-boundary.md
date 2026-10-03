# Wallet signing boundary (Solana M1)

> Status: design. Implementation is grant milestone work.

## Rule
The toolkit **builds and checks**; the user's wallet **signs**. Nothing that can sign ever enters the toolkit.

| Crosses the boundary → wallet | Never crosses the boundary |
|---|---|
| base64 unsigned v0 transaction | `Keypair` objects, secret-key bytes, mnemonics |
| `SigningSummary` (sells, minimum receives, programs touched, approvals, expiry, `intentHash`) | keypair file paths (`id.json`), env vars holding keys |
| `lastValidBlockHeight` | session tokens of wallets |

| Crosses back ← wallet | |
|---|---|
| transaction signature (base58) after the wallet sends, or the signed transaction if the caller sends | |

## Enforcement
1. Public API types have no parameter that can carry key material (see `SolanaSigningBoundary`).
2. Runtime guard: inputs are scanned for 64-byte arrays / base58 strings of secret-key length and for mnemonic word patterns; detection throws `KEY_MATERIAL_REJECTED` and nothing is logged.
3. Test (M1 acceptance): a test proves that every public entry point rejects key-like inputs.
4. Autonomous agents: if a user wants an agent to sign without prompts, the key stays in the **user's** environment (wallet, HSM or their own signer process). The toolkit treats that signer exactly like a wallet.

## Wallet integration
Wallet-standard compatible wallets receive the unsigned `VersionedTransaction` through `signAndSendTransaction` / `signTransaction`. The `SigningSummary` is rendered by the integrating app before the wallet prompt so the user sees the same numbers the risk gate checked.
