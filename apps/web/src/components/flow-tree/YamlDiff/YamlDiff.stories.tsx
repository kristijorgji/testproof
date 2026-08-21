import type { Meta, StoryObj } from '@storybook/react-vite';

import { YamlDiff } from './YamlDiff';

const meta = {
    title: 'Flows/YamlDiff',
    component: YamlDiff,
    args: {
        before: 'title: Invalid credentials → clear error message\n',
        after: 'title: X\n',
    },
} satisfies Meta<typeof YamlDiff>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
