import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';

export type DateHeaderData = { label: string };
type DateHeaderNodeType = Node<DateHeaderData, 'dateHeader'>;

const hidden: React.CSSProperties = {
  opacity: 0,
  width: 0,
  height: 0,
  pointerEvents: 'none',
};

function DateHeaderNode({ data }: NodeProps<DateHeaderNodeType>) {
  const raw = (data.label || '').replace('📅 ', '').trim();
  const clean = raw.endsWith(' 00:00:00') ? raw.slice(0, 10) : raw;
  let display = '';
  if (clean && clean !== 'NaT' && clean !== 'Unknown') {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      display = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      }).format(d);
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        padding: '10px 16px',
        borderRadius: 14,
        background: 'rgba(0, 63, 114, 1)',
        color: 'white',
        fontWeight: 600,
        fontSize: 14,
        textAlign: 'center',
        border: '2px solid #020e35ff',
        boxShadow: '0 6px 14px rgba(37,99,235,0.25)',
        minWidth: 250,
        pointerEvents: 'none', // label-like
      }}
    >
      {display ? `📅 ${display}` : ''}

      {/* invisible anchors so programmatic edges can attach */}
      <Handle type="target" position={Position.Left} id="left" isConnectable={false} style={hidden} />
      <Handle type="source" position={Position.Right} id="right" isConnectable={false} style={hidden} />
    </div>
  );
}

export default memo(DateHeaderNode);

