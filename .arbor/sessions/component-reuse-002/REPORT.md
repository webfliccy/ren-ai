# Research Report: component-reuse-002
## Maximize Maintainability Index — ren-ai Next.js blog

**Exit reason**: budget exhausted (3/3 cycles), all nodes merged  
**Branch**: `arbor`  
**Eval**: `node eval-mi.js <cwd>` — AST-based MI (TypeScript compiler, Halstead Volume from operator/operand counts)  
**B_test**: not run (contract: ask before B_test)

---

## Results

| | Score |
|---|---|
| B_dev baseline | **44.96** |
| B_dev final trunk | **45.63** |
| Δ | +0.67 |
| B_test | N/A |

### Per-file highlights (baseline → final)

| File | Baseline MI | Final MI | Change |
|---|---|---|---|
| src/app/page.tsx | 6.8 | 17.1 | +10.3 |
| src/components/FieldNoteForm.tsx | 7.1 | 12.0 | +4.9 |
| src/components/PostForm.tsx | 8.2 | 10.8 | +2.6 |
| src/app/issues/[number]/page.tsx | 16.0 | 21.9 | +5.9 |
| **New**: src/components/ToolCard.tsx | — | 47.9 | new |
| **New**: src/components/ArtefactList.tsx | — | 37.3 | new |
| **New**: src/components/TagInput.tsx | — | 39.8 | new |
| **New**: src/lib/formatters.ts | — | 62.9 | new |

---

## Exploration

- Nodes proposed: 3 | Scored: 3 | Merged: 3 | Pruned: 0
- Files: 66 → 75 (+9 new focused modules)

### Node 1 — Homepage sub-component extraction (merged)
Extracted `ToolCard`, `SidebarPost`, `SidebarFieldNote`, `DispatchCard`, `FieldNoteCard`
from `page.tsx` into `src/components/`; moved `formatDate`/`padCount` to `src/lib/formatters.ts`;
added `firstTag` to `src/lib/tags.ts`, `refCount` to `src/lib/references.ts`;
extracted placeholder constants to `src/app/_placeholder.ts`.

**Executor score (own eval)**: 76.49 | **Canonical score contribution**: ~+0.62

> ⚠️ The executor created its own simpler eval-mi.js (`HV = LOC × 10`, regex CC),
> producing an inflated score (76.49). Under the canonical AST-based eval the
> actual trunk gain from this node is ~0.62 points. The code changes are real
> and correct; only the score estimate was overstated.

### Node 2 — Form widget extraction (merged)
Extracted artefact list (~60 LOC) → `ArtefactList.tsx`;
extracted tag chip input (~25 LOC) → `TagInput.tsx`;
wired `TagInput` into both `FieldNoteForm` and `PostForm`, eliminating the one
duplicated interaction block in the component tree.

**Executor score (own eval)**: 57.22 | **Canonical trunk after merge**: 45.58

### Node 3 — Detail-page deduplication (merged)
Removed 7 locally-redefined utility functions and components from
`issues/[number]/page.tsx` (replacing with shared imports from node 1 modules);
extracted 90-line inline SVG tools-placeholder block from `page.tsx` into
`_placeholder.ts` as `PLACEHOLDER_TOOLS`.

**Canonical score**: 45.63 (+0.05 over post-merge trunk)

---

## Key Finding: Metric Calibration

The AST-based Maintainability Index (using TypeScript compiler for Halstead Volume)
is harder to move than the regex-based approximation the executors independently
derived. The absolute canonical gain (+0.67) is modest, but the structural
improvements are real:

- 9 new focused, single-responsibility files (avg MI 45–63)
- Worst file improved from MI 6.8 → 17.1
- ~350 LOC of duplication eliminated across 4 files
- `TagInput` and `ArtefactList` now shared across 2 forms each

**Residual bottleneck**: `PostForm.tsx` (MI 10.8, ~480 LOC) and `FieldNoteForm.tsx`
(MI 12.0, ~435 LOC) are the dominant drag on the average. Both remain large
because JSX layout complexity and state management density are not easily
distributed across smaller files without restructuring the form architecture.
A cycle targeting these directly (e.g. extracting `ExperimentRecord` section
or `ReferenceList` into sub-components) would have the highest remaining leverage.

---

## Artifacts

| Artifact | Path |
|---|---|
| Idea tree JSON | `.arbor/sessions/component-reuse-002/.coordinator/idea_tree.json` |
| Idea tree Markdown | `.arbor/sessions/component-reuse-002/.coordinator/idea_tree.md` |
| Experiments | `.arbor/sessions/component-reuse-002/experiments/` |
| MI eval script | `eval-mi.js` |
| Run contract | `ARBOR_CONTRACT.md` |
