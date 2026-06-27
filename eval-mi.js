#!/usr/bin/env node
// Maintainability Index eval for ren-ai src/**/*.{ts,tsx}
// MI = MAX(0, (171 - 5.2*ln(HV) - 0.23*CC - 16.2*ln(LOC)) * 100/171)
// Outputs: score: <average MI across all source files>

const ts = require("typescript");
const fs = require("fs");
const path = require("path");

const CWD = process.argv[2] || process.cwd();
const SRC = path.join(CWD, "src");

function collectFiles(dir, exts = [".ts", ".tsx"]) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectFiles(full, exts));
    else if (exts.includes(path.extname(entry.name))) results.push(full);
  }
  return results;
}

function computeCC(sourceFile) {
  // Count decision points: if, else if, for, while, do, case, catch, ternary, &&, ||, ??
  let cc = 1;
  function walk(node) {
    const k = node.kind;
    if (
      k === ts.SyntaxKind.IfStatement ||
      k === ts.SyntaxKind.ForStatement ||
      k === ts.SyntaxKind.ForInStatement ||
      k === ts.SyntaxKind.ForOfStatement ||
      k === ts.SyntaxKind.WhileStatement ||
      k === ts.SyntaxKind.DoStatement ||
      k === ts.SyntaxKind.CaseClause ||
      k === ts.SyntaxKind.CatchClause ||
      k === ts.SyntaxKind.ConditionalExpression
    ) cc++;
    if (
      k === ts.SyntaxKind.BinaryExpression &&
      (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
       node.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
       node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
    ) cc++;
    ts.forEachChild(node, walk);
  }
  walk(sourceFile);
  return cc;
}

function computeHalstead(sourceFile) {
  // Approximate Halstead Volume via unique operators + operands
  const operators = new Set();
  const operands = new Set();
  let totalOps = 0, totalOperands = 0;

  function walk(node) {
    if (ts.isBinaryExpression(node) || ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
      const opKey = node.operatorToken ? node.operatorToken.kind : node.operator;
      operators.add(opKey);
      totalOps++;
    }
    if (ts.isIdentifier(node)) { operands.add(node.text); totalOperands++; }
    if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) { operands.add(node.text); totalOperands++; }
    ts.forEachChild(node, walk);
  }
  walk(sourceFile);

  const n1 = operators.size || 1, n2 = operands.size || 1;
  const N = totalOps + totalOperands;
  const vocab = n1 + n2;
  const volume = N * Math.log2(vocab || 1);
  return Math.max(volume, 1);
}

function miForFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const lines = src.split("\n").filter(l => l.trim().length > 0).length;
  if (lines === 0) return null;

  const sourceFile = ts.createSourceFile(
    filePath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX
  );

  const cc = computeCC(sourceFile);
  const hv = computeHalstead(sourceFile);
  const loc = lines;

  const raw = 171 - 5.2 * Math.log(hv) - 0.23 * cc - 16.2 * Math.log(loc);
  return Math.max(0, (raw * 100) / 171);
}

const files = collectFiles(SRC);
const scores = [];
for (const f of files) {
  try {
    const mi = miForFile(f);
    if (mi !== null) scores.push({ file: path.relative(CWD, f), mi });
  } catch { /* skip unparseable files */ }
}

if (scores.length === 0) { console.log("score: 0"); process.exit(1); }

const avg = scores.reduce((s, x) => s + x.mi, 0) / scores.length;

// Print per-file breakdown to stderr, avg to stdout
scores.sort((a, b) => a.mi - b.mi).forEach(({ file, mi }) =>
  process.stderr.write(`  ${mi.toFixed(1).padStart(5)}  ${file}\n`)
);
process.stderr.write(`\nfiles: ${scores.length}  avg MI: ${avg.toFixed(2)}\n`);
console.log(`score: ${avg.toFixed(2)}`);
