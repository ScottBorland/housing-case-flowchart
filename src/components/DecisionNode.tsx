import { Handle, Position } from '@xyflow/react';

function DecisionNode({ data, vertical }) {
  return (
    <div style={{ padding: 10, border: '1px solid #555', borderRadius: 5, background: '#fff', minWidth: 120 }}>
      {vertical && <Handle type="target" position={Position.Top} id="top" />}
      {!vertical && <Handle type="target" position={Position.Left} id="left" />}
      <div>{data.label}</div>
      {vertical && <Handle type="source" position={Position.Bottom} id="bottom" />}
      {!vertical && <Handle type="source" position={Position.Right} id="right" />}
    </div>
  );
}
