import path from 'node:path';

export interface DefaultProjectStorage {
    storage: 'file';
    ledgerFilePath: string;
}

/** When Track B sets both env vars, new projects open Flows against the mounted YAML. */
export function defaultProjectStorageFromEnv(
    env: Record<string, string | undefined> = process.env,
): DefaultProjectStorage | undefined {
    if (env.TESTPROOF_DEFAULT_STORAGE !== 'file') {
        return undefined;
    }
    const ledgerFilePath = env.TESTPROOF_DEFAULT_LEDGER_FILE?.trim();
    if (!ledgerFilePath || !path.isAbsolute(ledgerFilePath)) {
        return undefined;
    }
    return { storage: 'file', ledgerFilePath };
}
