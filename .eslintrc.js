module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  plugins: [],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    // configure eslint
    "eqeqeq": ["error", "always", { null: "never" }],
    "no-constant-condition": ["error", { checkLoops: false }],
    "no-implicit-coercion": "error",
    "no-restricted-globals": ["error", ...require("eslint-restricted-globals")],
    // configure @typescript-eslint
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-use-before-define": "off",
    // configure react
    "react/display-name": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
  },
  overrides: [],
  settings: {
    react: {
      version: "detect",
    },
  },
};
