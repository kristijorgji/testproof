import { type FlowCoverage, summarizeCoverage } from '../coverage.js';
import { flattenPlatformNodes } from '../platforms.js';
import { type CoverageStatus, DEFAULT_PLATFORMS, type Flow, type Ledger } from '../schema.js';

function escapeHtml(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function fileLinks(files: string[]): string {
    if (files.length === 0) return '<span class="muted">todo</span>';
    return files
        .map((f) => {
            const label = f.split('/').pop() ?? f;
            return `<a href="${escapeHtml(f)}">${escapeHtml(label)}</a>`;
        })
        .join(', ');
}

function renderFlowHtml(flow: Flow, coverage: Map<string, FlowCoverage>, depth: number): string {
    const cov = coverage.get(flow.id);
    const status = cov?.status ?? 'todo';
    const children = (flow.children ?? []).map((c) => renderFlowHtml(c, coverage, depth + 1)).join('');
    const refs = flow.refs?.length ? `<span class="refs">${escapeHtml(flow.refs.join(', '))}</span>` : '';
    const files = cov?.filesByPlatform ?? {};
    const demandedPlatforms = [...new Set((cov?.demanded ?? []).map((cell) => cell.platform))].sort();
    const extraPlatforms = Object.keys(files)
        .filter((name) => !demandedPlatforms.includes(name))
        .sort();
    const platforms = [...demandedPlatforms, ...extraPlatforms].map(
        (name) => `<div><strong>${escapeHtml(name)}:</strong> ${fileLinks(files[name] ?? [])}</div>`,
    );
    return `
<details class="flow" data-status="${status}" data-platforms="${escapeHtml([...demandedPlatforms, ...extraPlatforms].join(' '))}" data-id="${escapeHtml(flow.id)}" data-title="${escapeHtml(flow.title.toLowerCase())}" open>
  <summary>
    <span class="badge ${status}">${status}</span>
    <code>${escapeHtml(flow.id)}</code>
    <span class="title">${escapeHtml(flow.title)}</span>
    ${refs}
  </summary>
  <div class="body" style="margin-left:${depth * 12}px">
    ${platforms.join('')}
    ${children}
  </div>
</details>`;
}

export function renderFlowsHtml(
    ledger: Ledger,
    coverage: Map<string, FlowCoverage>,
    options: { title?: string; sourceHint?: string } = {},
): string {
    const summary = summarizeCoverage(coverage);
    const total = [...coverage.values()].length;
    const title = options.title ?? 'Testproof flow coverage';
    const sourceHint = options.sourceHint ?? 'testproof report';
    const areasHtml = ledger.areas
        .map((area) => {
            const groups = area.groups
                .map((group) => {
                    const heading = group.subtitle
                        ? `${escapeHtml(group.title)} — ${escapeHtml(group.subtitle)}`
                        : escapeHtml(group.title);
                    const flows = group.flows.map((f) => renderFlowHtml(f, coverage, 0)).join('');
                    const notes = group.notes ? `<p class="notes">${escapeHtml(group.notes.trim())}</p>` : '';
                    return `<section class="group"><h3>${heading}</h3>${notes}${flows}</section>`;
                })
                .join('');
            const intro = area.intro ? `<p class="intro">${escapeHtml(area.intro.trim())}</p>` : '';
            return `
<section class="area" data-area="${escapeHtml(area.id)}">
  <h2>${escapeHtml(area.title)}</h2>
  ${intro}
  ${groups}
</section>`;
        })
        .join('');

    const statuses: CoverageStatus[] = ['automated', 'partial', 'todo', 'manual'];

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; --bg: #0f1419; --fg: #e7ecf1; --muted: #9aa7b5; --card: #1a222c; --border: #2c3845; --accent: #3b82f6; }
  @media (prefers-color-scheme: light) {
    :root { --bg: #f6f8fa; --fg: #1f2328; --muted: #656d76; --card: #fff; --border: #d0d7de; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; font: 14px/1.45 system-ui, sans-serif; background: var(--bg); color: var(--fg); }
  header { position: sticky; top: 0; z-index: 2; background: var(--card); border-bottom: 1px solid var(--border); padding: 12px 16px; }
  h1 { font-size: 18px; margin: 0 0 8px; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  input[type=search], select { background: var(--bg); color: var(--fg); border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { border: 1px solid var(--border); border-radius: 999px; padding: 2px 10px; cursor: pointer; user-select: none; }
  .chip.active { background: var(--accent); color: #fff; border-color: var(--accent); }
  .stats { color: var(--muted); margin-top: 8px; }
  main { padding: 16px; max-width: 1100px; margin: 0 auto; }
  .area { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; }
  h2 { margin: 0 0 8px; font-size: 16px; } h2 small { color: var(--muted); font-weight: 400; }
  h3 { margin: 16px 0 8px; font-size: 14px; color: var(--muted); }
  .flow { border-top: 1px solid var(--border); padding: 6px 0; }
  .flow summary { cursor: pointer; display: flex; flex-wrap: wrap; gap: 8px; align-items: baseline; }
  code { font-size: 12px; }
  .badge { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; padding: 1px 6px; border-radius: 4px; background: var(--border); }
  .badge.automated { background: #166534; color: #dcfce7; }
  .badge.partial { background: #854d0e; color: #fef9c3; }
  .badge.todo { background: #7f1d1d; color: #fee2e2; }
  .badge.manual { background: #1e3a8a; color: #dbeafe; }
  .muted, .notes, .intro { color: var(--muted); white-space: pre-wrap; }
  a { color: var(--accent); }
  .hidden { display: none !important; }
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(title)}</h1>
  <div class="controls">
    <input id="q" type="search" placeholder="Search FLOW id or title…" size="32" />
    <select id="area"><option value="">All areas</option>${ledger.areas
        .map((a) => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.title)}</option>`)
        .join('')}</select>
    <div class="chips" id="statusChips">
      ${statuses.map((s) => `<span class="chip active" data-status="${s}">${s} (${summary[s]})</span>`).join('')}
    </div>
    <div class="chips" id="platformChips">${flattenPlatformNodes(ledger.platforms ?? DEFAULT_PLATFORMS)
        .map((node) => `<span class="chip active" data-platform="${escapeHtml(node.id)}">${escapeHtml(node.id)}</span>`)
        .join('')}</div>
  </div>
  <div class="stats">Total ${total} · automated ${summary.automated} · partial ${summary.partial} · todo ${summary.todo} · manual ${summary.manual}
  · regenerate with <code>${escapeHtml(sourceHint)}</code></div>
</header>
<main>${areasHtml}</main>
<script>
(() => {
  const q = document.getElementById('q');
  const area = document.getElementById('area');
  const statusChips = [...document.querySelectorAll('#statusChips .chip')];
  const platformChips = [...document.querySelectorAll('#platformChips .chip')];
  function activeSet(chips, attr) {
    return new Set(chips.filter(c => c.classList.contains('active')).map(c => c.dataset[attr]));
  }
  function apply() {
    const query = q.value.trim().toLowerCase();
    const statuses = activeSet(statusChips, 'status');
    const platforms = activeSet(platformChips, 'platform');
    const areaId = area.value;
    document.querySelectorAll('.area').forEach(section => {
      const areaMatch = !areaId || section.dataset.area === areaId;
      let visibleFlows = 0;
      section.querySelectorAll('.flow').forEach(flow => {
        const text = (flow.dataset.id + ' ' + flow.dataset.title).toLowerCase();
        const ok =
          areaMatch &&
          statuses.has(flow.dataset.status) &&
          (flow.dataset.platforms || '').split(' ').some(p => platforms.has(p)) &&
          (!query || text.includes(query));
        flow.classList.toggle('hidden', !ok);
        if (ok) visibleFlows += 1;
      });
      section.classList.toggle('hidden', !areaMatch || visibleFlows === 0);
    });
  }
  statusChips.forEach(c => c.addEventListener('click', () => { c.classList.toggle('active'); apply(); }));
  platformChips.forEach(c => c.addEventListener('click', () => { c.classList.toggle('active'); apply(); }));
  q.addEventListener('input', apply);
  area.addEventListener('change', apply);
})();
</script>
</body>
</html>
`;
}
