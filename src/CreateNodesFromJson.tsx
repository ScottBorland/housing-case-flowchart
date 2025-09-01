
import type { Node, Edge } from '@xyflow/react';
import type { DateHeaderData } from './components/DateHeaderNode.js';
import type { HorizontalNodeData } from './components/HorizontalNode.js';
import type { CaseInfoFloatingData } from './components/CaseInfoFloatingNode.js';


import { MarkerType } from '@xyflow/react';

type AnyNodeData = DateHeaderData | HorizontalNodeData;
type AnyNode = Node<AnyNodeData>;

function parseDateForDiff(raw: string): Date | null {
  if (!raw) return null;
  const clean = raw === 'NaT' || raw === 'Unknown' ? '' : raw.endsWith(' 00:00:00') ? raw.slice(0, 10) : raw;
  if (!clean) return null;
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(a: Date, b: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  // use UTC to avoid DST/offset issues
  const utcA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const utcB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((utcB - utcA) / MS_PER_DAY);
}

export function createNodesFromJson(caseData: any): { nodes: AnyNode[]; edges: Edge[] } {
  const { Case_information } = caseData;

  const nodes: AnyNode[] = [];
  const edges: Edge[] = [];

  // Layout tuning
  let xPos = 0;
  const baseY = 0;
  const xGap = 600;      // horizontal gap between date columns
  const yGap = 120;      // vertical gap between stacked decisions
  const headerOffset = 140;

  nodes.push({
    id: 'case-floating',
    type: 'caseInfoMovable',
    position: {x: xPos+80, y: baseY-100},
    data:{
      caseId: Case_information.Case_Id,
      customerId: Case_information.CustomerId,
      officer: Case_information['Case_AssignedTo$Officer$'],
      created: Case_information.Case_DateCreated,
      closed: Case_information.Case_DateClosed ?? '',
    },
    draggable: true,
    selectable: true
  })

  let prevDecisionId: string | null = null;
  xPos += xGap;

  // Group decisions by date
  type DecisionRow = { step: string; decision: any };
  const grouped: Record<string, DecisionRow[]> = {};

  for (const [step, decision] of Object.entries(Case_information?.Decision_Tree ?? {})) {
    const date: string = (decision as any).Decision_DecisionMadeDate || 'Unknown';
    (grouped[date] ||= []).push({ step, decision });
  }

  const sortedDates = Object.keys(grouped).sort();

  const sortByStep = (rows: DecisionRow[]) =>
    rows.slice().sort((a, b) => {
      const na = Number(a.step);
      const nb = Number(b.step);
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return String(a.step).localeCompare(String(b.step));
    });

  // Track previous valid date header for date-to-date edges
  let prevDateNodeId: string | null = null;
  let prevDateValue: Date | null = null;

  // Build timeline columns
  for (const dateKey of sortedDates) {
  const decisions = sortByStep(grouped[dateKey]);

  // decide if this date is displayable (valid)
  const currentDate = parseDateForDiff(dateKey);
  const showHeader = !!currentDate;

  // add a date header only if it's valid
  if (showHeader) {
    const dateNodeId = `date-${dateKey}`;
    nodes.push({
      id: dateNodeId,
      type: 'dateHeader',
      position: { x: xPos, y: baseY - headerOffset },
      data: { label: `📅 ${dateKey}` },
      draggable: false,
      selectable: false,
    });

    // connect previous valid header → this header with days label
    if (prevDateNodeId && prevDateValue) {
      const diff = daysBetween(prevDateValue, currentDate!);
      edges.push({
        id: `${prevDateNodeId}__to__${dateNodeId}`,
        source: prevDateNodeId,
        target: dateNodeId,
        type: 'smoothstep',
        sourceHandle: 'right',
        targetHandle: 'left',
        markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#4a5568' },
        label: `${diff} day${diff === 1 ? '' : 's'}`,
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 6,
        labelStyle: { fontSize: 12, fontWeight: 600, fill: '#2d3748' },
        style: { stroke: '#94a3b8' },
      });
    }

    // update “previous valid header”
    prevDateNodeId = `date-${dateKey}`;
    prevDateValue = currentDate!;
  }

  // decisions (always render, even if header omitted)
  let lastInGroup = prevDecisionId;

  decisions.forEach((d, idx) => {
    const nodeId = `decision-${d.step}`;
    const yPos = baseY + idx * yGap;

    nodes.push({
      id: nodeId,
      type: 'horizontal',
      position: { x: xPos, y: yPos },
      data: {
        decisionType: d.decision?.Decision_DecisionType ?? '',
        outcome: d.decision?.Decision_DecisionOutcome ?? '',
      },
    });

    // first in this date: horizontal from previous decision; otherwise vertical
    edges.push({
      id: `${lastInGroup}-${nodeId}`,
      source: lastInGroup,
      target: nodeId,
      type: 'smoothstep',
      sourceHandle: lastInGroup === prevDecisionId ? 'right' : 'bottom',
      targetHandle: lastInGroup === prevDecisionId ? 'left'  : 'top',
      markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#4a5568' },
      style: { stroke: '#64748b' },
    });

    lastInGroup = nodeId;
  });

  prevDecisionId = lastInGroup;

  // move to next column even if we skipped the header
  xPos += xGap;
}


  return { nodes, edges };
}