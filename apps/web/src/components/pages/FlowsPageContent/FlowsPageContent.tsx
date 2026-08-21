'use client';

import type { ComponentProps } from 'react';

import { FlowEditor } from '@/components/flow-tree/FlowEditor/FlowEditor';
import { ProjectNav } from '@/components/layout/ProjectNav/ProjectNav';

export function FlowsPageContent({
    projectId,
    name,
    ...editorProps
}: {
    projectId: string;
    name: string;
} & ComponentProps<typeof FlowEditor>) {
    return (
        <>
            <ProjectNav name={name} projectId={projectId} />
            <FlowEditor {...editorProps} />
        </>
    );
}
