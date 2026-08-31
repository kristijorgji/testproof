const LEDGER_CONFIG_ERROR_CODES = [
    'missingGitRepo',
    'missingGitToken',
    'missingFilePath',
    'relativeFilePath',
    'fileMissing',
    'fileNotReadable',
    'fileNotWritable',
    'invalidLedger',
    'missingDbLedger',
] as const;

export type LedgerConfigErrorCode = (typeof LEDGER_CONFIG_ERROR_CODES)[number];

interface LedgerConfigErrorDetails {
    path?: string;
    causeMessage?: string;
}

export class LedgerConfigError extends Error {
    override readonly name = 'LedgerConfigError';
    readonly code: LedgerConfigErrorCode;
    readonly path?: string;
    readonly causeMessage?: string;

    constructor(code: LedgerConfigErrorCode, details: LedgerConfigErrorDetails = {}) {
        const pathSuffix = details.path ? ` (${details.path})` : '';
        const causeSuffix = details.causeMessage ? `: ${details.causeMessage}` : '';
        super(`${code}${pathSuffix}${causeSuffix}`);
        this.code = code;
        this.path = details.path;
        this.causeMessage = details.causeMessage;
    }
}

export function isLedgerConfigError(error: unknown): error is LedgerConfigError {
    return error instanceof LedgerConfigError;
}

export function isLedgerConfigErrorCode(value: string): value is LedgerConfigErrorCode {
    return (LEDGER_CONFIG_ERROR_CODES as readonly string[]).includes(value);
}
