import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from '../server';

export function setupMsw(): void {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'bypass' });
    });
    afterEach(() => {
        server.resetHandlers();
    });
    afterAll(() => {
        server.close();
    });
}
