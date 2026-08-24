import type { Meta, StoryObj } from '@storybook/react-vite';
import { createProject } from '@test/factories/project';
import { createSession } from '@test/factories/session';
import { fn } from 'storybook/test';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { SessionsPageContent } from './SessionsPageContent';

const project = createProject();

const meta: Meta<typeof SessionsPageContent> = {
    title: 'Pages/SessionsPage',
    component: SessionsPageContent,
    decorators: [withPageProviders],
    args: { projectId: project.id, name: project.name, createAction: fn(), deleteAction: fn() },
    parameters: { pathname: `/projects/${project.id}/sessions` },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
    args: {
        sessions: [createSession(), createSession({ id: 'sess-2', title: 'Retest coverage gaps', notes: 'Follow-up' })],
    },
};

export const Empty: Story = { args: { sessions: [] } };
