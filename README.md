# OpenGeodeWeb-Front

OpenSource Vue/Vuetify framework for web applications.

## Development

This codebase is written in TypeScript (`strict` mode, `noUncheckedIndexedAccess`).

- `npm run lint` — runs [oxlint](https://oxc.rs/docs/guide/usage/linter.html) with autofix. The project's `.oxlintrc.json` must stay in sync with the shared [`Geode-solutions/actions`](https://github.com/Geode-solutions/actions) config, which CI re-downloads and enforces on every run.
- `npm run test:unit` / `npm run test:integration` — run the Vitest suites under `tests/`.
