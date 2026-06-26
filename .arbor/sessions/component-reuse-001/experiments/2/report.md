# Experiment 2

**Hypothesis**: Mechanism: Create src/lib/styles.ts with named constants for the five most-repeated Tailwind className strings (labelClass, inputClass, buttonPrimary, buttonSecondary, errorBanner); replace all inline literals in form components.
Hypothesis: Repeated identical string literals each occupy bytes in the emitted JS; a shared constant module lets the bundler reference one string object. Tailwind v4 scans literal strings at build time, so extraction is safe.
Observable: pnpm build score at or below node-1 result; grep for the five raw className strings shows zero hits in src/components/.
Conflicts: none - attacks style-constant axis orthogonal to utility-function axis.

**Score**: 1368.0

**Insight**: Extracting 7 repeated Tailwind className strings to a shared constants module (src/lib/styles.ts) and replacing 50+ inline literals across 5 form components produced a 4 KB bundle reduction (1372→1368). The bundler deduplicates module-level string constants. Gains from string extraction are modest but measurable.

**Result**: Created src/lib/styles.ts with labelClass, inputClass, selectClass, btnPrimary, btnSecondary, errorBanner, hintText, labelBlockClass. All 5 form components updated to import and use shared constants. FieldNoteForm's local duplicate variables removed.
