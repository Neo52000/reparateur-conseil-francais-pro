import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Edge Functions Deno : ESLint ne peut pas les lint correctement
    // (URL imports, Deno globals). Elles sont vérifiées via supabase functions deploy.
    ignores: ["dist", "supabase/functions/**"],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Règles classiques react-hooks uniquement (v7 = React Compiler plugin, on n'utilise pas le compilateur)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Désactivé : trop de any dans le code existant, sera adressé progressivement
      "@typescript-eslint/no-explicit-any": "off",
      // Désactivé : false positives sur les catch blocks
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  }
);
