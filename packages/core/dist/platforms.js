import { DEFAULT_PLATFORMS } from './schema.js';
export function walkPlatforms(nodes, visit) {
    const walk = (list, ancestors) => {
        for (const node of list) {
            visit(node, ancestors);
            if (node.children?.length)
                walk(node.children, [...ancestors, node]);
        }
    };
    walk(nodes, []);
}
export function flattenPlatformNodes(nodes) {
    const out = [];
    walkPlatforms(nodes, (node) => {
        out.push(node);
    });
    return out;
}
export function findPlatform(nodes, id) {
    let found;
    walkPlatforms(nodes, (node) => {
        if (node.id === id)
            found = node;
    });
    return found;
}
export function platformLeaves(nodes, id) {
    const node = findPlatform(nodes, id);
    if (!node)
        return [];
    if (!node.children?.length)
        return [node.id];
    const leaves = [];
    walkPlatforms(node.children, (child) => {
        if (!child.children?.length)
            leaves.push(child.id);
    });
    return leaves;
}
export function isPlatformDescendant(ancestor, maybeChild) {
    return maybeChild === ancestor || maybeChild.startsWith(`${ancestor}.`);
}
/** A scanner mapped to `covered` satisfies a demanded platform leaf. */
export function platformCovers(covered, demanded) {
    return isPlatformDescendant(covered, demanded) || isPlatformDescendant(demanded, covered);
}
export function targetPlatformId(target) {
    return typeof target === 'string' ? target : target.platform;
}
export function targetDimensions(target) {
    return typeof target === 'string' ? undefined : target.dimensions;
}
export function scopeToTargets(scope) {
    switch (scope) {
        case 'web':
            return ['web'];
        case 'mobile':
            return ['mobile'];
        case 'common':
            return ['web', 'mobile'];
    }
}
export function inferAreaScope(area, platforms) {
    if (area.scope)
        return area.scope;
    const ids = new Set();
    const walk = (flows) => {
        for (const flow of flows) {
            for (const target of flow.targets ?? []) {
                ids.add(targetPlatformId(target));
            }
            if (flow.children?.length)
                walk(flow.children);
        }
    };
    for (const group of area.groups)
        walk(group.flows);
    const webish = [...ids].every((id) => isPlatformDescendant('web', id) || id === 'web');
    const mobileish = [...ids].every((id) => isPlatformDescendant('mobile', id) || id === 'mobile');
    if (ids.size > 0 && webish && !mobileish && !ids.has('mobile')) {
        const onlyWeb = [...ids].every((id) => isPlatformDescendant('web', id));
        if (onlyWeb && !findPlatform(platforms, 'mobile')?.id)
            return 'web';
        if (onlyWeb)
            return 'web';
    }
    if (ids.size > 0 && mobileish && [...ids].every((id) => isPlatformDescendant('mobile', id))) {
        return 'mobile';
    }
    return 'common';
}
export function ledgerPlatforms(ledger) {
    return ledger.platforms?.length ? ledger.platforms : DEFAULT_PLATFORMS;
}
//# sourceMappingURL=platforms.js.map