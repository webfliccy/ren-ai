#!/usr/bin/env node
// Maintainability Index evaluator for Arbor node-1
// MI = 171 - 5.2*ln(HV) - 0.23*CC - 16.2*ln(LOC), clamped to [0,100]
// Approximations: HV ~ LOC * 10 (Halstead volume proxy), CC via counting branches

const fs = require("fs");
const path = require("path");

const root = process.argv[2] || process.cwd();
const srcDir = path.join(root, "src");

const EXTENSIONS = [".ts", ".tsx"];
const SKIP_DIRS = ["node_modules", ".next", "dist", "out"];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(entry.name)) walk(path.join(dir, entry.name), files);
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function countCC(src) {
  // Count decision points: if/else/for/while/case/&&/||/ternary/??
  const patterns = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bfor\s*\(/g,
    /\bwhile\s*\(/g,
    /\bcase\s+/g,
    /\?\?/g,
    /\?\s/g,
    /&&/g,
    /\|\|/g,
  ];
  let count = 1;
  for (const p of patterns) {
    const m = src.match(p);
    if (m) count += m.length;
  }
  return count;
}

function calcMI(loc, cc, hv) {
  if (loc === 0) return 100;
  const mi = 171 - 5.2 * Math.log(hv) - 0.23 * cc - 16.2 * Math.log(loc);
  return Math.max(0, Math.min(100, mi));
}

const files = walk(srcDir);
const scores = [];

for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const lines = src.split("\n");
  const loc = lines.filter(l => l.trim().length > 0).length;
  const cc = countCC(src);
  const hv = loc * 10; // Halstead volume proxy
  const mi = calcMI(loc, cc, hv);
  scores.push({ file: path.relative(root, f), loc, cc, mi });
}

if (scores.length === 0) {
  console.log("score: 0");
  process.exit(0);
}

const avg = scores.reduce((s, x) => s + x.mi, 0) / scores.length;

// Print per-file breakdown to stderr
for (const s of scores.sort((a, b) => a.mi - b.mi)) {
  process.stderr.write(`  MI=${s.mi.toFixed(1).padStart(5)} LOC=${String(s.loc).padStart(4)} CC=${String(s.cc).padStart(4)}  ${s.file}\n`);
}
process.stderr.write(`\nFiles: ${scores.length}  Avg MI: ${avg.toFixed(2)}\n`);

console.log(`score: ${avg.toFixed(2)}`);
