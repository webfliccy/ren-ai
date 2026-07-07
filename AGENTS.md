<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# pnpm only — never npm or npx

This repo uses pnpm exclusively (pinned via `packageManager` in `package.json`). The Docker build, CI checks, and supply-chain policies in `pnpm-workspace.yaml` all key off `pnpm-lock.yaml`; there is no `package-lock.json`, and installing with npm desyncs the lockfile and breaks the production deploy (`ERR_PNPM_OUTDATED_LOCKFILE`). Use `pnpm install`, `pnpm run <script>`, `pnpm exec <bin>`, and `pnpm dlx <pkg>` instead of their npm/npx equivalents.
