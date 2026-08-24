'use client';

import type { CoverageStatus, FlowArea } from '@testproof/core';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { FlowTreeRow } from '@/components/flow-tree/FlowTreeRow/FlowTreeRow';
import type { CoverageRow } from '@/server/coverage';

export function CoverageTree({
    projectId,
    areas,
    coverage,
    selectedFlowId,
    collapsedAreas,
    onSelectFlow,
    onToggleArea,
}: {
    projectId: string;
    areas: FlowArea[];
    coverage: Record<string, CoverageRow>;
    selectedFlowId: string | undefined;
    collapsedAreas: Set<string>;
    onSelectFlow: (flowId: string) => void;
    onToggleArea: (areaId: string) => void;
}) {
    const { t } = useTranslation();

    if (areas.length === 0) {
        return <p className="text-sm text-[var(--muted)]">{t('coverage.noMatches')}</p>;
    }

    return (
        <div className="rounded border border-[var(--border)]">
            {areas.map((area) => {
                const collapsed = collapsedAreas.has(area.id);
                return (
                    <div key={area.id} className="border-b border-[var(--border)] last:border-b-0">
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs uppercase text-[var(--muted)]"
                            aria-expanded={!collapsed}
                            onClick={() => onToggleArea(area.id)}
                        >
                            <span>{collapsed ? '▸' : '▾'}</span>
                            <span>{area.title}</span>
                        </button>
                        {!collapsed
                            ? area.groups.flatMap((group) =>
                                  group.flows.map((flow) => (
                                      <div key={flow.id} className="flex items-center gap-1 pr-2">
                                          <div className="min-w-0 flex-1">
                                              <FlowTreeRow
                                                  flow={flow}
                                                  statusByFlowId={(id) =>
                                                      (coverage[id]?.status ?? 'todo') as CoverageStatus
                                                  }
                                                  selectedId={selectedFlowId}
                                                  onSelect={onSelectFlow}
                                              />
                                          </div>
                                          <Link
                                              href={`/projects/${projectId}/flows?flow=${encodeURIComponent(flow.id)}`}
                                              className="shrink-0 text-xs text-[var(--accent)] underline"
                                          >
                                              {t('coverage.editFlow')}
                                          </Link>
                                      </div>
                                  )),
                              )
                            : null}
                    </div>
                );
            })}
        </div>
    );
}
