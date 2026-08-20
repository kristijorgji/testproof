import type { ReactNode } from 'react';

import { I18nProvider } from '@/components/i18n/I18nProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { getLocaleFromCookie } from '@/i18n/get-locale';

import './globals.css';

export const metadata = {
    title: 'Testproof',
    description: 'Git-native test case management',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
    const locale = await getLocaleFromCookie();
    return (
        <html lang={locale} suppressHydrationWarning>
            <body>
                <I18nProvider locale={locale}>
                    <ThemeProvider>{children}</ThemeProvider>
                </I18nProvider>
            </body>
        </html>
    );
}
