import type { Preview } from '@storybook/react-vite';
import { mswLoader } from 'msw-storybook-addon/csf3';

import '../src/app/globals.css';
import { localeFlags, locales } from '../src/i18n/config';

import { withAppProviders } from './decorators/with-app-providers';

export const globalTypes: Preview['globalTypes'] = {
    theme: {
        name: 'Theme',
        description: 'Global theme for components',
        toolbar: {
            icon: 'circlehollow',
            items: [
                { value: 'light', icon: 'circlehollow', title: 'Light' },
                { value: 'dark', icon: 'circle', title: 'Dark' },
                { value: 'system', icon: 'browser', title: 'System' },
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
    loaders: [mswLoader()],
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
