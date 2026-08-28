'use client';

import { createContext, useContext } from 'react';

import type { DropProjection } from './flow-nav-projection';

export interface FlowNavDndValue {
    projection: DropProjection | null;
    isInvalidTarget: (flowId: string) => boolean;
}

export const FlowNavDndContext = createContext<FlowNavDndValue>({
    projection: null,
    isInvalidTarget: () => false,
});

export function useFlowNavDndState(): FlowNavDndValue {
    return useContext(FlowNavDndContext);
}
