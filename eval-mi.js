#!/usr/bin/env node
// Simplified Maintainability Index evaluator for .tsx/.ts files in src/components/
// MI formula (Visual Studio variant): MAX(0, (171 - 16.2*ln(LOC) - 0.23*CC) * 100/171)
// We approximate CC from branch-keyword count (if/else/for/while/switch/case/&&/||/ternary).
// Outputs: score: <avg-MI>

const fs = require("fs");
const path = require("path");

const root = process.argv[2] || process.cwd();
const dir = path.join(root, "src", "components");

function countCC(source) {
  // Cyclomatic complexity: base 1 + count of branching keywords
  const patterns = [
    /\bif\b/g,
    /\belse\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bswitch\b/g,
    /\bcase\b/g,
    /&&/g,
    /\|\|/g,
    /\?\s*[^:]/g, // ternary (rough)
  ];
  let cc = 1;
  for (const p of patterns) {
    const m = source.match(p);
    if (m) cc += m.length;
  }
  return cc;
}

function computeMI(loc, cc) {
  if (loc <= 0) return 100;
  const mi = (171 - 16.2 * Math.log(loc) - 0.23 * cc) * 100 / 171;
  return Math.max(0, mi);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));

let totalMI = 0;
let count = 0;

for (const file of files) {
  const src = fs.readFileSync(path.join(dir, file), "utf8");
  const lines = src.split("\n").filter(l => l.trim().length > 0);
  const loc = lines.length;
  const cc = countCC(src);
  const mi = computeMI(loc, cc);
  totalMI += mi;
  count++;
}

const avg = count > 0 ? totalMI / count : 0;
console.log(`score: ${avg.toFixed(2)}`);
