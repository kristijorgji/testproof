import type { Meta, StoryObj } from '@storybook/react-vite';
import { createProject, createRepo } from '@test/factories/project';
import { fn } from 'storybook/test';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { SettingsPageContent } from './SettingsPageContent';

const project = createProject();

const meta: Meta<typeof SettingsPageContent> = {
    title: 'Pages/SettingsPage',
    component: SettingsPageContent,
    decorators: [withPageProviders],
    args: {
        projectId: project.id,
        name: project.name,
        ledgerPath: 'docs/testing/flows.yaml',
        ledgerFilePath: null,
        repo: createRepo(),
        tokens: [],
        saveRepoAction: fn(),
        deleteTokenAction: fn(),
    },
    parameters: { pathname: `/projects/${project.id}/settings` },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const GitMode: Story = { args: { storage: 'git' } };

export const FileMode: Story = {
    args: { storage: 'file', ledgerFilePath: '/data/flows.yaml' },
};

export const DbMode: Story = { args: { storage: 'db' } };

export const TokensLoaded: Story = {
    args: {
        storage: 'file',
        ledgerFilePath: '/data/flows.yaml',
        tokens: [
            {
                id: 'token-1',
                name: 'CI',
                createdAt: new Date('2026-01-15T10:00:00Z'),
                lastUsedAt: new Date('2026-01-20T14:30:00Z'),
            },
            {
                id: 'token-2',
                name: 'local',
                createdAt: new Date('2026-02-01T09:00:00Z'),
                lastUsedAt: null,
            },
        ],
    },
};

export const TokensEmpty: Story = {
    args: { storage: 'git', tokens: [] },
};
