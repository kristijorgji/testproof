import type { Meta, StoryObj } from '@storybook/react-vite';

import { FlowTreeRow } from './FlowTreeRow';

const flow = { id: 'FLOW-AUTH-LOGIN-SUCCESS', title: 'Correct credentials → dashboard' };

const meta = {
    title: 'Flows/FlowTreeRow',
    component: FlowTreeRow,
    args: { flow, status: 'automated' },
} satisfies Meta<typeof FlowTreeRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Automated: Story = { args: { status: 'automated' } };
export const Partial: Story = { args: { status: 'partial' } };
export const Todo: Story = { args: { status: 'todo' } };
export const Manual: Story = { args: { status: 'manual' } };
