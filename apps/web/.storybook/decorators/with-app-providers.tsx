import type { Decorator } from '@storybook/react-vite';

import { I18nProvider } from '../../src/components/i18n/I18nProvider/I18nProvider';
import { ThemeProvider } from '../../src/components/theme/ThemeProvider/ThemeProvider';
import { setPathname } from '../mocks/next-navigation';
import { resolveStorybookLocaleForDecorator } from '../resolve-storybook-locale';

import { QueryProvider } from './QueryProvider';
import { ThemeSync } from './ThemeSync';

export const withAppProviders: Decorator = (Story, context) => {
    const locale = resolveStorybookLocaleForDecorator(context.globals.locale);
    const sbTheme = (context.globals.theme as 'light' | 'dark' | 'system') ?? 'light';
    const deviceViewport = context.globals.deviceViewport as string | undefined;
    const forcedWidth =
        deviceViewport === 'mobile'
            ? 390
            : deviceViewport === 'tablet'
              ? 900
              : deviceViewport === 'desktop'
                ? 1280
                : undefined;
    setPathname(`/${locale}`);
    return (
        <QueryProvider>
            <ThemeProvider initialMode={sbTheme}>
                <I18nProvider locale={locale}>
                    <ThemeSync sbTheme={sbTheme}>
                        <div style={{ width: forcedWidth, maxWidth: '100%' }}>
                            <Story />
                        </div>
                    </ThemeSync>
                </I18nProvider>
            </ThemeProvider>
        </QueryProvider>
    );
};
