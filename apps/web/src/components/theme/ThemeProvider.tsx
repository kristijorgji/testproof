'use client';

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const ThemeContext = createContext<{ mode: ThemeMode; setMode: (mode: ThemeMode) => void }>({
    mode: 'light',
    setMode: () => undefined,
});

export function ThemeProvider({ children, initial = 'light' }: { children: ReactNode; initial?: ThemeMode }) {
    const [mode, setMode] = useState<ThemeMode>(initial);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', mode === 'dark');
    }, [mode]);
    const value = useMemo(() => ({ mode, setMode }), [mode]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): { mode: ThemeMode; setMode: (mode: ThemeMode) => void } {
    return useContext(ThemeContext);
}
