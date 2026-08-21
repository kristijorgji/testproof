import type { Meta, StoryObj } from '@storybook/react-vite';

import { PublishDialog } from './PublishDialog';

const meta = {
    title: 'Flows/PublishDialog',
    component: PublishDialog,
} satisfies Meta<typeof PublishDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};
export const Conflict: Story = {
    args: {
        conflict: { remote: 'title: remote\n', draft: 'title: draft\n' },
    },
};
