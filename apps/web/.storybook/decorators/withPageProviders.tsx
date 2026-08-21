import type { Decorator } from '@storybook/react-vite';

import { setPathname } from '../mocks/next-navigation';

import { withAppProviders } from './with-app-providers';

export const withPageProviders: Decorator = (Story, context) => {
    return withAppProviders(() => {
        const pathname = typeof context.parameters.pathname === 'string' ? context.parameters.pathname : '/';
        setPathname(pathname);
        return (
            <div className="min-h-screen bg-[var(--bg)] p-4">
                <Story />
            </div>
        );
    }, context);
};
