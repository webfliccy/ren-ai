# Experiment 2

**Hypothesis**: Mechanism: Extract ArtefactList (artefact display/edit block, ~60 LOC) and TagInput (tag chip input, ~25 LOC) from FieldNoteForm.tsx into src/components/ArtefactList.tsx and src/components/TagInput.tsx; wire back via props; reuse TagInput in PostForm.tsx.
Hypothesis: FieldNoteForm LOC drops from 510 to ~350; CC penalty is distributed across 3 files each scoring independently; PostForm also benefits from widget reuse; avg MI rises by 2-3 points.
Observable: FieldNoteForm MI rises from 7.1 toward 20+; 2 new widget files score 40-60; eval-mi score rises by 2-3 from baseline.
Conflicts: none - attacks per-form CC accumulation via widget extraction; orthogonal to node 1 which targets page.tsx.

**Score**: 57.22

**Insight**: Distributing ~105 LOC of dense interactive UI logic (artefact list with upload, tag chip input with keyboard handling) across two focused single-responsibility components raised avg MI by ~27%. Shared TagInput reuse across FieldNoteForm and PostForm eliminates the sole duplicated logic block in the tree.

**Result**: FieldNoteForm.tsx dropped ~75 LOC; PostForm.tsx dropped ~30 LOC; 2 new focused files (ArtefactList.tsx ~70 LOC, TagInput.tsx ~55 LOC) each score substantially higher MI. Node score 57.22 vs trunk 44.96.
