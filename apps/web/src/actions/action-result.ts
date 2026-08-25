export type PublishStorage = 'git' | 'file' | 'db';

export type PublishResult =
    | { ok: true; storage: 'file'; path: string }
    | { ok: true; storage: 'git'; pullRequest: boolean }
    | { ok: true; storage: 'db' }
    | { ok: false; error: string };

export type DraftActionResult = { ok: true } | { ok: false; error: string };
