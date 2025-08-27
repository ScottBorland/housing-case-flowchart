import { memo } from 'react';

export type CaseHeaderProps = {
  caseId: string;
  customerId: string;
  officer: string;
  created?: string | null;
  closed?: string | null;
};

function formatDateLabel(raw?: string | null): string {
  if (!raw || raw === 'NaT' || raw === 'Unknown') return '';
  const clean = raw.endsWith(' 00:00:00') ? raw.slice(0, 10) : raw;
  const d = new Date(clean);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d); // e.g., 20 Jul 2022
}

function CaseHeader({ caseId, customerId, officer, created, closed }: CaseHeaderProps) {
  return (
    <div
      style={{
        margin: '12px 12px 0 12px',
        padding: '14px 18px',
        borderRadius: 14,
        background: 'rgb(0, 109, 85)',
        color: 'white',
        boxShadow: '0 8px 24px rgba(5, 53, 36, 0.25)',
        border: '1px solid #035230ff',  
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.2 }}>Case Overview</div>
      <div><strong>Case ID:</strong> {caseId}</div>
      <div><strong>Customer ID:</strong> {customerId}</div>
      <div><strong>Officer ID:</strong> {officer}</div>
      <div><strong>Date Created:</strong> {formatDateLabel(created) || '—'}</div>
      <div><strong>Date Closed:</strong> {formatDateLabel(closed) || '—'}</div>
    </div>
  );
}

export default memo(CaseHeader);

