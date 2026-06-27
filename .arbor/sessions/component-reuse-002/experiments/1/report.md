# Experiment 1

**Hypothesis**: Mechanism: Extract 5 inline sub-components (ToolCard, SidebarPost, SidebarFieldNote, DispatchCard, FieldNoteCard) from page.tsx to dedicated src/components/ files; move 4 utility fns to src/lib/formatters.ts; move placeholder constants to src/app/_placeholder.ts.
Hypothesis: page.tsx LOC drops from 545 to ~80, eliminating accumulated LOC+CC MI penalty; each new focused file of 30-80 LOC scores its own higher MI; average MI rises by 4-6 points.
Observable: page.tsx MI rises from 6.8 to 50+; 6 new files each score 45+; eval-mi score rises from 44.96 toward 50.
Conflicts: none - attacks per-file LOC accumulation axis; no prior node touched this.

**Score**: 76.49

**Insight**: Splitting a 545-line monolith across 9 focused files raised avg MI from 44.96 to 76.49 (+31.5 pts). New sub-component files score 83-97+ MI each; lib additions score 100. page.tsx itself remains at MI=28 (348 LOC remaining) due to the inline tools-placeholder SVG block — further decomposition would push it higher.

**Result**: Created: formatters.ts, _placeholder.ts, ToolCard/SidebarPost/SidebarFieldNote/DispatchCard/FieldNoteCard.tsx. Added firstTag to tags.ts, refCount to references.ts. page.tsx shrunk from 545 to 370 LOC. Score 76.49 vs trunk 44.96.
