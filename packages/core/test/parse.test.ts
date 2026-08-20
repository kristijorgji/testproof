import { describe, expect, it } from 'vitest';

import { flattenFlowIds, parseLedger } from '../src/parse.js';
import { resolveTargets } from '../src/targets.js';

const MINIMAL = `
version: 1
areas:
  - id: HOME
    title: HOME
    scope: common
    groups:
      - title: Home
        flows:
          - id: FLOW-HOME-OPENS
            title: Page opens
            children:
              - id: FLOW-HOME-SEARCH
                title: Search actions work
`;

describe('parseLedger', () => {
    it('parses nested flows and flattens ids', () => {
        const ledger = parseLedger(MINIMAL);
        expect(flattenFlowIds(ledger)).toEqual(['FLOW-HOME-OPENS', 'FLOW-HOME-SEARCH']);
        expect(ledger.areas[0]?.scope).toBe('common');
        expect(ledger.areas[0]?.groups[0]?.flows[0]?.targets).toEqual(['web', 'mobile']);
    });

    it('rejects duplicate FLOW ids', () => {
        expect(() =>
            parseLedger(`
version: 1
areas:
  - id: A
    title: A
    scope: web
    groups:
      - title: G
        flows:
          - id: FLOW-WEB-A
            title: one
          - id: FLOW-WEB-A
            title: two
`),
        ).toThrow(/duplicate FLOW id/);
    });

    it('rejects invalid FLOW id shape', () => {
        expect(() =>
            parseLedger(`
version: 1
areas:
  - id: A
    title: A
    scope: web
    groups:
      - title: G
        flows:
          - id: not-a-flow
            title: bad
`),
        ).toThrow(/invalid FLOW id/);
    });

    it('rejects bad scope', () => {
        expect(() =>
            parseLedger(`
version: 1
areas:
  - id: A
    title: A
    scope: desktop
    groups:
      - title: G
        flows:
          - id: FLOW-WEB-A
            title: one
`),
        ).toThrow(/scope must be/);
    });

    it('parses v2 platform tree, dimensions and optional case fields', () => {
        const ledger = parseLedger(`
version: 2
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
dimensions:
  - id: theme
    values: [light, dark]
areas:
  - id: AUTH
    title: AUTH
    groups:
      - title: Login
        flows:
          - id: FLOW-AUTH-LOGIN
            title: Login
            targets:
              - platform: mobile.android
                dimensions: { theme: [dark] }
            priority: high
            severity: major
            type: functional
            layer: e2e
            behavior: negative
`);
        const flow = ledger.areas[0]?.groups[0]?.flows[0];
        expect(flow?.priority).toBe('high');
        expect(resolveTargets(ledger, flow!)).toEqual([{ platform: 'mobile.android', dimensions: { theme: 'dark' } }]);
    });

    it('expands parent platform targets to leaves when no dimensions', () => {
        const ledger = parseLedger(`
version: 2
platforms:
  - id: mobile
    title: Mobile
    children:
      - id: mobile.ios
        title: iOS
      - id: mobile.android
        title: Android
areas:
  - id: A
    title: A
    groups:
      - title: G
        flows:
          - id: FLOW-A
            title: A
            targets: [mobile]
`);
        expect(resolveTargets(ledger, ledger.areas[0]!.groups[0]!.flows[0]!)).toEqual([
            { platform: 'mobile.ios', dimensions: {} },
            { platform: 'mobile.android', dimensions: {} },
        ]);
    });
});
