export type ScannerExtractor = 'regex-tag' | 'maestro-tags';
export interface PlatformScannerConfig {
    name: string;
    dir: string;
    extractor: ScannerExtractor;
    ignore?: string[];
    linkPrefix?: string;
}
export interface MarkdownRenderConfig {
    banner?: string[];
    title?: string;
    intro?: string[];
    goals?: string[];
    legendRows?: [string, string][];
    footerHints?: string[];
}
export interface TestproofConfig {
    ledger: string;
    platforms: PlatformScannerConfig[];
    coreAreaIds?: string[];
    output?: {
        markdown?: string;
        html?: string;
    };
    markdown?: MarkdownRenderConfig;
    server?: {
        url?: string;
        token?: string;
        projectId?: string;
    };
}
export declare function defineConfig(config: TestproofConfig): TestproofConfig;
export declare const DEFAULT_MARKDOWN: Required<Pick<MarkdownRenderConfig, 'title'>> & MarkdownRenderConfig;
export declare function isCoreAreaId(areaId: string, coreAreaIds?: string[]): boolean;
//# sourceMappingURL=config.d.ts.map