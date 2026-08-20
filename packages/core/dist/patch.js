import { isMap, isSeq, Scalar, YAMLMap, YAMLSeq } from 'yaml';
function asMap(node) {
    return isMap(node) ? node : undefined;
}
function asSeq(node) {
    return isSeq(node) ? node : undefined;
}
function scalar(value, block = false) {
    const s = new Scalar(value);
    if (block || value.includes('\n'))
        s.type = Scalar.BLOCK_LITERAL;
    return s;
}
function areasSeq(doc) {
    const areas = asSeq(doc.get('areas'));
    if (!areas)
        throw new Error('ledger document has no areas sequence');
    return areas;
}
function areaMapById(doc, areaId) {
    const found = areasSeq(doc).items.find((item) => asMap(item)?.get('id') === areaId);
    const map = asMap(found);
    if (!map)
        throw new Error(`area "${areaId}" not found`);
    return map;
}
function groupsSeq(area) {
    const groups = asSeq(area.get('groups'));
    if (!groups)
        throw new Error('area has no groups');
    return groups;
}
function walkFlows(seq, visit) {
    for (let i = 0; i < seq.items.length; i += 1) {
        const map = asMap(seq.items[i]);
        if (!map)
            continue;
        if (visit(map, seq, i))
            return true;
        const children = asSeq(map.get('children'));
        if (children && walkFlows(children, visit))
            return true;
    }
    return false;
}
function findFlow(doc, flowId) {
    let found;
    for (const areaItem of areasSeq(doc).items) {
        const area = asMap(areaItem);
        if (!area)
            continue;
        const groups = asSeq(area.get('groups'));
        if (!groups)
            continue;
        for (const groupItem of groups.items) {
            const group = asMap(groupItem);
            const flows = asSeq(group?.get('flows'));
            if (!flows)
                continue;
            walkFlows(flows, (map, parent, index) => {
                if (map.get('id') === flowId) {
                    found = { map, parent, index };
                    return true;
                }
                return false;
            });
            if (found)
                return found;
        }
    }
    throw new Error(`flow "${flowId}" not found`);
}
function parentFlowsSeq(doc, parent) {
    const area = areaMapById(doc, parent.areaId);
    const groups = groupsSeq(area);
    const group = asMap(groups.items[parent.groupIndex]);
    if (!group)
        throw new Error(`group ${parent.groupIndex} not found in ${parent.areaId}`);
    if (!parent.parentFlowId) {
        const flows = asSeq(group.get('flows'));
        if (!flows)
            throw new Error('group has no flows');
        return flows;
    }
    const { map } = findFlow(doc, parent.parentFlowId);
    let children = asSeq(map.get('children'));
    if (!children) {
        children = new YAMLSeq();
        map.set('children', children);
    }
    return children;
}
function flowToNode(flow) {
    const map = new YAMLMap();
    map.set('id', flow.id);
    map.set('title', flow.title);
    if (flow.note)
        map.set('note', scalar(flow.note, true));
    if (flow.manual !== undefined)
        map.set('manual', flow.manual);
    if (flow.refs)
        map.set('refs', flow.refs);
    if (flow.targets)
        map.set('targets', flow.targets);
    if (flow.children?.length) {
        const children = new YAMLSeq();
        for (const child of flow.children)
            children.add(flowToNode(child));
        map.set('children', children);
    }
    return map;
}
export function applyPatch(doc, patch) {
    switch (patch.op) {
        case 'set-flow-field': {
            const { map } = findFlow(doc, patch.flowId);
            map.set(patch.field, scalar(patch.value, patch.field === 'note'));
            return;
        }
        case 'set-flow-manual': {
            const { map } = findFlow(doc, patch.flowId);
            map.set('manual', patch.value);
            return;
        }
        case 'set-flow-refs': {
            const { map } = findFlow(doc, patch.flowId);
            map.set('refs', patch.value);
            return;
        }
        case 'set-flow-targets': {
            const { map } = findFlow(doc, patch.flowId);
            map.set('targets', patch.value);
            return;
        }
        case 'add-flow': {
            const seq = parentFlowsSeq(doc, patch.parent);
            seq.items.splice(patch.index, 0, flowToNode(patch.flow));
            return;
        }
        case 'remove-flow': {
            const { parent, index } = findFlow(doc, patch.flowId);
            parent.items.splice(index, 1);
            return;
        }
        case 'move-flow': {
            const { map, parent, index } = findFlow(doc, patch.flowId);
            parent.items.splice(index, 1);
            const dest = parentFlowsSeq(doc, patch.to);
            dest.items.splice(patch.to.index, 0, map);
            return;
        }
        case 'set-group-field': {
            const group = asMap(groupsSeq(areaMapById(doc, patch.areaId)).items[patch.groupIndex]);
            if (!group)
                throw new Error('group not found');
            group.set(patch.field, scalar(patch.value, patch.field === 'notes'));
            return;
        }
        case 'add-group': {
            const groups = groupsSeq(areaMapById(doc, patch.areaId));
            const group = new YAMLMap();
            group.set('title', patch.title);
            group.set('flows', new YAMLSeq());
            groups.items.splice(patch.index, 0, group);
            return;
        }
        case 'remove-group': {
            groupsSeq(areaMapById(doc, patch.areaId)).items.splice(patch.groupIndex, 1);
            return;
        }
        case 'move-group': {
            const groups = groupsSeq(areaMapById(doc, patch.areaId));
            const [item] = groups.items.splice(patch.from, 1);
            if (item)
                groups.items.splice(patch.to, 0, item);
            return;
        }
        case 'set-area-field': {
            const area = areaMapById(doc, patch.areaId);
            area.set(patch.field, scalar(patch.value, patch.field === 'intro'));
            return;
        }
        case 'add-area': {
            const area = new YAMLMap();
            area.set('id', patch.area.id);
            area.set('title', patch.area.title);
            if (patch.area.scope)
                area.set('scope', patch.area.scope);
            const groups = new YAMLSeq();
            const group = new YAMLMap();
            group.set('title', patch.area.title);
            group.set('flows', new YAMLSeq());
            groups.add(group);
            area.set('groups', groups);
            areasSeq(doc).items.splice(patch.index, 0, area);
            return;
        }
        case 'remove-area': {
            const areas = areasSeq(doc);
            const idx = areas.items.findIndex((item) => asMap(item)?.get('id') === patch.areaId);
            if (idx >= 0)
                areas.items.splice(idx, 1);
            return;
        }
        case 'move-area': {
            const areas = areasSeq(doc);
            const [item] = areas.items.splice(patch.from, 1);
            if (item)
                areas.items.splice(patch.to, 0, item);
            return;
        }
        case 'set-version': {
            doc.set('version', patch.value);
            return;
        }
        case 'set-root-seq': {
            doc.set(patch.key, patch.value);
            return;
        }
    }
}
export function applyPatches(doc, patches) {
    for (const patch of patches)
        applyPatch(doc, patch);
}
//# sourceMappingURL=patch.js.map