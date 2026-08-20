export declare const WEB_FLOW_TAG_RE: RegExp;
export declare const PLATFORM_TAG_RE: RegExp;
export interface TaggedFile {
    relativePath: string;
    flowIds: string[];
    platformOverride?: string;
}
export declare function collectTaggedSourceFiles(specsDir: string, options?: {
    ignore?: string[];
    extensions?: RegExp;
}): TaggedFile[];
export declare function collectWebE2eFlowFileMap(specsDir: string, ignore?: string[]): Map<string, string[]>;
//# sourceMappingURL=web.d.ts.map