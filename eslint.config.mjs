import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Formatting belongs to Prettier; silence any stylistic eslint rules.
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Runtime user uploads and vendored third-party code — not ours to lint.
    "public/uploads/**",
    "vendor/**",
  ]),
  {
    rules: {
      "react/no-danger": "error",
    },
  },
  {
    // Type-aware rules need the TS project; scope them to app code so the
    // slower typed linting doesn't run on loose scripts and config files.
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
  {
    // Standalone CommonJS eval harness; .arbor session contracts pin the
    // `node eval-mi.js` invocation, so it can't move to ESM.
    files: ["eval-mi.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // The ONLY sanctioned dangerouslySetInnerHTML sinks. Both sanitize their
    // input (DOMPurify) before injecting. Add nothing to this list without
    // a matching sanitizer — this override is the audit trail.
    files: [
      "src/components/SanitizedSvg.tsx",
      "src/components/MarkdownHtml.tsx",
    ],
    rules: {
      "react/no-danger": "off",
    },
  },
]);

export default eslintConfig;
