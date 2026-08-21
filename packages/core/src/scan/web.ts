import fs from 'node:fs';
import path from 'node:path';

export const WEB_FLOW_TAG_RE = /@FLOW-[A-Z0-9-]+/g;
export const PLATFORM_TAG_RE = /@platform:([A-Za-z0-9._-]+)/g;

export interface TaggedFile {
    relativePath: string;
    flowIds: string[];
    platformOverride?: string;
}

function uniqueSorted(values: Iterable<string>): string[] {
    return [...new Set(values)].sort();
}

export function collectTaggedSourceFiles(
    specsDir: string,
    options: { ignore?: string[]; extensions?: RegExp } = {},
): TaggedFile[] {
    const ignore = new Set(options.ignore ?? ['__screenshots__', 'node_modules']);
    const extensions = options.extensions ?? /\.(ts|tsx|js|mjs)$/;
    const files: TaggedFile[] = [];

    function walk(dir: string): void {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (ignore.has(entry.name)) continue;
                walk(full);
                continue;
            }
            if (!extensions.test(entry.name)) continue;
            const source = fs.readFileSync(full, 'utf8');
            const matches = source.match(WEB_FLOW_TAG_RE) ?? [];
            if (matches.length === 0) continue;
            const platformMatch = [...source.matchAll(PLATFORM_TAG_RE)][0]?.[1];
            files.push({
                relativePath: path.relative(specsDir, full).split(path.sep).join('/'),
                flowIds: uniqueSorted(matches.map((t) => t.slice(1))),
                platformOverride: platformMatch,
            });
        }
    }

    walk(specsDir);
    return files;
}

export function collectFlowFileMap(specsDir: string, ignore?: string[]): Map<string, string[]> {
    const map = new Map<string, string[]>();
    for (const file of collectTaggedSourceFiles(specsDir, { ignore })) {
        for (const id of file.flowIds) {
            const list = map.get(id) ?? [];
            list.push(file.relativePath);
            map.set(id, list);
        }
    }
    for (const [id, files] of map) {
        map.set(id, uniqueSorted(files));
    }
    return map;
}
