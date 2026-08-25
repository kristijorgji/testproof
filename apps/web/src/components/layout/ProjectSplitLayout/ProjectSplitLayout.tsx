import type { ReactNode } from 'react';

export function ProjectSplitLayout({ sidebar, detail }: { sidebar: ReactNode; detail: ReactNode }) {
    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:flex-row">
            <aside className="flex max-h-[50vh] min-h-0 w-full flex-col border-b border-[var(--border)] md:max-h-none md:w-96 md:border-r md:border-b-0">
                {sidebar}
            </aside>
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{detail}</div>
        </div>
    );
}
