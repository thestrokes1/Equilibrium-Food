import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import tsParser from '@typescript-eslint/parser';

const sharedRules = {
  ...reactPlugin.configs.flat.recommended.rules,
  ...reactHooks.configs.recommended.rules,
  'react/react-in-jsx-scope': 'off',
  'react/prop-types': 'off',
  'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  'no-console': 'warn',
  ...prettier.rules,
};

const sharedPlugins = {
  react: reactPlugin,
  'react-hooks': reactHooks,
  'react-refresh': reactRefresh,
};

export default [
  { ignores: ['dist', 'node_modules', 'src/context/**'] },
  js.configs.recommended,

  // JS / JSX files — standard parser
  {
    files: ['**/*.{js,jsx}'],
    ...reactPlugin.configs.flat.recommended,
    plugins: sharedPlugins,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: sharedRules,
  },

  // Test/setup files — need Node globals (global, process) for vitest
  {
    files: ['src/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // TSX files — TypeScript parser
  {
    files: ['**/*.tsx'],
    ...reactPlugin.configs.flat.recommended,
    plugins: sharedPlugins,
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: sharedRules,
  },
];
