import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            '**/dist/**',
            '**/.next/**',
            '**/node_modules/**',
            '**/storybook-static/**',
            '**/migrations/**',
            '**/*.d.ts',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
    },
    {
        // @testproof/core must stay portable: no DB, no web app, no Next.
        files: ['packages/core/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        { group: ['@testproof/db', '@testproof/db/*'], message: 'core must not depend on the database.' },
                        { group: ['next', 'next/*'], message: 'core must not depend on Next.js.' },
                        { group: ['react', 'react-dom'], message: 'core must stay framework-free.' },
                    ],
                },
            ],
        },
    },
);
