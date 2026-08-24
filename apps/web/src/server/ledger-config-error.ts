export class LedgerConfigError extends Error {
    override readonly name = 'LedgerConfigError';

    constructor(message: string) {
        super(message);
    }
}

export function isLedgerConfigError(error: unknown): error is LedgerConfigError {
    return error instanceof LedgerConfigError;
}
