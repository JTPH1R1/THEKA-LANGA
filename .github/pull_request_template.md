## What this PR does

<!-- One sentence summary -->

## Phase

<!-- Which build phase does this belong to? e.g. Phase 2 — Auth -->

## Checklist

- [ ] `pnpm typecheck` passes (zero errors)
- [ ] `pnpm lint` passes (zero warnings)
- [ ] `pnpm test:unit` passes
- [ ] New DB tables have RLS policies written and tested
- [ ] If migrations added: `pnpm types:generate` run and committed
- [ ] No `select('*')` in production query paths
- [ ] New components have loading and empty states
- [ ] Tested on 375px mobile viewport
- [ ] No `console.log` left in code
- [ ] No `any` types introduced
