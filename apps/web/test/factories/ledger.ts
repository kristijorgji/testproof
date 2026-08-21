import type { Flow, FlowArea, FlowGroup, Ledger, PlatformNode } from '@testproof/core';

export function createPlatformNode(overrides: Partial<PlatformNode> = {}): PlatformNode {
    return { id: 'web', title: 'Web', ...overrides };
}

export function createFlow(overrides: Partial<Flow> = {}): Flow {
    return {
        id: 'FLOW-AUTH-LOGIN-SUCCESS',
        title: 'Correct credentials open the dashboard',
        targets: ['web', 'mobile'],
        ...overrides,
    };
}

export function createGroup(overrides: Partial<FlowGroup> = {}): FlowGroup {
    return { title: 'Login', flows: [createFlow()], ...overrides };
}

export function createArea(overrides: Partial<FlowArea> = {}): FlowArea {
    return { id: 'AUTH', title: 'AUTH', groups: [createGroup()], ...overrides };
}

export function createLedger(overrides: Partial<Ledger> = {}): Ledger {
    return {
        version: 2,
        platforms: [createPlatformNode(), createPlatformNode({ id: 'mobile', title: 'Mobile' })],
        areas: [createArea()],
        ...overrides,
    };
}
