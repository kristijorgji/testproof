'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
    clampSidebarWidth,
    PROJECT_SPLIT_SIDEBAR_DEFAULT,
    PROJECT_SPLIT_SIDEBAR_STEP,
    readStoredSidebarWidth,
    writeStoredSidebarWidth,
} from './project-split-width';

export function useProjectSplitSidebarWidth(): {
    width: number;
    desktop: boolean;
    commitWidth: (next: number) => void;
    beginDrag: (clientX: number) => void;
    nudge: (direction: -1 | 1) => void;
} {
    const [width, setWidth] = useState(PROJECT_SPLIT_SIDEBAR_DEFAULT);
    const [desktop, setDesktop] = useState(false);
    const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

    useEffect(() => {
        setWidth(readStoredSidebarWidth());
        const media = window.matchMedia('(min-width: 768px)');
        const syncDesktop = (): void => {
            setDesktop(media.matches);
        };
        syncDesktop();
        media.addEventListener('change', syncDesktop);
        return () => media.removeEventListener('change', syncDesktop);
    }, []);

    const commitWidth = useCallback((next: number) => {
        const clamped = clampSidebarWidth(next, window.innerWidth);
        setWidth(clamped);
        writeStoredSidebarWidth(clamped);
    }, []);

    useEffect(() => {
        const onResize = (): void => {
            setWidth((current) => clampSidebarWidth(current, window.innerWidth));
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const onPointerMove = (event: PointerEvent): void => {
            const drag = dragRef.current;
            if (!drag) return;
            commitWidth(drag.startWidth + (event.clientX - drag.startX));
        };
        const onPointerUp = (): void => {
            dragRef.current = null;
            document.body.style.removeProperty('cursor');
            document.body.style.removeProperty('user-select');
        };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [commitWidth]);

    const beginDrag = useCallback(
        (clientX: number) => {
            dragRef.current = { startX: clientX, startWidth: width };
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        },
        [width],
    );

    const nudge = useCallback(
        (direction: -1 | 1) => {
            commitWidth(width + direction * PROJECT_SPLIT_SIDEBAR_STEP);
        },
        [commitWidth, width],
    );

    return { width, desktop, commitWidth, beginDrag, nudge };
}
