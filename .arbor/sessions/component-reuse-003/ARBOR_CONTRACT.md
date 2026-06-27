# Arbor Contract — component-reuse-003

**Target**: /Users/felicityevans/Code/ren-ai (branch: arbor)

**Metric**: Maintainability Index (MI) — maximize
- Formula: MAX(0, (171 - 5.2·ln(HV) - 0.23·CC - 16.2·ln(LOC)) · 100/171) averaged across src/
- Eval: `node {cwd}/eval-mi.js {cwd}`
- Scope: src/components/, src/lib/, src/app/**/*.tsx

**Baseline anchor**: 45.63 (trunk after component-reuse-002)
- Original baseline: 44.96 (before component-reuse-001/002)

**Ambition**: Push MI above 45.63; prior session noted PostForm/FieldNoteForm splitting as highest-leverage remaining target.

**Scope preference**: Effect-leaning — shared modules, component reuse, style consolidation.

**Dev/test discipline**:
- B_dev: eval-mi.js on arbor branch (fast, no training)
- B_test: ask user before using

**Edit surface**: src/components/, src/lib/, src/app/ (excluding protected paths)

**Protected paths**: src/db/, src/auth.ts, drizzle.config.ts, .env*, public/uploads/

**Hard constraints**:
- Do not modify eval harness (eval-mi.js) to game the metric
- Ask before package installs
- Ask before B_test
- Merge only into trunk branch (arbor), never main/master
- B_test not for routine iteration

**Budget**: ~4 cycles, stop on plateau or idea exhaustion
