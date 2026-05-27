---
name: Build or runtime regression
about: Report a reduced/full local build failure, startup regression, or runtime behavior change
title: '[build/runtime] '
labels: ['bug']
assignees: []
---

## Summary

What broke?

## Which path is affected?

- [ ] `bun run build:local`
- [ ] `bun run build:full-local`
- [ ] `dist/local/cli.local.js`
- [ ] `dist/full/cli.js`
- [ ] interactive REPL startup
- [ ] print mode (`-p`)

## Expected behavior

What did you expect to happen?

## Actual behavior

What actually happened?

## Exact command(s)

Paste the exact command(s) you ran.

```bash
# example
bun run build:full-local
bun ./dist/full/cli.js --help
```

## Output / logs

Paste the relevant output.

```text

```

## Environment

- OS:
- Shell:
- Bun version:
- Repository commit / branch:

## If this involves actual requests

Only answer if relevant.

- Are you using `ANTHROPIC_API_KEY`?
- Are you relying on existing OAuth / login state?
- Are you using a custom `ANTHROPIC_BASE_URL` or proxy?

Do **not** paste secrets, tokens, or private credentials.

## Minimum repro

Can you reproduce this from a fresh terminal with just a few commands?

## Notes on repo boundaries

If you already know whether this is in:

- original snapshot logic
- a local compatibility layer
- `stubs/`
- `scripts/build-local.ts` / `scripts/build-full-local.ts`

please mention it here.
