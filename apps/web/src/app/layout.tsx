import type { ReactNode } from 'react';

import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

import './globals.css';

export const metadata = {
    title: 'Testproof',
    description: 'Git-native test case management',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider>
                    <LocaleProvider locale="en">{children}</LocaleProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
