# Idea Tree

**Baseline**: 1372 | **Trunk**: 1372

## ROOT: Optimize ren-ai Next.js blog for component reuse with shared styles and modules. Metric: First Load JS (KB) from pnpm build output, minimize. 3 cycles. Edit source on arbor branch. Ask before package installs or B_test. [DONE]

**Insight**: Children findings: [1, done, score=1372] Utility deduplication (slugify x2, parseTags x3) eliminates duplicate function bodies in source, but the ~500 bytes saved are negligible against 1372 KB of vendor+framework chunks. Bundle metric unmoved; correctness and maintainability improved. | [2, done, score=1368] Extracting 7 repeated Tailwind className strings to a shared constants module (src/lib/styles.ts) and replacing 50+ inline literals across 5 form components produced a 4 KB bundle reduction (1372→1368). The bundler deduplicates module-level string constants. Gains from string extraction are modest but measurable. | [3, done, score=1368] FormField compound component eliminated 30+ repeated div>label JSX patterns across 4 forms but did not reduce bundle size further (score flat at 1368). React's compiled JSX produces equivalent createElement calls regardless of component abstraction depth. Maintainability and consistency improved substantially.

### 1: Mechanism: Extract slugify and parseTags function bodies from component files into src/lib/slug.ts and src/lib/tags.ts; import in all consumers.
Hypothesis: Identical function bodies compiled as separate closures inflate JS chunks; deduplicated module imports let the bundler emit one copy, shrinking the largest shared chunk.
Observable: pnpm build score drops from 1372 KB; zero grep hits for 'function slugify' / 'function parseTags' inside src/components/.
Conflicts: none - attacks an unexplored utility-deduplication axis. [DONE] (score: 1372)

**Insight**: Utility deduplication (slugify x2, parseTags x3) eliminates duplicate function bodies in source, but the ~500 bytes saved are negligible against 1372 KB of vendor+framework chunks. Bundle metric unmoved; correctness and maintainability improved.

**Result**: Extracted slugify (via generateSlug alias) to src/lib/slug.ts and parseTags to src/lib/tags.ts. All 3 consumer components updated to import from lib. No local duplicates remain.

**Branch**: arbor

### 2: Mechanism: Create src/lib/styles.ts with named constants for the five most-repeated Tailwind className strings (labelClass, inputClass, buttonPrimary, buttonSecondary, errorBanner); replace all inline literals in form components.
Hypothesis: Repeated identical string literals each occupy bytes in the emitted JS; a shared constant module lets the bundler reference one string object. Tailwind v4 scans literal strings at build time, so extraction is safe.
Observable: pnpm build score at or below node-1 result; grep for the five raw className strings shows zero hits in src/components/.
Conflicts: none - attacks style-constant axis orthogonal to utility-function axis. [DONE] (score: 1368)

**Insight**: Extracting 7 repeated Tailwind className strings to a shared constants module (src/lib/styles.ts) and replacing 50+ inline literals across 5 form components produced a 4 KB bundle reduction (1372→1368). The bundler deduplicates module-level string constants. Gains from string extraction are modest but measurable.

**Result**: Created src/lib/styles.ts with labelClass, inputClass, selectClass, btnPrimary, btnSecondary, errorBanner, hintText, labelBlockClass. All 5 form components updated to import and use shared constants. FieldNoteForm's local duplicate variables removed.

**Branch**: arbor

### 3: Mechanism: Extract shared FormField compound component (src/components/FormField.tsx) wrapping label + children + optional hint slot; replace repeated div>label>input>hint JSX in PostForm, FieldNoteForm, IssueForm, ToolForm.
Hypothesis: Each form duplicates the same label→field→hint pattern across 5-8 fields; a shared component emits one React element definition instead of N near-identical inline trees, reducing JSX payload and improving reconciler efficiency.
Observable: pnpm build score at or below node-2 result; src/components/*Form.tsx files show FormField imports replacing raw div+label blocks.
Conflicts: none - attacks JSX-markup deduplication axis; orthogonal to nodes 1 and 2. [DONE] (score: 1368)

**Insight**: FormField compound component eliminated 30+ repeated div>label JSX patterns across 4 forms but did not reduce bundle size further (score flat at 1368). React's compiled JSX produces equivalent createElement calls regardless of component abstraction depth. Maintainability and consistency improved substantially.

**Result**: Created src/components/FormField.tsx with optional className prop. Applied to PostForm (7 fields), FieldNoteForm (13 fields including fieldset-nested), IssueForm (3 fields), ToolForm (6 fields). Builds clean with no TypeScript errors.

**Branch**: arbor
