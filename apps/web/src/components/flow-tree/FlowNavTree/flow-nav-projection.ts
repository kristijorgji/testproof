import type { DropZone } from './flow-nav-drop';

export interface DropProjection {
    overKey: string;
    zone: DropZone;
    depth: number;
    invalid: boolean;
}

export function projectionIndicatorTop(rowStart: number, rowSize: number, zone: DropZone): number {
    if (zone === 'before') return rowStart;
    if (zone === 'after') return rowStart + rowSize;
    return rowStart + rowSize / 2;
}
