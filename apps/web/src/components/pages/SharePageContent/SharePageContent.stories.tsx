import type { Meta, StoryObj } from '@storybook/react-vite';
import { createCoverageRow } from '@test/factories/coverage';
import { createFlow } from '@test/factories/ledger';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { SharePageContent } from './SharePageContent';

const meta: Meta<typeof SharePageContent> = {
    title: 'Pages/SharePage',
    component: SharePageContent,
    decorators: [withPageProviders],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
    args: {
        rows: [{ flowId: createFlow().id, status: createCoverageRow().status }],
    },
};

export const Empty: Story = { args: { rows: [] } };
