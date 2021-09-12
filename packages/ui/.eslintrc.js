module.exports = {
  env: {
    es2020: true,
    browser: true,
  },
  extends: ["plugin:react/recommended", "plugin:react-hooks/recommended"],
  rules: {
    "react/display-name": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
