import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // General
      "no-unused-vars": ["warn"],
      "no-console": "off",

      // Best practices
      "eqeqeq": ["error", "always"],
      "curly": "error",

      // Style (optional)
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "indent": ["error", 2],

      // Node-specific
      "no-process-exit": "warn",
    },
  },
];