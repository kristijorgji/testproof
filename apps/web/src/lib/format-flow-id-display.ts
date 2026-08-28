const FLOW_PREFIX = 'FLOW-';

export function formatFlowIdForDisplay(flowId: string): string {
    return flowId.startsWith(FLOW_PREFIX) ? flowId.slice(FLOW_PREFIX.length) : flowId;
}

export function flowIdPrefixForArea(areaId: string): string {
    return `${FLOW_PREFIX}${areaId}-`;
}
