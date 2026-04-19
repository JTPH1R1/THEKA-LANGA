import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'src/types/database.types.ts', 'src/components/ui/**'] },

  // Base rules for all TS/TSX files
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // API layer: no React, no hooks, no components, no stores
  {
    files: ['src/lib/api/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['react', 'react-dom'],            message: 'API layer must not import React.' },
          { group: ['@/hooks/*', '../hooks/*'],        message: 'API layer must not import hooks.' },
          { group: ['@/components/*'],                 message: 'API layer must not import components.' },
          { group: ['@/stores/*'],                     message: 'API layer must not import stores.' },
        ],
      }],
    },
  },

  // Calculation library: pure functions — no side effects, no external dependencies
  {
    files: ['src/lib/calculations/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['react', 'react-dom'],    message: 'Calculations must be pure — no React.' },
          { group: ['@supabase/*'],            message: 'Calculations must be pure — no Supabase.' },
          { group: ['@/lib/api/*'],            message: 'Calculations must be pure — no API calls.' },
          { group: ['@/hooks/*'],              message: 'Calculations must be pure — no hooks.' },
          { group: ['@/components/*'],         message: 'Calculations must be pure — no components.' },
          { group: ['@/stores/*'],             message: 'Calculations must be pure — no stores.' },
        ],
      }],
    },
  },

  // Components and pages: no direct Supabase access, no direct API calls — use hooks
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@supabase/supabase-js'],         message: 'Components must not import Supabase directly — use hooks.' },
          { group: ['@/lib/supabase'],                message: 'Components must not import Supabase directly — use hooks.' },
          { group: ['@/lib/api/*'],                   message: 'Components must not call API functions directly — use hooks.' },
        ],
      }],
    },
  },
)
