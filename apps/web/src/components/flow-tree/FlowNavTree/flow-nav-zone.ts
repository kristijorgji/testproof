import type { ClientRect } from '@dnd-kit/core';

import type { DropZone } from './flow-nav-drop';

export function dropZoneFromPointer(rect: ClientRect, pointerX: number, pointerY: number): DropZone {
    const relX = rect.width === 0 ? 0 : (pointerX - rect.left) / rect.width;
    const relY = rect.height === 0 ? 0 : (pointerY - rect.top) / rect.height;
    if (relX > 0.6) return 'child';
    if (relY < 0.35) return 'before';
    if (relY > 0.65) return 'after';
    return 'child';
}
