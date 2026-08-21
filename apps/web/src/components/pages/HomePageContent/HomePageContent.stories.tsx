import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { HomePageContent } from './HomePageContent';

const meta: Meta<typeof HomePageContent> = {
    title: 'Pages/HomePage',
    component: HomePageContent,
    decorators: [withPageProviders],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'Open projects' })).toBeInTheDocument();
    },
};
