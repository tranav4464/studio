import React from "react";
import { usePathname } from "next/navigation";

const steps = [
  { label: "Create", path: "/new-blog/create" },
  { label: "Outline", path: "/new-blog/outline" },
  { label: "Editor", path: "/new-blog/editor" },
  { label: "Visualization", path: "/new-blog/visualization" },
  { label: "Optimization", path: "/new-blog/optimization" },
  { label: "Hero", path: "/new-blog/hero-image" },
  { label: "Repurpose", path: "/new-blog/repurpose" },
  { label: "Final", path: "/new-blog/final-output" },
];

const StepNavigationBar = () => {
  const pathname = usePathname();
  // Find the current step index by matching the current route
  const currentStep = steps.findIndex((step) => pathname?.startsWith(step.path)) + 1;

  return (
    <div className="sticky top-0 z-50 bg-white border-b shadow-sm px-4 py-2 overflow-x-auto">
      <div className="flex justify-between min-w-[768px] w-full max-w-7xl mx-auto">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          return (
            <div key={step.label} className="flex flex-col items-center flex-1 min-w-[80px]">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                  ${isActive ? "bg-teal-600 text-white" : "bg-gray-300 text-gray-800"}
                `}
              >
                {stepNum}
              </div>
              <span
                className={`mt-1 text-sm ${
                  isActive ? "text-black font-semibold" : "text-gray-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepNavigationBar; 