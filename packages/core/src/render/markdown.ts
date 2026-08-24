import { DEFAULT_MARKDOWN, type MarkdownRenderConfig } from '../config.js';
import type { FlowCoverage } from '../coverage.js';
import type { Flow, FlowArea, FlowGroup, Ledger } from '../schema.js';

import { resolveDisplayPlatformLines } from './platform-lines.js';

function linkLabel(repoRelativePath: string): string {
    const base = repoRelativePath.split('/').pop() ?? repoRelativePath;
    return base;
}

/** Soft-wrap prose to ~100 cols so MD013 (120) stays green. */
function wrapProse(text: string, indent: string, width = 100): string[] {
    const out: string[] = [];
    for (const paragraph of text.replace(/\r\n/g, '\n').split('\n')) {
        if (paragraph.trim() === '') {
            out.push('');
            continue;
        }
        const words = paragraph.trim().split(/\s+/);
        let line = '';
        for (const word of words) {
            const next = line ? `${line} ${word}` : word;
            if (line && next.length > width) {
                out.push(`${indent}${line}`);
                line = word;
            } else {
                line = next;
            }
        }
        if (line) out.push(`${indent}${line}`);
    }
    return out;
}

function renderPlatformLine(platform: string, files: string[], covered: boolean, indent: string): string[] {
    if (!covered && files.length === 0) {
        return [`${indent}- **${platform}:** [ ] \`todo\``];
    }
    const lines: string[] = [`${indent}- **${platform}:** [x]`];
    for (const f of files) {
        lines.push(`${indent}  [\`${linkLabel(f)}\`](${f})`);
    }
    return lines;
}

function renderFlow(flow: Flow, coverage: Map<string, FlowCoverage>, ledger: Ledger, depth: number): string[] {
    const cov = coverage.get(flow.id);
    const status = cov?.status ?? 'todo';
    const topChecked = status === 'automated' || status === 'manual' ? 'x' : ' ';
    const indent = '  '.repeat(depth);
    const childIndent = '  '.repeat(depth + 1);
    let suffix = '';
    if (status === 'manual') suffix = ' `manual` `done`';
    else if (status === 'todo') suffix = ' `todo`';
    else if (status === 'partial') suffix = ' `Partial`';
    if (flow.refs?.length) suffix += ` (${flow.refs.join(' / ')})`;
    const head = `${indent}- [${topChecked}] \`${flow.id}\``;
    const rest = `${flow.title}${suffix}`;
    const lines: string[] = [];
    if (`${head} ${rest}`.length <= 110) {
        lines.push(`${head} ${rest}`);
    } else {
        lines.push(head);
        lines.push(...wrapProse(rest, `${indent}  `));
    }
    if (status !== 'manual' && cov) {
        const dims = (line: { dimensions: Record<string, string> }): string =>
            Object.entries(line.dimensions)
                .map(([key, value]) => `${key}=${value}`)
                .join(', ');
        for (const line of resolveDisplayPlatformLines(flow, cov, ledger)) {
            const label = dims(line) ? `${line.platform} (${dims(line)})` : line.platform;
            lines.push(...renderPlatformLine(label, line.files, line.covered, childIndent));
        }
    }
    for (const child of flow.children ?? []) {
        lines.push(...renderFlow(child, coverage, ledger, depth + 1));
    }
    return lines;
}

function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function renderGroupBody(group: FlowGroup, coverage: Map<string, FlowCoverage>, ledger: Ledger): string[] {
    const lines: string[] = [];
    if (group.subtitle) {
        lines.push(`##### ${group.subtitle}`, '');
    }
    if (group.notes?.trim()) {
        lines.push(...wrapProse(group.notes.trim(), ''), '');
    }
    for (const flow of group.flows) {
        lines.push(...renderFlow(flow, coverage, ledger, 0));
    }
    lines.push('');
    return lines;
}

function renderArea(area: FlowArea, coverage: Map<string, FlowCoverage>, ledger: Ledger): string[] {
    const lines: string[] = [`### ${area.title}`, ''];
    if (area.intro?.trim()) {
        lines.push(...wrapProse(area.intro.trim(), ''), '');
    }
    let lastTitledGroup: string | null = null;
    const skipRedundantTitle =
        area.groups.length === 1 && !area.groups[0]?.subtitle && area.groups[0]?.title === area.title;
    for (const group of area.groups) {
        if (!skipRedundantTitle) {
            if (group.subtitle) {
                if (group.title !== lastTitledGroup) {
                    lines.push(`#### ${group.title}`, '');
                    lastTitledGroup = group.title;
                }
            } else {
                lines.push(`#### ${group.title}`, '');
                lastTitledGroup = group.title;
            }
        }
        lines.push(...renderGroupBody(group, coverage, ledger));
    }
    return lines;
}

function renderToc(ledger: Ledger): string[] {
    const lines: string[] = [
        '## Table of contents',
        '',
        '- [Goals](#goals)',
        '- [Legend](#legend)',
        '- [Areas](#areas)',
    ];
    for (const area of ledger.areas) {
        lines.push(`  - [${area.title}](#${slugify(area.title)})`);
    }
    lines.push('');
    return lines;
}

export function renderFlowsMarkdown(
    ledger: Ledger,
    coverage: Map<string, FlowCoverage>,
    markdown: MarkdownRenderConfig = DEFAULT_MARKDOWN,
): string {
    const title = markdown.title ?? DEFAULT_MARKDOWN.title;
    const banner = markdown.banner ?? DEFAULT_MARKDOWN.banner ?? [];
    const intro = markdown.intro ?? DEFAULT_MARKDOWN.intro ?? [];
    const goals = markdown.goals ?? DEFAULT_MARKDOWN.goals ?? [];
    const legendRows = markdown.legendRows ?? DEFAULT_MARKDOWN.legendRows ?? [];

    const lines: string[] = [
        ...banner,
        '',
        `# ${title}`,
        '',
        ...intro,
        '',
        ...renderToc(ledger),
        '## Goals',
        '',
        ...goals,
        '',
        '## Legend',
        '',
        '| Mark              | Meaning                                                            |',
        '| ----------------- | ------------------------------------------------------------------ |',
        ...legendRows.map(([mark, meaning]) => `| ${mark.padEnd(17)} | ${meaning.padEnd(66)} |`),
        '',
        ...(markdown.footerHints ?? [
            '**Hierarchy:** headings nest areas → flows → branches; checklist indentation is',
            'parent → **sub-cases**.',
            '',
            '**Coverage:** derived automatically. Top-level `[x]` when every demanded platform',
            'is covered. One test may cover **many** `FLOW-…` IDs.',
            '',
        ]),
        '---',
        '',
        '## Areas',
        '',
    ];

    for (const area of ledger.areas) {
        lines.push(...renderArea(area, coverage, ledger));
    }

    return `${lines.join('\n').replace(/\n{3,}/g, '\n\n')}\n`;
}
