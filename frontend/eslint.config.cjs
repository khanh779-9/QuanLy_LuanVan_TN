// ESLint config for React + JS (CommonJS)
module.exports = [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    plugins: {
      react: require("eslint-plugin-react"),
      import: require("eslint-plugin-import"),
    },
    rules: {
      "no-unused-vars": "warn",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "import/order": ["warn", { "groups": ["builtin", "external", "internal"], "newlines-between": "always" }],
      "import/no-unused-modules": ["warn", { "unusedExports": true }],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
