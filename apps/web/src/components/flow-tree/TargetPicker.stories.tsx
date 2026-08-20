import type { Meta, StoryObj } from '@storybook/react-vite';

import { TargetPicker } from './TargetPicker';

const meta = {
    title: 'Flows/TargetPicker',
    component: TargetPicker,
    args: {
        platforms: [
            { id: 'web', title: 'Web' },
            {
                id: 'mobile',
                title: 'Mobile',
                children: [
                    { id: 'mobile.ios', title: 'iOS' },
                    { id: 'mobile.android', title: 'Android' },
                ],
            },
        ],
        targets: [{ platform: 'mobile.android' }],
        onChange: () => undefined,
    },
} satisfies Meta<typeof TargetPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AndroidOnly: Story = {};
