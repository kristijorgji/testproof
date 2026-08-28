import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { AboutPageContent } from './AboutPageContent';

import { TESTPROOF_VERSION } from '@/lib/app-version';

const meta: Meta<typeof AboutPageContent> = {
    title: 'Pages/AboutPage',
    component: AboutPageContent,
    decorators: [withPageProviders],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'About' })).toBeInTheDocument();
        await expect(canvas.getByText(TESTPROOF_VERSION)).toBeInTheDocument();
    },
};
