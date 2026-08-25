'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useCoverageFlowParam(): {
    selectedFlowId: string | undefined;
    onSelectedFlowIdChange: (id: string | undefined) => void;
} {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedFlowId = searchParams.get('flow') ?? undefined;

    const onSelectedFlowIdChange = useCallback(
        (id: string | undefined) => {
            const params = new URLSearchParams(searchParams.toString());
            if (id) params.set('flow', id);
            else params.delete('flow');
            const query = params.toString();
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        },
        [pathname, router, searchParams],
    );

    return { selectedFlowId, onSelectedFlowIdChange };
}
