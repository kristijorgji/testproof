export const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export const SEVERITIES = ['trivial', 'minor', 'normal', 'major', 'critical', 'blocker'] as const;
export const TYPES = [
    'functional',
    'smoke',
    'regression',
    'security',
    'usability',
    'performance',
    'accessibility',
    'acceptance',
    'other',
] as const;
export const LAYERS = ['e2e', 'integration', 'api', 'unit'] as const;
export const BEHAVIORS = ['positive', 'negative', 'destructive'] as const;
export const STATUSES = ['draft', 'active', 'deprecated'] as const;
export const AUTOMATIONS = ['automated', 'to-be-automated', 'manual'] as const;
