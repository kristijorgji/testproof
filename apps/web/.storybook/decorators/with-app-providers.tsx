import type { Decorator } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactElement, type ReactNode, useEffect, useMemo } from 'react';

import { LocaleProvider } from '../../src/components/i18n/LocaleProvider';
import { ThemeProvider, useTheme } from '../../src/components/theme/ThemeProvider';
import { setPathname } from '../mocks/next-navigation';
import { resolveStorybookLocaleForDecorator } from '../resolve-storybook-locale';

function QueryProvider({ children }: { children: ReactNode }): ReactElement {
    const client = useMemo(
        () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
        [],
    );
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function ThemeSync({ children, sbTheme }: { children: ReactNode; sbTheme: 'light' | 'dark' }): ReactElement {
    const { setMode } = useTheme();
    useEffect(() => {
        setMode(sbTheme);
    }, [sbTheme, setMode]);
    return <>{children}</>;
}

export const withAppProviders: Decorator = (Story, context) => {
    const locale = resolveStorybookLocaleForDecorator(context.globals.locale);
    const sbTheme = (context.globals.theme as 'light' | 'dark') ?? 'light';
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
            <ThemeProvider initial={sbTheme}>
                <LocaleProvider locale={locale}>
                    <ThemeSync sbTheme={sbTheme}>
                        <div style={{ width: forcedWidth, maxWidth: '100%' }}>
                            <Story />
                        </div>
                    </ThemeSync>
                </LocaleProvider>
            </ThemeProvider>
        </QueryProvider>
    );
};
