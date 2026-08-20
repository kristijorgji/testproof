import i18next from 'eslint-plugin-i18next';

export const translationsConfig = {
    plugins: {
        i18next,
    },
    rules: {
        'i18next/no-literal-string': [
            'error',
            {
                mode: 'jsx-text-only',
                'jsx-attributes': {
                    include: ['label', 'placeholder', 'alt', 'title', 'aria-label'],
                },
                words: {
                    exclude: ['\\+', '-', '/', ':', '·', '\\*'],
                },
            },
        ],
    },
};
