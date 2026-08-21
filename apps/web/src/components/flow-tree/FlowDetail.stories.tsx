import type { Meta, StoryObj } from '@storybook/react-vite';

import { FlowDetail } from './FlowDetail';

const meta = {
    title: 'Flows/FlowDetail',
    component: FlowDetail,
    args: {
        flow: {
            id: 'FLOW-PUSH-PERMISSION-RUNTIME',
            title: 'Android 13+ runtime notification permission prompt',
            targets: [{ platform: 'mobile.android' }],
            notes: 'iOS is not a gap',
        },
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
        demanded: [{ platform: 'mobile.android', dimensions: {} }],
        covered: [],
    },
} satisfies Meta<typeof FlowDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
