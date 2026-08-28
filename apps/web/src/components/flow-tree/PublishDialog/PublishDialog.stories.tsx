import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { PublishDialog } from './PublishDialog';

const meta = {
    title: 'Flows/PublishDialog',
    component: PublishDialog,
    args: {
        storage: 'file',
        pending: false,
        formError: null,
        dirty: false,
        onPublish: fn(),
        onReplay: fn(),
        onDiscard: fn(),
    },
} satisfies Meta<typeof PublishDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const DirtyFileMode: Story = {
    args: { storage: 'file', dirty: true },
};

export const GitMode: Story = {
    args: { storage: 'git' },
};

export const Error: Story = {
    args: { formError: 'Ledger file is not writable' },
};

export const Conflict: Story = {
    args: {
        conflict: { remote: 'title: remote\n', draft: 'title: draft\n' },
    },
};
