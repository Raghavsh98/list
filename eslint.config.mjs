import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Layer boundary: core/ is the portable format. No framework, no platform.
  {
    files: ["core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react/*", "react-dom", "react-dom/*", "next", "next/*", "@/app/*", "@/lib/*", "@/components/*"],
              message: "core/ must stay portable: no React, Next, or platform imports." },
          ],
        },
      ],
    },
  },
  // components/list may depend on core/ and React only.
  {
    files: ["components/list/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["next", "next/*", "@/app/*", "@/lib/*"], message: "components/list must not depend on the platform." }] },
      ],
    },
  },
]);

export default eslintConfig;
