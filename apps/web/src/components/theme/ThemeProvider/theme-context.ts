'use client';

import { createContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
    setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
    mode: 'system',
    resolvedTheme: 'light',
    setMode: () => undefined,
});
