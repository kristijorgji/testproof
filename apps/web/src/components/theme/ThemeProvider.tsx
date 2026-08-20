'use client';

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { THEME_COOKIE, THEME_STORAGE_KEY } from '@/lib/theme/theme-init';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

function resolveAppearance(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
    if (mode === 'system') return prefersDark ? 'dark' : 'light';
    return mode;
}

function persist(mode: ThemeMode): void {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
        // ignore quota / private mode
    }
    document.cookie = `${THEME_COOKIE}=${mode}; path=/; max-age=31536000; samesite=lax`;
}

const ThemeContext = createContext<{
    mode: ThemeMode;
    resolvedTheme: ResolvedTheme;
    setMode: (mode: ThemeMode) => void;
}>({
    mode: 'system',
    resolvedTheme: 'light',
    setMode: () => undefined,
});

export function ThemeProvider({ children, initialMode = 'system' }: { children: ReactNode; initialMode?: ThemeMode }) {
    const [mode, setModeState] = useState<ThemeMode>(initialMode);
    const [prefersDark, setPrefersDark] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        setPrefersDark(media.matches);
        const onChange = (event: MediaQueryListEvent): void => setPrefersDark(event.matches);
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        const resolved = resolveAppearance(mode, prefersDark);
        document.documentElement.classList.toggle('dark', resolved === 'dark');
        document.documentElement.setAttribute('data-theme-mode', mode);
        persist(mode);
    }, [mode, prefersDark]);

    const value = useMemo(
        () => ({
            mode,
            resolvedTheme: resolveAppearance(mode, prefersDark),
            setMode: (next: ThemeMode) => setModeState(next),
        }),
        [mode, prefersDark],
    );
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): { mode: ThemeMode; resolvedTheme: ResolvedTheme; setMode: (mode: ThemeMode) => void } {
    return useContext(ThemeContext);
}
