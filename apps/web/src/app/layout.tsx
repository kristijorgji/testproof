import type { ReactNode } from 'react';

import { I18nProvider } from '@/components/i18n/I18nProvider/I18nProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider/ThemeProvider';
import { getLocaleFromCookie } from '@/i18n/get-locale';
import { THEME_INIT_SCRIPT } from '@/lib/theme/theme-init';

import './globals.css';

export const metadata = {
    title: 'Testproof',
    description: 'Git-native test case management',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
    const locale = await getLocaleFromCookie();
    return (
        <html lang={locale} data-theme-mode="system" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
            </head>
            <body>
                <I18nProvider locale={locale}>
                    <ThemeProvider initialMode="system">{children}</ThemeProvider>
                </I18nProvider>
            </body>
        </html>
    );
}
