import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactElement, type ReactNode, useMemo } from 'react';

export function QueryProvider({ children }: { children: ReactNode }): ReactElement {
    const client = useMemo(
        () => new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
        [],
    );
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
