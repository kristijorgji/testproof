'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PROJECT_SPLIT_SIDEBAR_MAX, PROJECT_SPLIT_SIDEBAR_MIN } from './project-split-width';
import { useProjectSplitSidebarWidth } from './useProjectSplitSidebarWidth';

export function ProjectSplitLayout({ sidebar, detail }: { sidebar: ReactNode; detail: ReactNode }) {
    const { t } = useTranslation();
    const { width, desktop, beginDrag, nudge } = useProjectSplitSidebarWidth();

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:flex-row">
            <aside
                className="flex max-h-[50vh] min-h-0 w-full shrink-0 flex-col border-b border-[var(--border)] md:max-h-none md:border-r-0 md:border-b-0"
                style={desktop ? { width } : undefined}
            >
                {sidebar}
            </aside>
            <div
                role="separator"
                aria-orientation="vertical"
                aria-label={t('layout.resizePanels')}
                aria-valuenow={width}
                aria-valuemin={PROJECT_SPLIT_SIDEBAR_MIN}
                aria-valuemax={PROJECT_SPLIT_SIDEBAR_MAX}
                tabIndex={desktop ? 0 : -1}
                className="relative hidden w-1 shrink-0 cursor-col-resize bg-[var(--border)] outline-none hover:bg-[var(--muted)] focus-visible:bg-[var(--accent)] md:block"
                onPointerDown={(event) => {
                    event.preventDefault();
                    beginDrag(event.clientX);
                    event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onKeyDown={(event) => {
                    if (event.key === 'ArrowLeft') {
                        event.preventDefault();
                        nudge(-1);
                    } else if (event.key === 'ArrowRight') {
                        event.preventDefault();
                        nudge(1);
                    }
                }}
            />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{detail}</div>
        </div>
    );
}
