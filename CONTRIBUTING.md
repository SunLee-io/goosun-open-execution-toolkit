# Contributing

Thanks for your interest. The toolkit is at the v0 design stage; the most useful contributions right now are reviews of the schemas, interfaces and chain design documents.

## Ground rules

1. **License.** By contributing you agree your contribution is licensed under Apache-2.0 (see [LICENSE](./LICENSE)). Contributions must be your own original work.
2. **No third-party source** is copied into this repository unless its license is compatible with Apache-2.0 and the notice is preserved in `NOTICE`. Dependencies are declared, not vendored.
3. **No secrets.** Never commit API keys, RPC keys, private keys, keypair files, `.env` files or real wallet data. Use obviously fake placeholders in examples.
4. **No strategy logic.** This repository contains execution and risk infrastructure only — no trading strategies, signals or alpha.
5. **Honest status.** Docs must not describe planned features as delivered. Use the status words `DESIGN`, `INTERFACE SPEC`, `IN PROGRESS`, `DELIVERED (tag/commit)`.
6. **Fail closed.** New risk rules must reject on missing or stale inputs and must ship with a blocking test.

## Workflow

- Open an issue describing the change before large pull requests.
- Keep chain-specific code inside its chain package (`packages/solana`, `packages/bnb`).
- Schema changes: update the JSON Schema, the TypeScript type in `packages/common`, and an example payload together.
- Pull requests need passing CI (once CI exists) and one maintainer review.

## Code of conduct

Be respectful and constructive. Harassment of any kind is not tolerated.
