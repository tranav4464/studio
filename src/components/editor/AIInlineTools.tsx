"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Wand2, RefreshCw, Zap, Type, Hash, List, Quote, AlignLeft, Pilcrow, Code2 as CodeIcon, Link2, Image as ImageIcon, Smile, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AIInlineToolsProps {
  onAction: (action: string, text?: string) => Promise<void> | void;
  visible: boolean;
  position: { top: number; left: number };
  selectedText?: string;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const AI_ACTIONS = [
  { id: "improve", label: "Improve writing", icon: <Wand2 className="h-4 w-4" /> },
  { id: "rephrase", label: "Rephrase", icon: <RefreshCw className="h-4 w-4" /> },
  { id: "expand", label: "Expand", icon: <Type className="h-4 w-4" /> },
  { id: "summarize", label: "Summarize", icon: <AlignLeft className="h-4 w-4" /> },
  { id: "simplify", label: "Simplify", icon: <Pilcrow className="h-4 w-4" /> },
  { id: "tone", label: "Change tone", icon: <Smile className="h-4 w-4" /> },
];

const FORMAT_ACTIONS = [
  { id: "heading", label: "Heading", icon: <Type className="h-4 w-4" /> },
  { id: "subheading", label: "Subheading", icon: <Hash className="h-4 w-4" /> },
  { id: "bullet", label: "Bullet list", icon: <List className="h-4 w-4" /> },
  { id: "quote", label: "Quote", icon: <Quote className="h-4 w-4" /> },
  { id: "code", label: "Code block", icon: <CodeIcon className="h-4 w-4" /> },
  { id: "link", label: "Add link", icon: <Link2 className="h-4 w-4" /> },
  { id: "image", label: "Add image", icon: <ImageIcon className="h-4 w-4" /> },
];

export default function AIInlineTools({ 
  onAction, 
  visible, 
  position, 
  selectedText = "",
  onClose,
  className = "",
  style = {}
}: AIInlineToolsProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "format">("ai");
  const [isProcessing, setIsProcessing] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const handleAction = async (actionId: string) => {
    try {
      setIsProcessing(true);
      await onAction(actionId, selectedText);
    } finally {
      setIsProcessing(false);
    }
  };

  const actions = activeTab === "ai" ? AI_ACTIONS : FORMAT_ACTIONS;
  const isAITab = activeTab === "ai";

  return (
    <div
      ref={popoverRef}
      className={cn(
        "absolute z-50 bg-white dark:bg-zinc-900 border rounded-lg shadow-lg overflow-hidden transition-opacity duration-200",
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
      style={{
        top: `${position.top - 50}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        minWidth: '300px',
        ...style
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("ai")}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2",
            isAITab 
              ? "text-primary border-b-2 border-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Tools</span>
        </button>
        <button
          onClick={() => setActiveTab("format")}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2",
            !isAITab 
              ? "text-primary border-b-2 border-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Type className="h-4 w-4" />
          <span>Format</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-2 bg-gray-50 dark:bg-zinc-900">
        {selectedText && isAITab && (
          <div className="mb-3 p-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded">
            Selected: "{selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}"
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {actions.map((action) => (
            <TooltipProvider key={action.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-2 flex flex-col items-center gap-1 text-xs font-normal"
                    onClick={() => handleAction(action.id)}
                    disabled={isProcessing}
                  >
                    <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                      {action.icon}
                    </div>
                    <span>{action.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-600 dark:text-blue-300 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
          Processing...
        </div>
      )}
    </div>
  );
}