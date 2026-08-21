export const ignores = {
    ignores: [
        '**/dist/**',
        '**/.next/**',
        '**/node_modules/**',
        '**/storybook-static/**',
        '**/migrations/**',
        '**/*.d.ts',
    ],
};

export const importOrderOptions = {
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
};

export const baseConfig = [
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
    },
];

/** Next App Router files must export `metadata`, `generateMetadata`, `revalidate`, etc. */
export const nextAppRouterConfig = [
    {
        files: ['**/src/app/**/*.{ts,tsx}'],
        rules: {
            'react-refresh/only-export-components': 'off',
        },
    },
];
