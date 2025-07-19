import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';

export default function TableNodeView({ node }) {
  // Get the number of columns from the first row
  const columns = node.firstChild ? node.firstChild.childCount : 1;

  return (
    <NodeViewWrapper as="table" className="tiptap">
      <colgroup>
        {Array.from({ length: columns }).map((_, i) => (
          <col key={i} style={{ width: `${100 / columns}%` }} />
        ))}
      </colgroup>
      <NodeViewContent as="tbody" />
    </NodeViewWrapper>
  );
} 