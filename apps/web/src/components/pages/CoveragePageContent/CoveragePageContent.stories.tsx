import type { Meta, StoryObj } from '@storybook/react-vite';
import { createCoverageMap, createCoverageRow } from '@test/factories/coverage';
import { createFlow, createLedger } from '@test/factories/ledger';
import { createProject } from '@test/factories/project';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { CoveragePageContent } from './CoveragePageContent';

const project = createProject();
const login = createFlow();
const extra = createFlow({ id: 'FLOW-AUTH-LOGIN-FAILURE', title: 'Wrong password stays on sign-in' });
const ledger = createLedger({
    areas: [
        {
            id: 'AUTH',
            title: 'AUTH',
            groups: [{ title: 'Login', flows: [login, extra] }],
        },
    ],
});

const snapshot = {
    commitSha: 'abc123def456',
    branch: 'main',
    summary: { automated: 1, partial: 0, todo: 1, manual: 0 },
    createdAt: new Date('2026-01-15T12:00:00Z'),
};

const coverage = createCoverageMap({
    [extra.id]: createCoverageRow({
        status: 'todo',
        covered: [],
        files: {},
    }),
});

const meta: Meta<typeof CoveragePageContent> = {
    title: 'Pages/CoveragePage',
    component: CoveragePageContent,
    decorators: [withPageProviders],
    args: {
        name: project.name,
        projectId: project.id,
        ledger,
        coverage,
        snapshot,
    },
    parameters: { pathname: `/projects/${project.id}/coverage` },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {};

export const Empty: Story = {
    args: {
        ledger: createLedger({ areas: [] }),
        coverage: {},
        snapshot: null,
    },
};

export const NoSnapshot: Story = {
    args: { coverage: {}, snapshot: null },
};

export const WithFiles: Story = {
    args: {
        coverage: createCoverageMap({
            [login.id]: createCoverageRow({
                files: { web: ['auth-login.spec.ts'], mobile: ['auth-login.yaml'] },
            }),
        }),
    },
};
