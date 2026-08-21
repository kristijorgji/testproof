import { type ReactElement, type ReactNode, useEffect } from 'react';

import { useTheme } from '../../src/components/theme/ThemeProvider/useTheme';

export function ThemeSync({
    children,
    sbTheme,
}: {
    children: ReactNode;
    sbTheme: 'light' | 'dark' | 'system';
}): ReactElement {
    const { setMode } = useTheme();
    useEffect(() => {
        setMode(sbTheme);
    }, [sbTheme, setMode]);
    return <>{children}</>;
}
