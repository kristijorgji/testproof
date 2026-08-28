import type { Meta, StoryObj } from '@storybook/react-vite';
import { createFlow, createGroup, createLedger } from '@test/factories/ledger';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { toggleSetValue } from '../FlowEditor/toggle-set';

import type { FlowNavTreeProps } from './flow-nav-tree-props';
import { FlowNavTree } from './FlowNavTree';

const child = createFlow({ id: 'FLOW-AUTH-LOGIN-CHILD', title: 'Session persists after refresh' });
const parent = createFlow({
    id: 'FLOW-AUTH-LOGIN-SUCCESS',
    title: 'Correct credentials open the dashboard',
    children: [child],
});
const ledger = createLedger({
    areas: [{ id: 'AUTH', title: 'AUTH', groups: [createGroup({ title: 'Login', flows: [parent] })] }],
});

function FlowNavTreeHarness(props: FlowNavTreeProps) {
    const [collapsedAreaIds, setCollapsedAreaIds] = useState(props.collapsedAreaIds);
    const [collapsedFlowIds, setCollapsedFlowIds] = useState(props.collapsedFlowIds);
    const [collapsedGroupKeys, setCollapsedGroupKeys] = useState(props.collapsedGroupKeys);
    return (
        <div className="h-80 w-80 border border-[var(--border)]">
            <FlowNavTree
                {...props}
                collapsedAreaIds={collapsedAreaIds}
                collapsedFlowIds={collapsedFlowIds}
                collapsedGroupKeys={collapsedGroupKeys}
                onToggleArea={(id) => setCollapsedAreaIds((current) => toggleSetValue(current, id))}
                onToggleFlow={(id) => setCollapsedFlowIds((current) => toggleSetValue(current, id))}
                onToggleGroup={(key) => setCollapsedGroupKeys((current) => toggleSetValue(current, key))}
                onCollapsedAreaIdsChange={setCollapsedAreaIds}
                onCollapsedFlowIdsChange={setCollapsedFlowIds}
            />
        </div>
    );
}

const meta: Meta<typeof FlowNavTree> = {
    title: 'Flows/FlowNavTree',
    component: FlowNavTree,
    render: (args) => <FlowNavTreeHarness {...args} />,
    args: {
        ledger,
        selectedId: parent.id,
        collapsedAreaIds: new Set<string>(),
        collapsedFlowIds: new Set<string>(),
        collapsedGroupKeys: new Set<string>(),
        statusByFlowId: (id) => (id === child.id ? 'todo' : 'automated'),
        onSelect: fn(),
        onToggleArea: fn(),
        onToggleFlow: fn(),
        onToggleGroup: fn(),
        onCollapsedAreaIdsChange: fn(),
        onCollapsedFlowIdsChange: fn(),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Selected: Story = {};

export const CollapsedArea: Story = {
    args: { collapsedAreaIds: new Set(['AUTH']), selectedId: undefined },
};

export const CollapsedGroup: Story = {
    args: { collapsedGroupKeys: new Set(['AUTH::0']), selectedId: undefined },
};

export const ChildDropHighlight: Story = {
    args: {
        selectedId: child.id,
        statusByFlowId: () => 'todo',
    },
};

export const WithStatuses: Story = {
    args: {
        statusByFlowId: (id) => {
            if (id === child.id) return 'partial';
            return 'manual';
        },
    },
};
