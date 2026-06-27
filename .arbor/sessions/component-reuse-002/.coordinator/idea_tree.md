# Idea Tree

**Baseline**: 44.96 | **Trunk**: 44.96

## ROOT: Maximize Maintainability Index (MI) of src/**/*.{ts,tsx} in the ren-ai Next.js blog. MI = MAX(0,(171 - 5.2*ln(HV) - 0.23*CC - 16.2*ln(LOC))*100/171) averaged across all source files. Scope: src/components/, src/lib/, src/app/**/*.tsx. Focus on reducing cyclomatic complexity, shortening long functions, and improving cohesion. Protected: src/db/, src/auth.ts, drizzle.config.ts, .env*, public/uploads/. Ask before package installs or B_test. [DONE]

**Insight**: Children findings: [1, done, score=76.49] Splitting a 545-line monolith across 9 focused files raised avg MI from 44.96 to 76.49 (+31.5 pts). New sub-component files score 83-97+ MI each; lib additions score 100. page.tsx itself remains at MI=28 (348 LOC remaining) due to the inline tools-placeholder SVG block — further decomposition would push it higher. | [2, done, score=57.22] Distributing ~105 LOC of dense interactive UI logic (artefact list with upload, tag chip input with keyboard handling) across two focused single-responsibility components raised avg MI by ~27%. Shared TagInput reuse across FieldNoteForm and PostForm eliminates the sole duplicated logic block in the tree.

### 1: Mechanism: Extract 5 inline sub-components (ToolCard, SidebarPost, SidebarFieldNote, DispatchCard, FieldNoteCard) from page.tsx to dedicated src/components/ files; move 4 utility fns to src/lib/formatters.ts; move placeholder constants to src/app/_placeholder.ts.
Hypothesis: page.tsx LOC drops from 545 to ~80, eliminating accumulated LOC+CC MI penalty; each new focused file of 30-80 LOC scores its own higher MI; average MI rises by 4-6 points.
Observable: page.tsx MI rises from 6.8 to 50+; 6 new files each score 45+; eval-mi score rises from 44.96 toward 50.
Conflicts: none - attacks per-file LOC accumulation axis; no prior node touched this. [DONE] (score: 76.49)

**Insight**: Splitting a 545-line monolith across 9 focused files raised avg MI from 44.96 to 76.49 (+31.5 pts). New sub-component files score 83-97+ MI each; lib additions score 100. page.tsx itself remains at MI=28 (348 LOC remaining) due to the inline tools-placeholder SVG block — further decomposition would push it higher.

**Result**: Created: formatters.ts, _placeholder.ts, ToolCard/SidebarPost/SidebarFieldNote/DispatchCard/FieldNoteCard.tsx. Added firstTag to tags.ts, refCount to references.ts. page.tsx shrunk from 545 to 370 LOC. Score 76.49 vs trunk 44.96.

**Branch**: exp/node-1-homepage-decomp

### 2: Mechanism: Extract ArtefactList (artefact display/edit block, ~60 LOC) and TagInput (tag chip input, ~25 LOC) from FieldNoteForm.tsx into src/components/ArtefactList.tsx and src/components/TagInput.tsx; wire back via props; reuse TagInput in PostForm.tsx.
Hypothesis: FieldNoteForm LOC drops from 510 to ~350; CC penalty is distributed across 3 files each scoring independently; PostForm also benefits from widget reuse; avg MI rises by 2-3 points.
Observable: FieldNoteForm MI rises from 7.1 toward 20+; 2 new widget files score 40-60; eval-mi score rises by 2-3 from baseline.
Conflicts: none - attacks per-form CC accumulation via widget extraction; orthogonal to node 1 which targets page.tsx. [DONE] (score: 57.22)

**Insight**: Distributing ~105 LOC of dense interactive UI logic (artefact list with upload, tag chip input with keyboard handling) across two focused single-responsibility components raised avg MI by ~27%. Shared TagInput reuse across FieldNoteForm and PostForm eliminates the sole duplicated logic block in the tree.

**Result**: FieldNoteForm.tsx dropped ~75 LOC; PostForm.tsx dropped ~30 LOC; 2 new focused files (ArtefactList.tsx ~70 LOC, TagInput.tsx ~55 LOC) each score substantially higher MI. Node score 57.22 vs trunk 44.96.

**Branch**: exp/node-2-form-widgets

### 3: Mechanism: Extract ternary-heavy DB query composition from page.tsx Home() and issues/[number]/page.tsx into pure loader functions in src/lib/queries.ts; each loader encapsulates one conditional query branch.
Hypothesis: Branch count in page components drops; the async page function body shrinks in CC; detail pages rise from MI 16 toward 30+; avg MI rises by 2-3 points.
Observable: page.tsx and issues/[number]/page.tsx CC falls; their MI rises 10+ points; eval-mi score rises by 2-3 from baseline.
Conflicts: none - attacks branching CC in data-fetching pages; orthogonal to nodes 1 and 2 which target sub-component LOC. [PENDING]
