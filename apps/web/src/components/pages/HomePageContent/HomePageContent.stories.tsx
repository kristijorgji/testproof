import type { Meta, StoryObj } from '@storybook/react-vite';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { HomePageContent } from './HomePageContent';

const meta: Meta<typeof HomePageContent> = {
    title: 'Pages/HomePage',
    component: HomePageContent,
    decorators: [withPageProviders],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
