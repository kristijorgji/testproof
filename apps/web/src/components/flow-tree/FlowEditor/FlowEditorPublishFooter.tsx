'use client';

import type { ReactNode } from 'react';

export function FlowEditorPublishFooter({ children }: { children: ReactNode }) {
    return <div className="shrink-0 border-t border-[var(--border)] bg-[var(--card)] p-3">{children}</div>;
}
