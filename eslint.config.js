import js from "@eslint/js";

const nodeGlobals = {
  __dirname: "readonly",
  __filename: "readonly",
  Buffer: "readonly",
  clearImmediate: "readonly",
  clearInterval: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  exports: "writable",
  global: "readonly",
  module: "writable",
  process: "readonly",
  queueMicrotask: "readonly",
  require: "readonly",
  setImmediate: "readonly",
  setInterval: "readonly",
  setTimeout: "readonly",
};

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
    rules: {
      // General
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-var": "error",
      "prefer-const": "warn",

      // Best practices
      "eqeqeq": ["error", "always"],
      "curly": "error",
      "no-else-return": "warn",
      "no-multi-spaces": "error",
      "prefer-template": "warn",

      // Style (optional)
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "indent": ["error", 2],
      "comma-dangle": ["error", "always-multiline"],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],

      // Node-specific
      "no-process-exit": "warn",
      "callback-return": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".git/**",
      "coverage/**",
      ".env",
      ".env.*",
      "keys/**",
      "public/**",
    ],
  },
];