import { describe, expect, it } from 'vitest';

import { migrateLedgerSource } from '../src/migrate.js';
import { parseLedger } from '../src/parse.js';

const V1 = `version: 1
areas:
  - id: AUTH
    title: AUTH
    scope: common
    groups:
      - title: Login
        flows:
          - id: FLOW-AUTH-LOGIN-SUCCESS
            title: Correct credentials
`;

describe('migrateLedgerSource', () => {
    it('writes platforms even when parse fills implicit defaults', () => {
        const next = migrateLedgerSource(V1);
        expect(next).toMatch(/^version: 2/m);
        expect(next).toContain('platforms:');
        expect(next).toContain('id: web');
        expect(next).toContain('id: mobile');
        expect(next).toContain('dimensions:');
        expect(parseLedger(next).version).toBe(2);
    });

    it('is a no-op when the YAML already has v2 platforms and dimensions', () => {
        const already = migrateLedgerSource(V1);
        expect(migrateLedgerSource(already)).toBe(already);
    });
});
