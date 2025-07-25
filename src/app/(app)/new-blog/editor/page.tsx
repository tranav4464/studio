"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';
const RichBlogEditor = dynamic(() => import('@/components/editor/RichBlogEditor'), { ssr: false });
import AIInlineTools from "@/components/editor/AIInlineTools";
import CommentSidebar from "@/components/editor/CommentSidebar";
import VersionHistoryModal from "@/components/editor/VersionHistoryModal";
import SidebarPanels from "@/components/editor/SidebarPanels";
import OutlinePanel from "@/components/editor/OutlinePanel";
import OptimizeCTA from "@/components/editor/OptimizeCTA";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ImageInsertTool from "@/components/editor/ImageInsertTool";
import { LexicalComposer } from '@lexical/react/LexicalComposer';

interface Comment {
  id: string;
  text: string;
  selection: string;
  author: string;
}

interface Version {
  id: string;
  timestamp: string;
  label?: string;
  content: string;
}

export default function EditorPage() {
  // Editor state
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Comments and versions
  const [comments, setComments] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  
  // AI tools
  const [aiToolsVisible, setAIToolsVisible] = useState(false);
  const [aiToolsPosition, setAIToolsPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  
  // Outline and optimization
  const [optimizeEnabled, setOptimizeEnabled] = useState(false);
  const [outline, setOutline] = useState([
    { id: "intro", text: "Introduction" },
    { id: "body", text: "Body" },
    { id: "conclusion", text: "Conclusion" },
  ]);
  
  // Collapsible state: only one open at a time
  const [openSection, setOpenSection] = useState<'editor' | 'seo' | 'comments' | null>('editor');
  
  // Track text selection for AI tools
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !editorRef.current?.contains(selection.anchorNode)) {
        setAIToolsVisible(false);
        return;
      }
      
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(selection.toString().trim());
      setAIToolsPosition({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX
      });
      setAIToolsVisible(true);
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Save content function
  const saveContent = async (content: string) => {
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Save silently without showing toast
    } catch (error) {
      console.error("Failed to save content:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle AI actions
  const handleAIAction = async (action: string, text?: string) => {
    try {
      // Close the AI tools
      setAIToolsVisible(false);
      
      // Show processing state
      toast({
        title: "Processing...",
        description: `Applying ${action} to selected text`,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would call your AI API here
      // const result = await aiService.processAction(action, text);
      
      // For demo purposes, just show a success message
      toast({
        title: "Success",
        description: `Applied ${action} to selected text`,
      });
      
      // Update the editor content with the result
      // setContent(updatedContent);
      
    } catch (error) {
      console.error("AI Action failed:", error);
      toast({
        title: "Error",
        description: `Failed to apply ${action}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleAddComment = (comment: Comment) => {
    setComments((prev: Comment[]) => [...prev, comment]);
  };

  const handleDeleteComment = (id: string) => {
    setComments((prev: Comment[]) => prev.filter((c) => c.id !== id));
  };

  const handleRestoreVersion = (id: string) => {
    toast({
      title: "Version Restored",
      description: `Version ${id} has been restored.`,
    });
  };

  const handleJumpToSection = (id: string) => {
    // TODO: Implement smooth scroll to section
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOptimize = () => {
    setOptimizeEnabled(true);
    // TODO: Implement optimization logic
    toast({
      title: "Optimization Started",
      description: "Your blog post is being optimized...",
    });
  };

  const handleSaveClick = () => {
    saveContent(content);
  };

  // Card component
  function CollapsibleCard({
    title,
    section,
    children,
    defaultOpen = false,
    className = ''
  }: {
    title: string;
    section: 'editor' | 'seo' | 'comments';
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
  }) {
    const open = openSection === section;
    return (
      <div className={`bg-white dark:bg-zinc-900 rounded-xl shadow-md mb-8 overflow-hidden border ${className}`}>
        <button
          className="w-full flex items-center justify-between px-6 py-4 text-lg font-semibold focus:outline-none hover:bg-muted/40 transition-colors"
          onClick={() => setOpenSection(open ? null : section)}
        >
          <span>{title}</span>
          {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
        <div
          className={`transition-all duration-300 ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden px-6 pb-6`}
        >
          {open && children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] bg-white dark:bg-zinc-900">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Editor Section */}
          <CollapsibleCard title="Editor" section="editor">
            {/* Top bar: Version history */}
            <div className="flex justify-end mb-4">
              <button 
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                onClick={() => setVersionModalOpen(true)}
              >
                <span>History</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <LexicalComposer initialConfig={{
              namespace: 'RichBlogEditor',
              theme: {},
              onError: (e) => { throw e; },
            }}>
              <RichBlogEditor
                initialContent={content}
                onUpdate={setContent}
                className="min-h-[300px]"
              />
            </LexicalComposer>
            <AIInlineTools
              onAction={handleAIAction}
              visible={aiToolsVisible}
              position={aiToolsPosition}
              selectedText={selectedText}
              onClose={() => setAIToolsVisible(false)}
            />
          </CollapsibleCard>
          {/* SEO, Stats, Fixes Section */}
          <CollapsibleCard title="SEO & Blog Stats" section="seo" className="mt-6">
            <SidebarPanels />
          </CollapsibleCard>
          {/* Comments Section */}
          <CollapsibleCard title="Comments" section="comments" className="mt-6">
            <CommentSidebar comments={comments} onDelete={handleDeleteComment} />
          </CollapsibleCard>
        </div>
        {/* Optimize CTA */}
        <OptimizeCTA enabled={optimizeEnabled} onClick={handleOptimize} />
      </main>
      {/* Outline Panel (right) */}
      <div className="w-72 flex-shrink-0 flex items-start justify-center p-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md border p-6 min-w-[16rem] max-w-xs w-full">
          <OutlinePanel 
            headings={outline} 
            onJumpToSection={(id) => {
              // Implement jump to section logic
              const element = document.getElementById(id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }} 
          />
        </div>
      </div>
      {/* Version History Modal */}
      <VersionHistoryModal
        open={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        versions={versions}
        onRestore={handleRestoreVersion}
      />
    </div>
  );
} 