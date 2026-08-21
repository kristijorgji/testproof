import type { Meta, StoryObj } from '@storybook/react-vite';
import { createProject } from '@test/factories/project';
import { createRun } from '@test/factories/run';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { RunsPageContent } from './RunsPageContent';

const project = createProject();

const meta: Meta<typeof RunsPageContent> = {
    title: 'Pages/RunsPage',
    component: RunsPageContent,
    decorators: [withPageProviders],
    args: { projectId: project.id, name: project.name },
    parameters: { pathname: `/projects/${project.id}/runs` },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
    args: { runs: [createRun(), createRun({ id: 'run-2', source: 'local', status: 'running' })] },
};

export const Empty: Story = { args: { runs: [] } };
