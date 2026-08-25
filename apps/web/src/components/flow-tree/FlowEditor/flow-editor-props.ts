import type { Ledger, LedgerPatch, PlatformNode } from '@testproof/core';

import type { FlowCoverageById } from './useFlowEditorActions';

import type { DraftActionResult, PublishResult, PublishStorage } from '@/actions/action-result';

export interface FlowEditorProps {
    ledger: Ledger;
    platforms: PlatformNode[];
    coverage: FlowCoverageById;
    beforeYaml: string;
    afterYaml: string;
    conflict?: { remote: string; draft: string };
    storage: PublishStorage;
    ledgerFilePath: string | null;
    onPatch: (patch: LedgerPatch) => Promise<void>;
    onPublish: (input: { message: string; pullRequest: boolean }) => Promise<PublishResult>;
    onReplay: () => Promise<DraftActionResult>;
    onDiscard: () => Promise<DraftActionResult>;
}
