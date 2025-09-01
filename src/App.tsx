import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useMemo, useState } from 'react';

import { createNodesFromJson } from './CreateNodesFromJson.js';
import casesData from './SampleCases.json' with { type: 'json' };
import HorizontalNode from './components/HorizontalNode.js';
import DateHeaderNode from './components/DateHeaderNode.js';
import CaseHeader from './components/CaseHeader.js';
import CaseInfoFloatingNode from './components/CaseInfoFloatingNode.js';

// If you typed your node data unions elsewhere, you can import and use them.
// For simplicity we keep Node/Edge un-parameterized here.
export default function App() {
  // All available case IDs
  const allCaseIds = useMemo(() => Object.keys(casesData), []);

  // Selected case
  const [caseId, setCaseId] = useState<string>(allCaseIds[0] ?? '');

  // Search query for filtering case IDs
  const [query, setQuery] = useState<string>('');

  // Filter list by query (case-insensitive "includes")
  const filteredIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCaseIds;

    return allCaseIds.filter((id) => id.toLowerCase().includes(q));
  }, [allCaseIds, query]);

  // Ensure the currently selected case is visible in the dropdown even if it doesn't match the query
  const dropdownIds = useMemo(() => {
    return filteredIds.includes(caseId) ? filteredIds : [caseId, ...filteredIds];
  }, [filteredIds, caseId]);

  // Build nodes/edges for the selected case
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return caseId ? createNodesFromJson(casesData[caseId]) : { nodes: [], edges: [] };
  }, [caseId]);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // When caseId changes, rebuild graph
  const loadCase = useCallback((newId: string) => {
    if (!newId || !casesData[newId]) return;
    setCaseId(newId);
    const { nodes, edges } = createNodesFromJson(casesData[newId]);
    setNodes(nodes);
    setEdges(edges);
  }, []);

  // Handle pressing Enter in the search box: if exact match, load it
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const exact = (e.currentTarget.value || '').trim();
        if (exact && casesData[exact]) {
          loadCase(exact);
          // Keep query but you could clear it if you prefer:
          // setQuery('');
        }
      }
    },
    [loadCase]
  );

  // React Flow handlers
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges<Node>(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges<Edge>(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const nodeTypes = useMemo(
    () => ({
      caseInfoMovable: CaseInfoFloatingNode,
      horizontal: HorizontalNode,
      dateHeader: DateHeaderNode,
    }),
    []
  );

  const info = casesData[caseId]?.Case_information;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Top bar with controls aligned to the right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: '#f1f5f9',
          borderBottom: '1px solid #cbd5e1',
        }}
      >
        {/* Search input */}
        <input
          type="text"
          placeholder="Search case ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            outline: 'none',
            minWidth: 180,
          }}
        />

        {/* Dropdown of (filtered) case IDs */}
        <select
          value={caseId}
          onChange={(e) => loadCase(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            outline: 'none',
            minWidth: 160,
            background: 'white',
          }}
        >
          {dropdownIds.length > 0 ? (
            dropdownIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No matches
            </option>
          )}
        </select>
      </div>

      {/* Case header card
      {info && (
        <CaseHeader
          caseId={info.Case_Id ?? ''}
          customerId={info.CustomerId ?? ''}
          officer={info['Case_AssignedTo$Officer$'] ?? ''}
          created={info.Case_DateCreated ?? ''}
          closed={info.Case_DateClosed ?? ''}
        />
      )} */}

      {/* Graph */}
      <div style={{ flex: 1, backgroundColor: '#1e293b' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          nodesConnectable={false}
          edgesReconnectable={false}
          connectOnClick={false}
          elementsSelectable={false}
          nodesDraggable={false}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={30} size={1} color='#94a3b8' />
        </ReactFlow>
      </div>
    </div>
  );
}
