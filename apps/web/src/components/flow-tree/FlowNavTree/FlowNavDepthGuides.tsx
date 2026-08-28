'use client';

import { FLOW_ROW_BASE_PAD_PX, FLOW_ROW_INDENT_PX } from './flow-nav-zone';

export function FlowNavDepthGuides({ depth }: { depth: number }) {
    if (depth <= 0) return null;
    return (
        <>
            {Array.from({ length: depth }, (_, i) => (
                <span
                    key={i}
                    className="pointer-events-none absolute top-0 bottom-0 w-px bg-[var(--border)]"
                    style={{ left: FLOW_ROW_BASE_PAD_PX + i * FLOW_ROW_INDENT_PX + 8 }}
                    aria-hidden
                />
            ))}
        </>
    );
}
