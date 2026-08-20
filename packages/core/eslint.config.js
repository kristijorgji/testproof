import { createEslintConfig } from '@testproof/eslint-config';

export default await createEslintConfig({
    importMetaUrl: import.meta.url,
    preset: 'base',
    configs: [
        {
            files: ['**/*.ts'],
            rules: {
                'no-restricted-imports': [
                    'error',
                    {
                        patterns: [
                            {
                                group: ['@testproof/db', '@testproof/db/*'],
                                message: 'core must not depend on the database.',
                            },
                            { group: ['next', 'next/*'], message: 'core must not depend on Next.js.' },
                            { group: ['react', 'react-dom'], message: 'core must stay framework-free.' },
                        ],
                    },
                ],
            },
        },
    ],
});
