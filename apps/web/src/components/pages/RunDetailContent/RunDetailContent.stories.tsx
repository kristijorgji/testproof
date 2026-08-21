import type { Meta, StoryObj } from '@storybook/react-vite';
import { createRunResult } from '@test/factories/run';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { RunDetailContent } from './RunDetailContent';

const meta: Meta<typeof RunDetailContent> = {
    title: 'Pages/RunDetail',
    component: RunDetailContent,
    decorators: [withPageProviders],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
    args: { results: [createRunResult(), createRunResult({ id: 'rr-2', platform: 'mobile', status: 'fail' })] },
};

export const WithUntagged: Story = {
    args: {
        results: [createRunResult(), createRunResult({ id: 'rr-2', flowId: null, platform: null, status: 'fail' })],
    },
};
