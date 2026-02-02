import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Allow empty catch blocks with comments
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Data-fetching effects legitimately call setState; warn rather than error
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  // DOM interop files use `any` for cross-platform DOM (browser DOMParser vs xmldom)
  {
    files: ['**/itemParser.ts', '**/domUtils.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
