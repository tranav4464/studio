import React from "react";

interface OutlinePanelProps {
  headings: { id: string; text: string }[];
  onJumpToSection: (id: string) => void;
}

export default function OutlinePanel({ headings, onJumpToSection }: OutlinePanelProps) {
  return (
    <div>
      <div className="font-semibold mb-2">Outline</div>
      <ul>
        {headings.map(h => (
          <li key={h.id} className="mb-2 cursor-pointer hover:underline" onClick={() => onJumpToSection(h.id)}>
            {h.text}
          </li>
        ))}
      </ul>
    </div>
  );
} 