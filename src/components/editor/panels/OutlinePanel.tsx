import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GripVertical, Plus, ChevronDown, ChevronRight, Hash, Text, Type, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Section {
  id: string;
  title: string;
  level: number;
  wordCount: number;
  children?: Section[];
}

interface OutlinePanelProps {
  sections: Section[];
  activeSectionId?: string;
  onSectionSelect?: (id: string) => void;
  onSectionAdd?: (parentId?: string) => void;
  onSectionMove?: (id: string, direction: 'up' | 'down') => void;
  className?: string;
}

export function OutlinePanel({
  sections,
  activeSectionId,
  onSectionSelect,
  onSectionAdd,
  onSectionMove,
  className,
}: OutlinePanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedSEO, setExpandedSEO] = useState(true);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderSection = (section: Section, index: number, level = 0) => {
    const isExpanded = expandedSections[section.id] ?? true;
    const isActive = activeSectionId === section.id;
    const hasChildren = section.children && section.children.length > 0;

    return (
      <div key={section.id} className="space-y-1">
        <div 
          className={cn(
            "flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors group",
            isActive ? "bg-accent/80 font-medium" : "hover:bg-accent/30"
          )}
          onClick={() => onSectionSelect?.(section.id)}
          style={{ 
            paddingLeft: `${level * 16 + (hasChildren ? 4 : 20)}px`,
            marginLeft: level > 0 ? '4px' : '0',
            borderLeft: level > 0 ? '1px dashed hsl(var(--border))' : 'none'
          }}
        >
          <div className="flex items-center gap-1.5">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -ml-1 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection(section.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </Button>
            ) : (
              <span className="text-muted-foreground opacity-60 group-hover:opacity-100">
                {getSectionIcon(level + 1)}
              </span>
            )}
          </div>
          <span className="truncate flex-1 text-sm">{section.title}</span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {section.wordCount}
          </span>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {section.children?.map((child, idx) => 
              renderSection(child, idx, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const getSectionIcon = (level: number) => {
    switch (level) {
      case 1: return <Type className="h-3.5 w-3.5 text-blue-500" />;
      case 2: return <Text className="h-3 w-3 text-green-500 ml-0.5" />;
      default: return <Hash className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="px-4 py-3 border-b flex justify-between items-center bg-muted/30">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">DOCUMENT OUTLINE</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onSectionAdd?.()}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Section
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="py-2 pr-2">
          {sections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm px-4">
              <p>No sections yet</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-xs h-8"
                onClick={() => onSectionAdd?.()}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add First Section
              </Button>
            </div>
          ) : (
            sections.map((section, index) => (
              <div key={section.id}>
                {renderSection(section, index)}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t">
        <div 
          className="p-3 font-medium flex items-center cursor-pointer hover:bg-accent"
          onClick={() => setExpandedSEO(!expandedSEO)}
        >
          <ListChecks className="h-4 w-4 mr-2" />
          <span>SEO Checklist</span>
          {expandedSEO ? (
            <ChevronDown className="ml-auto h-4 w-4" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4" />
          )}
        </div>
        
        {expandedSEO && (
          <div className="p-3 pt-0 space-y-2">
            <div className="flex items-center text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span>Title contains focus keyword</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
              <span>Meta description could be improved</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
              <span>Add internal links (recommended: 2-3)</span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2">
              Fix All Issues
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
