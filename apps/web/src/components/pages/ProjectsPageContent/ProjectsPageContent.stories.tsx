import type { Meta, StoryObj } from '@storybook/react-vite';
import { createProject } from '@test/factories/project';
import { fn } from 'storybook/test';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { ProjectsPageContent } from './ProjectsPageContent';

const meta: Meta<typeof ProjectsPageContent> = {
    title: 'Pages/ProjectsPage',
    component: ProjectsPageContent,
    decorators: [withPageProviders],
    args: { createAction: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
    args: { projects: [createProject(), createProject({ id: 'p2', name: 'Second', slug: 'second' })] },
};

export const Empty: Story = { args: { projects: [] } };
