#!/usr/bin/env bash
# Arbor eval: build and report total JS chunk size (KB) as page-load proxy.
# Usage: cd <worktree> && bash eval.sh
# Outputs: score: <KB>
set -e
cd "${1:-$(pwd)}"
pnpm build > /dev/null 2>&1
SIZE=$(du -sk .next/static/chunks/*.js 2>/dev/null | awk '{sum+=$1} END {print sum}')
echo "score: ${SIZE}"
