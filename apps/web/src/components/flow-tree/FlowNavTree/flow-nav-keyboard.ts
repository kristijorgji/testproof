import type { KeyboardEvent } from 'react';

import type { NavRow } from './flow-nav-rows';

export function handleFlowNavKeyDown(input: {
    event: KeyboardEvent<HTMLDivElement>;
    rows: NavRow[];
    selectedId?: string;
    onSelect?: (flowId: string) => void;
    onIndent?: () => void;
    onOutdent?: () => void;
    onRequestDelete?: () => void;
    onFocusTitle?: () => void;
    onToggleSelected?: () => void;
}): void {
    const { event, rows, selectedId, onSelect, onIndent, onOutdent, onRequestDelete, onFocusTitle, onToggleSelected } =
        input;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

    const flowRows = rows.filter((row): row is Extract<NavRow, { kind: 'flow' }> => row.kind === 'flow');
    const index = flowRows.findIndex((row) => row.id === selectedId);

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = flowRows[index + 1] ?? flowRows[0];
        if (next) onSelect?.(next.id);
        return;
    }
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prev = flowRows[index - 1] ?? flowRows[flowRows.length - 1];
        if (prev) onSelect?.(prev.id);
        return;
    }
    if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        onIndent?.();
        return;
    }
    if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault();
        onOutdent?.();
        return;
    }
    if (event.key === 'Enter') {
        event.preventDefault();
        onFocusTitle?.();
        return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        onRequestDelete?.();
        return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        onToggleSelected?.();
    }
}
