import { applyPatches, ledgerPlatforms, openLedgerDocument, parseLedger, serializeLedgerDocument } from '@testproof/core';
import { drafts } from '@testproof/db';
import { and, eq } from 'drizzle-orm';

import { appendDraftPatch } from '@/actions/drafts';
import { FlowEditor } from '@/components/flow-tree/FlowEditor';
import { getDb } from '@/server/db';

const SAMPLE = `version: 2
platforms:
  - id: web
    title: Web
  - id: mobile
    title: Mobile
    children:
      - id: mobile.ios
        title: iOS
      - id: mobile.android
        title: Android
areas:
  - id: AUTH
    title: AUTH
    scope: common
    groups:
      - title: Login
        flows:
          - id: FLOW-AUTH-LOGIN-SUCCESS
            title: Correct credentials → dashboard
            targets: [web, mobile]
`;

export default async function FlowsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    let source = SAMPLE;
    let patches: Parameters<typeof applyPatches>[1] = [];
    try {
        const rows = await getDb()
            .select()
            .from(drafts)
            .where(and(eq(drafts.projectId, projectId), eq(drafts.status, 'open')))
            .limit(1);
        if (rows[0]) patches = rows[0].patches as typeof patches;
    } catch {
        patches = [];
    }
    const after = (() => {
        const doc = openLedgerDocument(source);
        applyPatches(doc, patches);
        return serializeLedgerDocument(doc);
    })();
    const ledger = parseLedger(after);
    return (
        <FlowEditor
            ledger={ledger}
            platforms={ledgerPlatforms(ledger)}
            coverage={{}}
            beforeYaml={source}
            afterYaml={after}
            onPatch={async (patch) => {
                'use server';
                await appendDraftPatch(projectId, 'main', 'local', patch);
            }}
            onPublish={async () => {
                'use server';
            }}
            onReplay={async () => {
                'use server';
            }}
            onDiscard={async () => {
                'use server';
            }}
        />
    );
}
