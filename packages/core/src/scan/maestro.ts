import fs from 'node:fs';
import path from 'node:path';

export interface MaestroFlowInventoryRow {
    fileName: string;
    relativePath: string;
    tags: string[];
}

/** Extract top-level YAML `tags:` list (before first `---` document body commands). */
export function parseMaestroFlowTags(yamlSource: string): string[] {
    // Require indentation on list items so document `---` / body `- launchApp` are not tags.
    const tagsBlock = yamlSource.match(/^tags:\s*\n((?:[ \t]+-[ \t]*.+\n)*)/m);
    const block = tagsBlock?.[1];
    if (!block) {
        return [];
    }
    return block
        .split('\n')
        .map((line) => line.match(/^[ \t]+-[ \t]*(.+?)\s*$/)?.[1]?.replace(/^['"]|['"]$/g, ''))
        .filter((t): t is string => Boolean(t));
}

export function collectMaestroFlowInventory(flowsDir: string): MaestroFlowInventoryRow[] {
    const rows: MaestroFlowInventoryRow[] = [];

    function walk(dir: string): void {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
                continue;
            }
            if (!entry.name.endsWith('.yaml') && !entry.name.endsWith('.yml')) {
                continue;
            }
            const source = fs.readFileSync(full, 'utf8');
            const relativePath = path.relative(flowsDir, full).split(path.sep).join('/');
            rows.push({
                fileName: entry.name.replace(/\.(yaml|yml)$/, ''),
                relativePath,
                tags: parseMaestroFlowTags(source),
            });
        }
    }

    walk(flowsDir);
    return rows.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}
