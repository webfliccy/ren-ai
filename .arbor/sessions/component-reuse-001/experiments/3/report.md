# Experiment 3

**Hypothesis**: Mechanism: Extract shared FormField compound component (src/components/FormField.tsx) wrapping label + children + optional hint slot; replace repeated div>label>input>hint JSX in PostForm, FieldNoteForm, IssueForm, ToolForm.
Hypothesis: Each form duplicates the same label→field→hint pattern across 5-8 fields; a shared component emits one React element definition instead of N near-identical inline trees, reducing JSX payload and improving reconciler efficiency.
Observable: pnpm build score at or below node-2 result; src/components/*Form.tsx files show FormField imports replacing raw div+label blocks.
Conflicts: none - attacks JSX-markup deduplication axis; orthogonal to nodes 1 and 2.

**Score**: 1368.0

**Insight**: FormField compound component eliminated 30+ repeated div>label JSX patterns across 4 forms but did not reduce bundle size further (score flat at 1368). React's compiled JSX produces equivalent createElement calls regardless of component abstraction depth. Maintainability and consistency improved substantially.

**Result**: Created src/components/FormField.tsx with optional className prop. Applied to PostForm (7 fields), FieldNoteForm (13 fields including fieldset-nested), IssueForm (3 fields), ToolForm (6 fields). Builds clean with no TypeScript errors.
