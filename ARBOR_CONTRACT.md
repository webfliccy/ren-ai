# Arbor Run Contract — component-reuse-001

| Field | Value |
|---|---|
| Target | /Users/felicityevans/Code/ren-ai |
| Branch | arbor (base: main) |
| Run name | component-reuse-001 |
| Metric | Total JS chunk size (KB) from `.next/static/chunks/` |
| Direction | minimize |
| Eval cmd | `cd {cwd} && bash eval.sh` → `score: <KB>` |
| Baseline | 1372 KB |
| Trunk score | 1372 KB |
| Ambition | Reduce JS bundle / duplication through shared modules and style constants |
| Scope | Component reuse: shared Tailwind class constants, shared utility fns, consolidated CSS tokens |
| Max cycles | 3 |
| B_dev | pnpm build on arbor branch |
| B_test | ask before running |
| Protected | `src/db/`, `src/auth.ts`, `drizzle.config.ts`, `.env*`, `public/uploads/` |
| Edit surface | `src/components/`, `src/lib/`, `src/app/globals.css`, `src/app/**/*.tsx` |
| Installs | ask before any `pnpm add` |
| Interaction | collaborative — ask before package installs, B_test |
