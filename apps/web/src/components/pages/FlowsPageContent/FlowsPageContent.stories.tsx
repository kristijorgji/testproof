import type { Meta, StoryObj } from '@storybook/react-vite';
import { createCoverageMap } from '@test/factories/coverage';
import { createLedger } from '@test/factories/ledger';
import { createProject } from '@test/factories/project';
import { DEMO_LEDGER_YAML } from '@test/fixtures/ledger';
import { fn } from 'storybook/test';

import { withPageProviders } from '../../../../.storybook/decorators/withPageProviders';

import { FlowsPageContent } from './FlowsPageContent';

const project = createProject();
const ledger = createLedger();

const meta: Meta<typeof FlowsPageContent> = {
    title: 'Pages/FlowsPage',
    component: FlowsPageContent,
    decorators: [withPageProviders],
    args: {
        projectId: project.id,
        name: project.name,
        ledger,
        platforms: ledger.platforms ?? [],
        coverage: createCoverageMap(),
        beforeYaml: DEMO_LEDGER_YAML,
        afterYaml: DEMO_LEDGER_YAML,
        onPatch: fn(),
        onPublish: fn(),
        onReplay: fn(),
        onDiscard: fn(),
    },
    parameters: { pathname: `/projects/${project.id}/flows` },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {};

export const Conflict: Story = {
    args: {
        conflict: { remote: DEMO_LEDGER_YAML, draft: DEMO_LEDGER_YAML.replace('dashboard', 'home') },
    },
};
