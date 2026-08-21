import type { Meta, StoryObj } from '@storybook/react-vite';
import { createCoverageMap, createCoverageRow } from '@test/factories/coverage';
import { createFlow } from '@test/factories/ledger';
import { createProject } from '@test/factories/project';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { CoveragePageContent } from './CoveragePageContent';

const project = createProject();
const login = createFlow();
const extra = createFlow({ id: 'FLOW-AUTH-LOGIN-FAILURE', title: 'Wrong password stays on sign-in' });

const meta: Meta<typeof CoveragePageContent> = {
    title: 'Pages/CoveragePage',
    component: CoveragePageContent,
    decorators: [withPageProviders],
    args: { name: project.name, projectId: project.id },
    parameters: { pathname: `/projects/${project.id}/coverage` },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
    args: {
        coverage: createCoverageMap({
            [extra.id]: createCoverageRow({ status: 'todo', covered: [] }),
        }),
        flows: [
            { id: login.id, title: login.title },
            { id: extra.id, title: extra.title },
        ],
    },
};

export const Empty: Story = { args: { coverage: {}, flows: [] } };
