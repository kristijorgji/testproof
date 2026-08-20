import type { FlowArea, FlowScope, FlowTarget, Ledger, PlatformNode, TargetObject } from './schema.js';
export declare function walkPlatforms(nodes: PlatformNode[], visit: (node: PlatformNode, ancestors: PlatformNode[]) => void): void;
export declare function flattenPlatformNodes(nodes: PlatformNode[]): PlatformNode[];
export declare function findPlatform(nodes: PlatformNode[], id: string): PlatformNode | undefined;
export declare function platformLeaves(nodes: PlatformNode[], id: string): string[];
export declare function isPlatformDescendant(ancestor: string, maybeChild: string): boolean;
/** A scanner mapped to `covered` satisfies a demanded platform leaf. */
export declare function platformCovers(covered: string, demanded: string): boolean;
export declare function targetPlatformId(target: FlowTarget): string;
export declare function targetDimensions(target: FlowTarget): TargetObject['dimensions'];
export declare function scopeToTargets(scope: FlowScope): FlowTarget[];
export declare function inferAreaScope(area: FlowArea, platforms: PlatformNode[]): FlowScope;
export declare function ledgerPlatforms(ledger: Ledger): PlatformNode[];
//# sourceMappingURL=platforms.d.ts.map