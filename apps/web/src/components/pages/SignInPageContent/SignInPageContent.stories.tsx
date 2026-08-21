import type { Meta, StoryObj } from '@storybook/react-vite';
import { signInEmailHandler } from '@test/msw/auth';
import { expect, userEvent, within } from 'storybook/test';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { SignInPageContent } from './SignInPageContent';

const meta: Meta<typeof SignInPageContent> = {
    title: 'Pages/SignInPage',
    component: SignInPageContent,
    decorators: [withPageProviders],
    args: { nextPath: '/projects' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    parameters: {
        msw: { handlers: [signInEmailHandler()] },
    },
};

export const Error: Story = {
    parameters: {
        msw: { handlers: [signInEmailHandler({}, { status: 401 })] },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByPlaceholderText('Email'), 'user@example.com');
        await userEvent.type(canvas.getByPlaceholderText('Password'), 'wrong');
        await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }));
        await expect(canvas.findByText('Could not sign in')).resolves.toBeInTheDocument();
    },
};
