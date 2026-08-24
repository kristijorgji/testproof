import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { LedgerConfigGateContent } from './LedgerConfigGateContent';

const meta: Meta<typeof LedgerConfigGateContent> = {
    title: 'Pages/LedgerConfigGate',
    component: LedgerConfigGateContent,
    decorators: [withPageProviders],
    args: {
        projectId: 'project-1',
        name: 'Demo',
        message: 'Connect a GitHub repository in Settings',
    },
    parameters: {
        pathname: '/projects/project-1/flows',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'Open settings' })).toBeInTheDocument();
        await expect(canvas.getByText('Connect a GitHub repository in Settings')).toBeInTheDocument();
    },
};
