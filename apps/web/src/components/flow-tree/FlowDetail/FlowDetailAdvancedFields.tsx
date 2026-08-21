'use client';

import type { Flow } from '@testproof/core';

import { FlowDetailEnumFields } from './FlowDetailEnumFields';
import { FlowDetailMetaFields } from './FlowDetailMetaFields';

export function FlowDetailAdvancedFields({
    flow,
    onChange,
}: {
    flow: Flow;
    onChange?: (patch: Partial<Flow>) => void;
}) {
    return (
        <div className="grid gap-2 text-sm">
            <FlowDetailEnumFields flow={flow} onChange={onChange} />
            <FlowDetailMetaFields flow={flow} onChange={onChange} />
        </div>
    );
}
