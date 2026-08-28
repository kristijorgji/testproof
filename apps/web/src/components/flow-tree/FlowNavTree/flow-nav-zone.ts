import type { ClientRect } from '@dnd-kit/core';

import type { DropZone } from './flow-nav-drop';

export const FLOW_ROW_BASE_PAD_PX = 8;
export const FLOW_ROW_INDENT_PX = 16;

export function dropZoneFromPointer(
    rect: ClientRect,
    pointerX: number,
    pointerY: number,
    options: { depth: number; basePadPx?: number; indentPx?: number },
): DropZone {
    const basePadPx = options.basePadPx ?? FLOW_ROW_BASE_PAD_PX;
    const indentPx = options.indentPx ?? FLOW_ROW_INDENT_PX;
    const relY = rect.height === 0 ? 0 : (pointerY - rect.top) / rect.height;
    const nestThresholdX = rect.left + basePadPx + (options.depth + 1) * indentPx + 20;
    const wantsChild = pointerX >= nestThresholdX;

    if (relY < 0.25) return wantsChild ? 'child' : 'before';
    if (relY > 0.75) return wantsChild ? 'child' : 'after';
    return wantsChild ? 'child' : 'after';
}
