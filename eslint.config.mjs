import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const noApiInUi = {
  group: ['@/lib/api/api.service', '@/lib/api/client', '@/providers/*'],
  message: 'UI components use hooks; only hooks and providers talk to the API.',
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    '.open-next/**',
    '.wrangler/**',
    'out/**',
    'coverage/**',
    'next-env.d.ts',
    'cloudflare-env.d.ts',
    'node_modules/**',
  ]),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='fetch']",
          message:
            'Call the API through lib/api/api.service.ts, never fetch() directly.',
        },
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: 'Read environment variables only in src/config/env.ts.',
        },
      ],
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}', 'src/components/common/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [noApiInUi] }] },
  },
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    ignores: [
      'src/components/auth/guards.tsx',
      'src/components/layout/**',
      'src/components/dashboard/**',
      'src/components/auth/login-form.tsx',
      'src/app/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/api/api.service', '@/lib/api/client'],
              message: 'Use a hook instead of calling the API here.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/components/layout/**/*.{ts,tsx}',
      'src/components/dashboard/**/*.{ts,tsx}',
      'src/components/auth/**/*.{ts,tsx}',
      'src/app/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/api/api.service', '@/lib/api/client'],
              message: 'Use a hook instead of calling the API here.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/api/client.ts', '**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['src/config/env.ts', 'scripts/**/*.ts', '*.config.{ts,mjs,mts}'],
    rules: { 'no-restricted-syntax': 'off' },
  },
]);
