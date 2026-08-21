import { delay, HttpResponse } from 'msw';

export interface MswHandlerOptions {
    delayMs?: number | 'infinite';
    status?: number;
}

export function mswUrl(path: string): string {
    return `*${path}`;
}

export async function applyMswOptions(options?: MswHandlerOptions): Promise<HttpResponse<null> | null> {
    if (options?.delayMs !== undefined) await delay(options.delayMs);
    if (options?.status !== undefined && options.status >= 400) {
        return new HttpResponse(null, { status: options.status });
    }
    return null;
}
