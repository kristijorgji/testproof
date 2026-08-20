import type { Preview } from '@storybook/react-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';

import '../src/app/globals.css';
import { localeFlags, locales } from '../src/components/i18n/messages';
import { withAppProviders } from './decorators/with-app-providers';

initialize({ onUnhandledRequest: 'bypass' });

export const globalTypes: Preview['globalTypes'] = {
    theme: {
        name: 'Theme',
        description: 'Global theme for components',
        toolbar: {
            icon: 'circlehollow',
            items: [
                { value: 'light', icon: 'circlehollow', title: 'Light' },
                { value: 'dark', icon: 'circle', title: 'Dark' },
            ],
        },
    },
    locale: {
        name: 'Locale',
        description: 'Internationalization locale',
        toolbar: {
            icon: 'globe',
            dynamicTitle: true,
            items: locales.map((locale) => ({
                value: locale,
                title: locale,
                right: localeFlags[locale],
            })),
        },
    },
    deviceViewport: {
        name: 'Device',
        description: 'Viewport mode for responsive stories',
        toolbar: {
            icon: 'browser',
            items: [
                { value: 'auto', title: 'Auto' },
                { value: 'mobile', title: 'Mobile' },
                { value: 'tablet', title: 'Tablet' },
                { value: 'desktop', title: 'Desktop' },
            ],
        },
    },
};

export const initialGlobals: Preview['initialGlobals'] = {
    theme: 'light',
    locale: 'en',
    deviceViewport: 'auto',
};

const preview: Preview = {
    decorators: [withAppProviders],
    loaders: [mswLoader],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
