import { fileURLToPath } from 'node:url';

import { createReactConfig } from '@kristijorgji/eslint-config-react-typescript';
import { createTypescriptConfig } from '@kristijorgji/eslint-config-typescript';

import { baseConfig, ignores, importOrderOptions, nextAppRouterConfig } from './base.js';

/**
 * @param {object} options
 * @param {string} options.importMetaUrl
 * @param {'base' | 'react'} [options.preset='base']
 * @param {string[]} [options.ignores]
 * @param {import('eslint').Linter.Config[]} [options.configs]
 * @returns {Promise<import('eslint').Linter.Config[]>}
 */
export async function createEslintConfig({ importMetaUrl, preset = 'base', ignores: extraIgnores, configs = [] }) {
    const tsconfigRootDir = fileURLToPath(new URL('.', importMetaUrl));
    const ignoreBlocks = [ignores, ...(extraIgnores?.length ? [{ ignores: extraIgnores }] : [])];

    if (preset === 'react') {
        const factory = await createReactConfig({
            variant: 'next',
            tsconfigRootDir,
            prettier: 'prettierrc',
            importOrder: importOrderOptions,
            codeQuality: true,
            explicitTypes: true,
            jsxProps: { type: 'unsorted' },
        });
        return [...ignoreBlocks, ...factory, ...baseConfig, ...nextAppRouterConfig, ...configs];
    }

    if (preset !== 'base') {
        throw new Error(`Unknown ESLint preset "${preset}". Use: base, react`);
    }

    const factory = createTypescriptConfig({
        tsconfigRootDir,
        prettier: 'prettierrc',
        importOrder: importOrderOptions,
        codeQuality: true,
        explicitTypes: true,
    });
    return [...ignoreBlocks, ...factory, ...baseConfig, ...configs];
}
