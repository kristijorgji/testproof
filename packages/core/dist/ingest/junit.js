const FLOW_RE = /FLOW-[A-Z0-9-]+/g;
function xmlUnescape(value) {
    return value
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&apos;', "'")
        .replaceAll('&amp;', '&');
}
function attr(tag, name) {
    const match = tag.match(new RegExp(`${name}="([^"]*)"`));
    return match?.[1] === undefined ? undefined : xmlUnescape(match[1]);
}
export function parseJunitXml(xml, platform = 'web') {
    const results = [];
    const cases = xml.match(/<testcase\b[\s\S]*?(?:\/>|<\/testcase>)/g) ?? [];
    for (const block of cases) {
        const name = attr(block, 'name') ?? '';
        const classname = attr(block, 'classname') ?? '';
        const time = attr(block, 'time');
        const ids = [...`${name} ${classname} ${block}`.matchAll(FLOW_RE)].map((m) => m[0]);
        const unique = [...new Set(ids)];
        let status = 'pass';
        if (/<failure\b/.test(block) || /<error\b/.test(block))
            status = 'fail';
        else if (/<skipped\b/.test(block))
            status = 'skip';
        const error = block.match(/<(?:failure|error)\b[^>]*>([\s\S]*?)<\//)?.[1];
        const entry = {
            platform,
            status,
            durationMs: time ? Number(time) * 1000 : undefined,
            errorText: error ? xmlUnescape(error).trim() : undefined,
        };
        if (unique.length === 0)
            results.push({ flowId: null, ...entry });
        else
            for (const flowId of unique)
                results.push({ flowId, ...entry });
    }
    return results;
}
//# sourceMappingURL=junit.js.map