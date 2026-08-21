import { createEslintConfig } from '@testproof/eslint-config';
import { translationsConfig } from '@testproof/eslint-config/translations';

export default await createEslintConfig({
    importMetaUrl: import.meta.url,
    preset: 'react',
    configs: [
        translationsConfig,
        {
            // createReactConfig already drops explicit-function-return-type for TSX.
            files: ['**/*.tsx'],
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': 'off',
            },
        },
        {
            files: [
                'src/**/*.stories.{ts,tsx}',
                '.storybook/**/*.{ts,tsx}',
                'test/**/*.{ts,tsx}',
                '**/*.test.{ts,tsx}',
            ],
            rules: {
                'i18next/no-literal-string': 'off',
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@next/next/no-img-element': 'off',
            },
        },
    ],
});
