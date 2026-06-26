# Experiment 1

**Hypothesis**: Mechanism: Extract slugify and parseTags function bodies from component files into src/lib/slug.ts and src/lib/tags.ts; import in all consumers.
Hypothesis: Identical function bodies compiled as separate closures inflate JS chunks; deduplicated module imports let the bundler emit one copy, shrinking the largest shared chunk.
Observable: pnpm build score drops from 1372 KB; zero grep hits for 'function slugify' / 'function parseTags' inside src/components/.
Conflicts: none - attacks an unexplored utility-deduplication axis.

**Score**: 1372.0

**Insight**: Utility deduplication (slugify x2, parseTags x3) eliminates duplicate function bodies in source, but the ~500 bytes saved are negligible against 1372 KB of vendor+framework chunks. Bundle metric unmoved; correctness and maintainability improved.

**Result**: Extracted slugify (via generateSlug alias) to src/lib/slug.ts and parseTags to src/lib/tags.ts. All 3 consumer components updated to import from lib. No local duplicates remain.
