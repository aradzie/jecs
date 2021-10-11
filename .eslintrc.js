module.exports = {
  root: true,
  env: {
    es2020: true,
  },
  plugins: [],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    // configure eslint
    "curly": "error",
    "eqeqeq": ["error", "always", { null: "never" }],
    "no-constant-condition": ["error", { checkLoops: false }],
    "no-floating-decimal": "error",
    "no-implicit-coercion": "error",
    "no-restricted-globals": ["error", ...require("eslint-restricted-globals")],
    "no-sequences": "error",
    "no-throw-literal": "error",
    // configure @typescript-eslint
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
  },
  overrides: [],
  settings: {},
};
