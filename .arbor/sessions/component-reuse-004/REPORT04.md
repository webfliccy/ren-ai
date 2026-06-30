# Arbor Session Report — component-reuse-004

**Date**: 2026-06-28
**Objective**: Minimize **First Load** JS for the ren-ai Next.js 16 blog via component reuse, shared styles, and shared modules.
**Run mode**: smoke-first (one real baseline build, then iterate). Budget: 3 cycles.

## Metric

| | |
|---|---|
| Metric | Total First Load client JS (KB) = Σ bytes of `.next/static/chunks/*.js` after `pnpm build` |
| Direction | minimize |
| Eval | `node eval-firstload.js {cwd}` → `score: <KB>` |
| Baseline | **1333.01 KB** |
| Final trunk | **1333.01 KB** (no node merged) |

### Why not per-route "First Load JS"?

The user's first choice was true per-route *First Load JS* (the value the old
`next build` table printed). **This is not machine-readable in Next 16 + Turbopack**:

- `next build` no longer prints the Size / First Load JS table (route tree only).
- `next experimental-analyze` emits only binary/interactive data (`*.data`,
  `index.html`); no stable per-route numbers on disk, and the `data/` dir is
  transient.
- No `app-build-manifest.json` is produced (so no route→chunk map).
- The legacy `--webpack` builder (which printed the table) is removed in v16.

Total client-JS chunk bytes is the deterministic, faithful proxy and is exactly
what *component reuse / shared modules* would reduce (by de-duplicating code).
That reframe was flagged to the user before iterating.

## Score Summary

| Checkpoint | First Load JS (KB) | Δ |
|---|---|---|
| Baseline (trunk) | 1333.01 | — |
| Node 1 — extract `ReferencesManager` shared component | 1333.13 | **+0.12 (noise)** |

**No improvement found. Trunk unchanged at 1333.01 KB.**

## What the build is made of

| KB | Chunk | Owner | Reducible by component reuse? |
|---|---|---|---|
| 622.7 | TipTap rich-text editor | already lazy via `next/dynamic({ssr:false})` in all 3 forms; all extensions (StarterKit, Placeholder, Link, Markdown, Table*) are used | No |
| 222.2 | framework/vendor | React / Next runtime | No (out of `src/` scope) |
| 134.2 | vendor | — | No |
| 110.0 | polyfills | browserslist-driven | No (config, not `src/`) |
| ~244 | app/route/client chunks | forms + small client components | Already deduped by Turbopack |

## Findings (the real result of this run)

1. **The codebase is already well-factored for reuse.** Forms already share
   `FormField`, `TagInput`, `ArtefactList`, `slugify`, `parseTags`, and
   `@/lib/styles`. Prior MI sessions (001–003) already extracted the shared lib
   modules. There is **no remaining cross-component duplication** to collapse.

2. **Markdown + KaTeX are server-only** (`src/lib/markdown.ts` renders at
   request/build time → "no client JS"). They contribute **0 KB** to first load,
   so they are not a target.

3. **The dominant client chunk (TipTap, 622 KB) is already optimally
   code-split** and every extension it loads is actually used (tables are used
   by FieldNoteForm). Nothing safe to trim.

4. **Component reuse / shared-module extraction is byte-neutral** — empirically
   confirmed by Node 1: moving ~80 LOC into a reusable `ReferencesManager`
   component changed total client JS by **+0.12 KB** (module-boundary overhead).
   Turbopack includes identical code whether inline or imported, and hoists
   shared imports into common chunks automatically. **The premise that
   "component reuse reduces First Load" does not hold for a modern
   Turbopack-bundled app — the bundler already does this deduplication.**

## Recommendation

First Load JS on this app is **already near-optimal for its feature set**.
Further `src/`-scoped component-reuse refactoring will not reduce it. The only
remaining levers are out of the stated scope and are deferral/removal, not reuse:

- Keep the TipTap editor lazy (done). If editor weight matters, evaluate a
  lighter editor or trimming `tiptap-markdown`/`marked` from the editor path.
- Tighten `browserslist` to shrink the 110 KB polyfill chunk (config change).
- These would be a new run with a *route-level* eval; not pursued here.

**Stopped after 1 cycle** (not 3): static analysis + one empirical node gave a
conclusive null result; additional cycles of the same change class would
reproduce ~0 KB. Continuing would burn budget without new information.

## Artifacts

- `ARBOR_CONTRACT.md` — run contract
- `.coordinator/idea_tree.json` — durable Idea Tree (ROOT + node 1, insights)
- `eval-firstload.js` (repo root) — the First Load JS eval
- Node 1 worktree built & measured, then pruned (change not merged)
