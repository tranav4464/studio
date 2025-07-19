import React from "react";

interface OptimizeCTAProps {
  enabled: boolean;
  onClick: () => void;
}

export default function OptimizeCTA({ enabled, onClick }: OptimizeCTAProps) {
  return (
    <button
      className="fixed bottom-8 right-8 z-50 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg disabled:opacity-50"
      disabled={!enabled}
      onClick={onClick}
    >
      Optimize Blog
    </button>
  );
} 