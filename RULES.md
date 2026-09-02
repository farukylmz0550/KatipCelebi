# Development Rules

## Git Workflow

**Commit and push after every logical step is completed.**

- Step definition: a single responsibility (SRP) is completed (e.g., a module, a fix, an e2e spec, a config change)
- Commit message: short, conventional (`feat:`, `fix:`, `test:`, `docs:`, `chore:`)
- Push: `git push origin main` after every commit
- Excluded: `*.webm`, `node_modules`, `.next`, `prisma/dev.db` (already in .gitignore)

## Related Files

- `CLAUDE.md` and `AGENTS.md` reference this rule
- `e2e/` tests, `src/app/api/test/reset` and other dev-only helpers are also subject to this rule
