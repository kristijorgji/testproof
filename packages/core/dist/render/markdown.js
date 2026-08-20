import { DEFAULT_MARKDOWN } from '../config.js';
function linkLabel(repoRelativePath) {
    const base = repoRelativePath.split('/').pop() ?? repoRelativePath;
    return base;
}
/** Soft-wrap prose to ~100 cols so MD013 (120) stays green. */
function wrapProse(text, indent, width = 100) {
    const out = [];
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
            }
            else {
                line = next;
            }
        }
        if (line)
            out.push(`${indent}${line}`);
    }
    return out;
}
function renderPlatformLine(platform, files, indent, scopeRequires) {
    if (!scopeRequires && files.length === 0) {
        return [];
    }
    if (files.length === 0) {
        return [`${indent}- **${platform}:** [ ] \`todo\``];
    }
    const lines = [`${indent}- **${platform}:** [x]`];
    for (const f of files) {
        lines.push(`${indent}  [\`${linkLabel(f)}\`](${f})`);
    }
    return lines;
}
function renderFlow(flow, coverage, depth) {
    const cov = coverage.get(flow.id);
    const status = cov?.status ?? 'todo';
    const topChecked = status === 'automated' || status === 'manual' ? 'x' : ' ';
    const indent = '  '.repeat(depth);
    const childIndent = '  '.repeat(depth + 1);
    let suffix = '';
    if (status === 'manual')
        suffix = ' `manual` `done`';
    else if (status === 'todo')
        suffix = ' `todo`';
    else if (status === 'partial')
        suffix = ' `Partial`';
    if (flow.refs?.length)
        suffix += ` (${flow.refs.join(' / ')})`;
    const head = `${indent}- [${topChecked}] \`${flow.id}\``;
    const rest = `${flow.title}${suffix}`;
    const lines = [];
    if (`${head} ${rest}`.length <= 110) {
        lines.push(`${head} ${rest}`);
    }
    else {
        lines.push(head);
        lines.push(...wrapProse(rest, `${indent}  `));
    }
    if (flow.note) {
        lines.push(...wrapProse(flow.note, childIndent));
    }
    if (status !== 'manual') {
        const scope = cov?.scope ?? 'common';
        const extra = Object.entries(cov?.filesByPlatform ?? {}).filter(([name]) => name !== 'web' && name !== 'mobile');
        if (scope === 'common' || scope === 'web') {
            lines.push(...renderPlatformLine('web', cov?.web.files ?? [], childIndent, true));
        }
        if (scope === 'common' || scope === 'mobile') {
            lines.push(...renderPlatformLine('mobile', cov?.mobile.files ?? [], childIndent, true));
        }
        for (const [name, files] of extra) {
            lines.push(...renderPlatformLine(name, files, childIndent, true));
        }
    }
    for (const child of flow.children ?? []) {
        lines.push(...renderFlow(child, coverage, depth + 1));
    }
    return lines;
}
function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
function renderGroupBody(group, coverage) {
    const lines = [];
    if (group.subtitle) {
        lines.push(`##### ${group.subtitle}`, '');
    }
    if (group.notes?.trim()) {
        lines.push(...wrapProse(group.notes.trim(), ''), '');
    }
    for (const flow of group.flows) {
        lines.push(...renderFlow(flow, coverage, 0));
    }
    lines.push('');
    return lines;
}
function renderArea(area, coverage) {
    const lines = [`### ${area.title}`, ''];
    if (area.intro?.trim()) {
        lines.push(...wrapProse(area.intro.trim(), ''), '');
    }
    let lastTitledGroup = null;
    const skipRedundantTitle = area.groups.length === 1 && !area.groups[0]?.subtitle && area.groups[0]?.title === area.title;
    for (const group of area.groups) {
        if (!skipRedundantTitle) {
            if (group.subtitle) {
                if (group.title !== lastTitledGroup) {
                    lines.push(`#### ${group.title}`, '');
                    lastTitledGroup = group.title;
                }
            }
            else {
                lines.push(`#### ${group.title}`, '');
                lastTitledGroup = group.title;
            }
        }
        lines.push(...renderGroupBody(group, coverage));
    }
    return lines;
}
function renderToc(ledger) {
    const lines = ['## Table of contents', '', '- [Goals](#goals)', '- [Legend](#legend)'];
    const common = ledger.areas.filter((a) => (a.scope ?? 'common') === 'common');
    const web = ledger.areas.filter((a) => a.scope === 'web');
    const mobile = ledger.areas.filter((a) => a.scope === 'mobile');
    if (common.length) {
        lines.push('- [Common for web and mobile](#common-for-web-and-mobile)');
        for (const area of common) {
            lines.push(`  - [${area.title}](#${slugify(area.title)})`);
        }
    }
    if (web.length) {
        lines.push('- [Web only](#web-only)');
        for (const area of web) {
            lines.push(`  - [${area.title}](#${slugify(area.title)})`);
        }
    }
    if (mobile.length) {
        lines.push('- [Mobile only](#mobile-only)');
        for (const area of mobile) {
            lines.push(`  - [${area.title}](#${slugify(area.title)})`);
        }
    }
    lines.push('');
    return lines;
}
export function renderFlowsMarkdown(ledger, coverage, markdown = DEFAULT_MARKDOWN) {
    const title = markdown.title ?? DEFAULT_MARKDOWN.title;
    const banner = markdown.banner ?? DEFAULT_MARKDOWN.banner ?? [];
    const intro = markdown.intro ?? DEFAULT_MARKDOWN.intro ?? [];
    const goals = markdown.goals ?? DEFAULT_MARKDOWN.goals ?? [];
    const legendRows = markdown.legendRows ?? DEFAULT_MARKDOWN.legendRows ?? [];
    const lines = [
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
            '**Coverage:** derived automatically. Top-level `[x]` when the required platform(s)',
            'for the area scope are covered. One test may cover **many** `FLOW-…` IDs.',
            '',
        ]),
        '---',
        '',
        '## Common for web and mobile',
        '',
        'Flows below apply to **both** web and the native app unless noted.',
        '',
    ];
    for (const area of ledger.areas.filter((a) => (a.scope ?? 'common') === 'common')) {
        lines.push(...renderArea(area, coverage));
    }
    const webAreas = ledger.areas.filter((a) => a.scope === 'web');
    if (webAreas.length) {
        lines.push('---', '', '## Web only', '', 'Flows below are **web-only** (no native-app counterpart required).', '');
        for (const area of webAreas) {
            lines.push(...renderArea(area, coverage));
        }
    }
    const mobileAreas = ledger.areas.filter((a) => a.scope === 'mobile');
    if (mobileAreas.length) {
        lines.push('---', '', '## Mobile only', '', 'Flows below are **mobile-only**.', '');
        for (const area of mobileAreas) {
            lines.push(...renderArea(area, coverage));
        }
    }
    return `${lines.join('\n').replace(/\n{3,}/g, '\n\n')}\n`;
}
//# sourceMappingURL=markdown.js.map