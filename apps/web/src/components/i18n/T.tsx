'use client';

import { useT } from './LocaleProvider';

export function T({ k }: { k: string }) {
    const t = useT();
    return <>{t(k)}</>;
}
