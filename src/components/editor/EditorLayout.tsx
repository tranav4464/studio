import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { GripVertical, SidebarOpen, SidebarClose, PanelRightClose, PanelRightOpen, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorLayoutProps {
  leftPanel?: ReactNode;
  centerPanel: ReactNode;
  rightPanel?: ReactNode;
  className?: string;
}

export function EditorLayout({ leftPanel, centerPanel, rightPanel, className }: EditorLayoutProps) {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleLeftPanel = () => setIsLeftPanelOpen(!isLeftPanelOpen);
  const toggleRightPanel = () => setIsRightPanelOpen(!isRightPanelOpen);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-screen bg-background", className)}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-2 border-b">
          <Button variant="ghost" size="icon" onClick={toggleLeftPanel}>
            {isLeftPanelOpen ? <SidebarClose className="h-5 w-5" /> : <SidebarOpen className="h-5 w-5" />}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleRightPanel}>
              {isRightPanelOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {isLeftPanelOpen && (
            <div className="h-1/3 border-b overflow-auto">
              {leftPanel}
            </div>
          )}
          <div className="h-full overflow-auto">
            {centerPanel}
          </div>
          {isRightPanelOpen && (
            <div className="h-1/3 border-t overflow-auto">
              {rightPanel}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-screen bg-background", className)}>
      {/* Desktop Layout */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Center Panel */}
        <Panel defaultSize={isRightPanelOpen ? 75 : 100} minSize={30} className="flex flex-col">
          <div className="p-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isRightPanelOpen && (
                <Button variant="ghost" size="icon" onClick={toggleRightPanel} className="h-8 w-8">
                  <PanelRightOpen className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8">
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex justify-center">
            <div className="w-full max-w-4xl px-4 py-8">
              {centerPanel}
            </div>
          </div>
        </Panel>

        {/* Right Panel - Outline */}
        {isRightPanelOpen && rightPanel && (
          <>
            <PanelResizeHandle className="w-2 group hover:bg-blue-500/20 transition-colors">
              <div className="h-full flex items-center justify-center">
                <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-blue-500" />
              </div>
            </PanelResizeHandle>
            <Panel defaultSize={25} minSize={15} maxSize={35} className="flex flex-col border-l">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Document Outline</h3>
                <Button variant="ghost" size="icon" onClick={toggleRightPanel} className="h-8 w-8">
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                {rightPanel}
              </div>
            </Panel>
          </>
        )}

        {!isRightPanelOpen && (
          <div className="flex items-center border-l">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleRightPanel}
              className="h-12 w-6 rounded-l-none border-l"
            >
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
      </PanelGroup>
    </div>
  );
}
