import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default {
  languageOptions: {
    parser: tsParser,
    globals: {
      browser: false,
      node: true,
    },
  },
  plugins: {
    "@typescript-eslint": ts,
  },
  files: ["**/*.{js,ts}"],
  ignores: [".gitignore", "lib/**", "node_modules/**"],
  rules: {
    ...ts.configs["recommended"].rules,
    "no-var": ["error"],
    "prefer-const": ["error"],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
  },
};
