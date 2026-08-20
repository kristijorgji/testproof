import fs from 'node:fs';
import path from 'node:path';
import { deriveCoverage, flattenFlowIds, parseLedger, renderFlowsHtml, renderFlowsMarkdown, summarizeCoverage, } from '@testproof/core';
function derive(config, cwd) {
    const yamlSource = fs.readFileSync(path.resolve(cwd, config.ledger), 'utf8');
    const ledger = parseLedger(yamlSource);
    const scanners = config.platforms.map((p) => ({
        ...p,
        dir: path.resolve(cwd, p.dir),
        linkPrefix: p.linkPrefix,
    }));
    const coverage = deriveCoverage(ledger, { scanners });
    return { ledger, coverage };
}
export function generateCommand(config, cwd, check = false) {
    const { ledger, coverage } = derive(config, cwd);
    const md = renderFlowsMarkdown(ledger, coverage, config.markdown);
    const html = renderFlowsHtml(ledger, coverage);
    const mdOut = path.resolve(cwd, config.output?.markdown ?? 'docs/testing/flows-coverage.md');
    const htmlOut = path.resolve(cwd, config.output?.html ?? 'docs/testing/.generated/flows.html');
    if (check) {
        const existing = fs.existsSync(mdOut) ? fs.readFileSync(mdOut, 'utf8') : '';
        if (existing !== md) {
            console.error(`testproof generate --check: ${path.relative(cwd, mdOut)} is out of date`);
            return 1;
        }
        console.log('testproof generate --check: ok');
        return 0;
    }
    fs.mkdirSync(path.dirname(mdOut), { recursive: true });
    fs.mkdirSync(path.dirname(htmlOut), { recursive: true });
    fs.writeFileSync(mdOut, md);
    fs.writeFileSync(htmlOut, html);
    const summary = summarizeCoverage(coverage);
    console.log(`Wrote ${path.relative(cwd, mdOut)} and ${path.relative(cwd, htmlOut)} (${flattenFlowIds(ledger).length} flows; automated=${summary.automated} partial=${summary.partial} todo=${summary.todo} manual=${summary.manual})`);
    return 0;
}
export async function reportCommand(config, cwd, open = false) {
    const { ledger, coverage } = derive(config, cwd);
    const html = renderFlowsHtml(ledger, coverage);
    const htmlOut = path.resolve(cwd, config.output?.html ?? 'docs/testing/.generated/flows.html');
    fs.mkdirSync(path.dirname(htmlOut), { recursive: true });
    fs.writeFileSync(htmlOut, html);
    console.log(`Wrote ${path.relative(cwd, htmlOut)}`);
    if (open) {
        const { execFileSync } = await import('node:child_process');
        try {
            execFileSync('open', [htmlOut], { stdio: 'ignore' });
        }
        catch {
            console.warn(`Could not open ${htmlOut}; open it manually.`);
        }
    }
    return 0;
}
//# sourceMappingURL=generate.js.map