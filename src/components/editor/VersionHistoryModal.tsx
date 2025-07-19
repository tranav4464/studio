import React from "react";

interface Version {
  id: string;
  timestamp: string;
  label?: string;
  content: string;
}

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  versions: Version[];
  onRestore: (id: string) => void;
}

export default function VersionHistoryModal({ open, onClose, versions, onRestore }: VersionHistoryModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-[480px] max-h-[80vh] overflow-y-auto">
        <div className="font-bold text-lg mb-4">Version History</div>
        <button className="absolute top-4 right-4" onClick={onClose}>Close</button>
        <ul>
          {versions.map(v => (
            <li key={v.id} className="mb-3 border-b pb-2">
              <div className="flex justify-between items-center">
                <span>{v.label || v.timestamp}</span>
                <button className="text-xs text-blue-600" onClick={() => onRestore(v.id)}>Restore</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 