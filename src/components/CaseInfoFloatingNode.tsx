// src/components/CaseInfoFloatingNode.tsx
import { memo } from 'react';
import type { Node, NodeProps } from '@xyflow/react';

export type CaseInfoFloatingData = {
  caseId: string;
  customerId: string;
  officer: string;
  created?: string | null;
  closed?: string | null;
};

type CaseInfoFloatingType = Node<CaseInfoFloatingData, 'caseInfoMovable'>;

function formatDateLabel(raw?: string | null): string {
  if (!raw || raw === 'NaT' || raw === 'Unknown') return '';
  const clean = raw.endsWith(' 00:00:00') ? raw.slice(0, 10) : raw;
  const d = new Date(clean);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function CaseInfoFloatingNode({ data }: NodeProps<CaseInfoFloatingType>) {
  return (
    <div
      style={{
        padding: '18px 22px',
        borderRadius: 12,
        background: '#ffffff',          // pure white background
        border: '2px solid #e5e7eb',    // light grey border (no glow)
        boxShadow: 'none',              // remove glow
        minWidth: 280,
        fontSize: 20,                   // larger text for details
        lineHeight: 1.6,                // more spacing between lines
        cursor: 'move',
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 24,                 // bigger font for title
          marginBottom: 12,
          color: '#111827',             // slate-900 (almost black)
        }}
      >
        Case Information
      </div>
      <div><strong>Case ID:</strong> {data.caseId}</div>
      <div><strong>Customer:</strong> {data.customerId}</div>
      <div><strong>Officer:</strong> {data.officer}</div>
      <div><strong>Created:</strong> {formatDateLabel(data.created) || '—'}</div>
      <div><strong>Closed:</strong> {formatDateLabel(data.closed) || '—'}</div>
    </div>
  );
}

export default memo(CaseInfoFloatingNode);

