import eslintPluginPrettier from "eslint-plugin-prettier";

export default [
  {
    ignores: ["node_modules", "dist", "coverage"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },

    plugins: {
      prettier: eslintPluginPrettier,
    },

    rules: {
      "no-unused-vars": "warn",
      "no-console": "off", // pode permitir console.log no backend
      eqeqeq: "error",
      "prettier/prettier": "error", // roda prettier junto
    },
  },
];
