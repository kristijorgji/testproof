import type { Meta, StoryObj } from '@storybook/react-vite';
import { createProject } from '@test/factories/project';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { ProjectOverviewContent } from './ProjectOverviewContent';

const project = createProject();

const meta: Meta<typeof ProjectOverviewContent> = {
    title: 'Pages/ProjectOverview',
    component: ProjectOverviewContent,
    decorators: [withPageProviders],
    args: { projectId: project.id, name: project.name },
    parameters: { pathname: `/projects/${project.id}` },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
