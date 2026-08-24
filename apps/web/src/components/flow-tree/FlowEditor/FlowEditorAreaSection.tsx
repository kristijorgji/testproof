'use client';

import type { FlowArea } from '@testproof/core';
import { useTranslation } from 'react-i18next';

import { FlowTreeRow } from '../FlowTreeRow/FlowTreeRow';

import type { FlowCoverageById } from './useFlowEditorActions';

export function FlowEditorAreaSection({
    area,
    coverage,
    collapsed,
    selectedId,
    onToggleArea,
    onSelect,
    onRequestDelete,
    onAddChild,
}: {
    area: FlowArea;
    coverage: FlowCoverageById;
    collapsed: boolean;
    selectedId: string | undefined;
    onToggleArea: (areaId: string) => void;
    onSelect: (flowId: string) => void;
    onRequestDelete: (flowId: string) => void;
    onAddChild: (flowId: string) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="border-b border-[var(--border)] last:border-b-0">
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
                ? area.groups.map((group, groupIndex) => (
                      <div key={`${area.id}-${groupIndex}`}>
                          <div className="px-3 py-1 text-xs text-[var(--muted)]">{group.title}</div>
                          {group.flows.map((flow) => (
                              <div key={flow.id} className="group flex items-center gap-1 pr-2">
                                  <div className="min-w-0 flex-1">
                                      <FlowTreeRow
                                          flow={flow}
                                          status={coverage[flow.id]?.status}
                                          statusByFlowId={(id) => coverage[id]?.status ?? 'todo'}
                                          selectedId={selectedId}
                                          onSelect={onSelect}
                                      />
                                  </div>
                                  <button
                                      type="button"
                                      className="shrink-0 rounded border border-[var(--border)] px-1.5 py-0.5 text-xs opacity-0 group-hover:opacity-100"
                                      onClick={() => onAddChild(flow.id)}
                                  >
                                      {t('editor.addChildFlow')}
                                  </button>
                                  <button
                                      type="button"
                                      className="shrink-0 rounded border border-red-300 px-1.5 py-0.5 text-xs text-red-700 opacity-0 group-hover:opacity-100"
                                      onClick={() => onRequestDelete(flow.id)}
                                  >
                                      {t('editor.deleteFlow')}
                                  </button>
                              </div>
                          ))}
                      </div>
                  ))
                : null}
        </div>
    );
}
