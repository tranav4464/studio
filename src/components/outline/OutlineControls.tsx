import { Button } from "@/components/ui/button";
import { History, Plus, RefreshCw } from "lucide-react";

interface OutlineControlsProps {
  onGenerate: () => void;
  onAddSection: () => void;
  onExport: (format: 'txt' | 'md' | 'json') => void;
  versions: any[];
  currentVersion: number;
  onSwitchVersion: (index: number) => void;
  loading: boolean;
}

export function OutlineControls({
  onGenerate,
  onAddSection,
  onExport,
  versions,
  currentVersion,
  onSwitchVersion,
  loading
}: OutlineControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onGenerate} 
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : 'Regenerate'}
          </Button>
          <Button variant="outline" size="sm" onClick={onAddSection}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Export:</span>
          <Button variant="outline" size="sm" onClick={() => onExport('txt')} title="Export as TXT">
            📄 TXT
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('md')} title="Export as Markdown">
            📝 MD
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('json')} title="Export as JSON">
            🔢 JSON
          </Button>
        </div>
      </div>

      {versions.length > 1 && (
        <div className="flex items-center gap-2 bg-accent/50 rounded-md px-3 py-1">
          <History className="h-4 w-4 text-muted-foreground" />
          <select
            className="bg-transparent text-sm outline-none cursor-pointer"
            value={currentVersion}
            onChange={(e) => onSwitchVersion(Number(e.target.value))}
            aria-label="Select outline version"
          >
            {versions.map((_, idx) => (
              <option key={idx} value={idx}>
                {idx === 0 ? 'Current' : `Version ${versions.length - idx}`} {idx === 0 ? '(Latest)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
