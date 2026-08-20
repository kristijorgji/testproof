export interface MaestroFlowInventoryRow {
    fileName: string;
    relativePath: string;
    tags: string[];
}
/** Extract top-level YAML `tags:` list (before first `---` document body commands). */
export declare function parseMaestroFlowTags(yamlSource: string): string[];
export declare function collectMaestroFlowInventory(flowsDir: string): MaestroFlowInventoryRow[];
//# sourceMappingURL=maestro.d.ts.map