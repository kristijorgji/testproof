import type { Meta, StoryObj } from '@storybook/react-vite';

import { Scrollbar } from './Scrollbar';

const meta: Meta<typeof Scrollbar> = {
    title: 'Common/Scrollbar',
    component: Scrollbar,
    args: {
        className: 'h-48 w-64 border border-[var(--border)] bg-[var(--card)] p-3 text-sm',
        children: (
            <div className="grid gap-2">
                {Array.from({ length: 24 }, (_, index) => (
                    <p key={index}>{index + 1}</p>
                ))}
            </div>
        ),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};

export const Horizontal: Story = {
    args: {
        orientation: 'horizontal',
        className: 'h-24 w-64 border border-[var(--border)] bg-[var(--card)] p-3 text-sm',
        children: (
            <div className="flex w-[48rem] gap-3">
                {Array.from({ length: 12 }, (_, index) => (
                    <span key={index} className="shrink-0 rounded border border-[var(--border)] px-3 py-2">
                        {index + 1}
                    </span>
                ))}
            </div>
        ),
    },
};
