# Arbor Run Contract — component-reuse-002

| Field | Value |
|---|---|
| Target | /Users/felicityevans/Code/ren-ai |
| Branch | arbor (base: main) |
| Run name | component-reuse-002 |
| Metric | Average Maintainability Index (MI) across src/**/*.{ts,tsx} |
| Direction | maximize (higher = more maintainable, max 100) |
| Eval cmd | `node {cwd}/eval-mi.js {cwd}` → `score: <MI>` |
| Baseline | 44.96 |
| Trunk score | 44.96 |
| Ambition | Push MI as high as possible by reducing complexity, splitting large files, improving cohesion |
| Scope | src/components/, src/lib/, src/app/**/*.tsx — focus on low-MI files |
| Max cycles | 3 |
| B_dev | node eval-mi.js on arbor branch |
| B_test | ask before running |
| Protected | src/db/, src/auth.ts, drizzle.config.ts, .env*, public/uploads/ |
| Edit surface | src/components/, src/lib/, src/app/**/*.tsx |
| Installs | ask before any `pnpm add` |
| Interaction | collaborative — ask before package installs, B_test |

## Worst files (baseline)
| File | MI |
|---|---|
| src/app/page.tsx | 6.8 |
| src/components/FieldNoteForm.tsx | 7.1 |
| src/components/PostForm.tsx | 8.2 |
| src/app/issues/[number]/page.tsx | 16.0 |
| src/app/field-notes/[slug]/page.tsx | 16.3 |
| src/app/admin/page.tsx | 17.9 |
| src/app/[slug]/page.tsx | 19.7 |
