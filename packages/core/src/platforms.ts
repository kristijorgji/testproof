import type { FlowTarget, Ledger, PlatformNode, TargetObject } from './schema.js';
import { DEFAULT_PLATFORMS } from './schema.js';

export function walkPlatforms(
    nodes: PlatformNode[],
    visit: (node: PlatformNode, ancestors: PlatformNode[]) => void,
): void {
    const walk = (list: PlatformNode[], ancestors: PlatformNode[]): void => {
        for (const node of list) {
            visit(node, ancestors);
            if (node.children?.length) walk(node.children, [...ancestors, node]);
        }
    };
    walk(nodes, []);
}

export function flattenPlatformNodes(nodes: PlatformNode[]): PlatformNode[] {
    const out: PlatformNode[] = [];
    walkPlatforms(nodes, (node) => {
        out.push(node);
    });
    return out;
}

export function findPlatform(nodes: PlatformNode[], id: string): PlatformNode | undefined {
    let found: PlatformNode | undefined;
    walkPlatforms(nodes, (node) => {
        if (node.id === id) found = node;
    });
    return found;
}

export function platformLeaves(nodes: PlatformNode[], id: string): string[] {
    const node = findPlatform(nodes, id);
    if (!node) return [];
    if (!node.children?.length) return [node.id];
    const leaves: string[] = [];
    walkPlatforms(node.children, (child) => {
        if (!child.children?.length) leaves.push(child.id);
    });
    return leaves;
}

export function isPlatformDescendant(ancestor: string, maybeChild: string): boolean {
    return maybeChild === ancestor || maybeChild.startsWith(`${ancestor}.`);
}

/** A scanner mapped to `covered` satisfies a demanded platform leaf. */
export function platformCovers(covered: string, demanded: string): boolean {
    return isPlatformDescendant(covered, demanded) || isPlatformDescendant(demanded, covered);
}

export function targetPlatformId(target: FlowTarget): string {
    return typeof target === 'string' ? target : target.platform;
}

export function targetDimensions(target: FlowTarget): TargetObject['dimensions'] {
    return typeof target === 'string' ? undefined : target.dimensions;
}

export function ledgerPlatforms(ledger: Ledger): PlatformNode[] {
    return ledger.platforms?.length ? ledger.platforms : DEFAULT_PLATFORMS;
}

/** Root platform ids, used as the default demand when neither flow nor area declares targets. */
export function rootPlatformIds(ledger: Ledger): string[] {
    return ledgerPlatforms(ledger).map((node) => node.id);
}
