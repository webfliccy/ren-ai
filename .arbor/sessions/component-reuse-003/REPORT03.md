# Arbor Session Report — component-reuse-003

**Date**: 2026-06-27  
**Objective**: Maximize Maintainability Index (MI) via component reuse, shared styles, shared modules  
**Metric**: avg MI across src/**/*.{ts,tsx} — `node eval-mi.js <cwd>`

## Score Summary

| Checkpoint | MI | Files |
|---|---|---|
| Original baseline (pre-002) | 44.96 | 75 |
| Trunk at session start (post-002) | 45.63 | 75 |
| After node 3 (outcome-status, experiment, formatters) | 45.97 | 77 |
| After node 4 (parse, file-utils, field-notes dedup) | **46.60** | 79 |

**Session gain: +0.97** over trunk at session start.  
**Cumulative gain (all sessions): +1.64** over original baseline (44.96 → 46.60).

## Nodes

### Node 1 — ExperimentSection + OutcomeSection from FieldNoteForm [NOT MERGED, score 45.46]
Extracted ExperimentRecord fieldset (76 LOC) and OutcomeSection (42 LOC) from FieldNoteForm.tsx.  
**Why it didn't merge**: Medium-size components (80–130 LOC) score 34–38 MI — below trunk average (45.63) at time of evaluation. Adding them to the file pool pulled the average down. Math threshold: A+B+C > old_file_MI + 2×trunk_avg requires combined avg of 35+; extraction produced 30.2.

### Node 2 — ReferencesManager from PostForm [NOT MERGED, score 45.47]
Extracted inline references section (~80 LOC) from PostForm.tsx. ReferencesManager scored 29.1 MI.  
**Why it didn't merge**: Same dilution problem. New file scored well below trunk average.

### Node 3 — Tiny lib constants from FieldNoteForm [MERGED, score 45.97, +0.34]
Created `src/lib/outcome-status.ts` (17 LOC, MI 59.2) and `src/lib/experiment.ts` (15 LOC, MI 61.4); extended `formatters.ts` with `toDateInputValue`. FieldNoteForm dropped 38 LOC.  
**Key insight**: Files <20 LOC with CC=1 score 59–80+ MI, easily clearing the math threshold.

### Node 4 — parse/file-utils + field-notes dedup [MERGED, score 46.60, +0.63]
Created `src/lib/parse.ts` (3 LOC, MI 79.2) and `src/lib/file-utils.ts` (10 LOC, MI 60.2). Fixed DRY violations in `field-notes/[slug]/page.tsx`: removed 5 local redefinitions (formatDate, formatSize, fileExt, parseJson, OUTCOME_LABELS) and imported from lib. FieldNoteForm.tsx replaced `parseArtefacts` with generic `parseJson`.

## New Shared Modules Added (this session)

| File | LOC | MI | Purpose |
|---|---|---|---|
| src/lib/outcome-status.ts | 17 | 59.2 | OutcomeStatus type, labels, colours |
| src/lib/experiment.ts | 15 | 61.4 | EMPTY_EXPERIMENT, parseExperiment |
| src/lib/parse.ts | 3 | 79.2 | Generic parseJson<T> |
| src/lib/file-utils.ts | 10 | 60.2 | formatSize, fileExt |

## Key Learning

**Extraction strategy has a ceiling at current trunk levels.** At trunk ≥ 45.6, adding a new file raises the average only if that file scores above the current average. Medium-sized UI sub-components (80–130 LOC) cap out at 29–38 MI regardless of how well-structured they are. Only files <20–25 LOC consistently score above the threshold.

**Effective strategies beyond this point**:
1. Continue extracting tiny constant/type/utility files from low-scoring components
2. Reduce HV within existing large files by replacing inline Tailwind strings with named constants
3. Reduce CC within PostForm/FieldNoteForm via custom hook extraction (usePostForm, useFieldNoteForm) — a 2-file split that needs careful LOC sizing to clear the threshold

## Remaining Low-Score Files (next session targets)

| File | MI | LOC | Opportunity |
|---|---|---|---|
| PostForm.tsx | 10.8 | 395 | Custom hook extraction; no tiny constants remain |
| FieldNoteForm.tsx | 13.4 | 380 | sectionClass token; possible hook extraction |
| page.tsx | 17.1 | 298 | Local constants/types to check |
| admin/page.tsx | 17.9 | 305 | Local constants/types to check |
