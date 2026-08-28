'use client';

import type { Virtualizer } from '@tanstack/react-virtual';

import type { DropProjection } from './flow-nav-projection';
import { projectionIndicatorTop } from './flow-nav-projection';
import type { NavRow } from './flow-nav-rows';
import { FLOW_ROW_BASE_PAD_PX, FLOW_ROW_INDENT_PX } from './flow-nav-zone';

export function FlowNavDropIndicator({
    rows,
    virtualizer,
    projection,
}: {
    rows: NavRow[];
    virtualizer: Virtualizer<HTMLDivElement, Element>;
    projection: DropProjection | null;
}) {
    if (!projection || projection.invalid || projection.zone === 'child') return null;
    const index = rows.findIndex((row) => row.key === projection.overKey);
    if (index < 0) return null;
    const virtualItems = virtualizer.getVirtualItems();
    const match = virtualItems.find((item) => item.index === index);
    const start = match?.start ?? index * 36;
    const size = match?.size ?? 36;
    const top = projectionIndicatorTop(start, size, projection.zone);
    const left = FLOW_ROW_BASE_PAD_PX + projection.depth * FLOW_ROW_INDENT_PX;
    return (
        <div
            className="pointer-events-none absolute right-2 z-10 h-0.5 bg-[var(--accent)]"
            style={{ top, left }}
            aria-hidden
        />
    );
}
