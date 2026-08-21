import { parseLedger } from '@testproof/core';

export const DEMO_LEDGER_YAML = `version: 2
platforms:
  - id: web
    title: Web
  - id: mobile
    title: Mobile
areas:
  - id: AUTH
    title: AUTH
    groups:
      - title: Login
        flows:
          - id: FLOW-AUTH-LOGIN-SUCCESS
            title: Correct credentials open the dashboard
            targets: [web, mobile]
`;

export const DEMO_LEDGER = parseLedger(DEMO_LEDGER_YAML);
