## Summary

- What changed?
- Why was this change needed?

## Change type

- [ ] real implementation recovery
- [ ] compatibility layer / shim
- [ ] stub / no-op boundary
- [ ] build pipeline change
- [ ] runtime compatibility fix
- [ ] documentation only

## Affected path(s)

- [ ] reduced local build
- [ ] full local build
- [ ] interactive REPL startup
- [ ] print mode / request path
- [ ] docs / contributor experience

## Validation

List the exact commands you ran.

```bash
# example
bun run build:local
bun run build:full-local
bun ./dist/local/cli.local.js doctor
bun ./dist/full/cli.js --help
```

## Current boundaries / known limitations

If this change still leaves limits in place, state them explicitly.

Examples:

- full local CLI starts, but real requests still depend on auth / proxy configuration
- this is a stub for open-source buildability, not a full upstream restoration
- this only affects reduced build diagnostics, not full CLI runtime

## Notes for reviewers

Anything reviewers should pay special attention to?
