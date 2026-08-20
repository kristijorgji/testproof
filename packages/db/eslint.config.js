import { createEslintConfig } from '@testproof/eslint-config';

export default await createEslintConfig({
    importMetaUrl: import.meta.url,
    preset: 'base',
});
