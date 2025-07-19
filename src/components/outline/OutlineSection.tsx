import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Trash2 } from "lucide-react";
import { ChangeEvent } from "react";

interface OutlineSectionProps {
  section: {
    title: string;
    content: string;
    tag?: string;
    length?: 'short' | 'medium' | 'long';
  };
  index: number;
  onEdit: (index: number, field: string, value: string) => void;
  onRegenerate: (index: number) => void;
  onDelete: (index: number) => void;
  loading: boolean;
  dragHandleProps: any;
}

export function OutlineSection({
  section,
  index,
  onEdit,
  onRegenerate,
  onDelete,
  loading,
  dragHandleProps
}: OutlineSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div {...dragHandleProps} className="cursor-move">
          <Label>Section {index + 1}</Label>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onRegenerate(index)}
            disabled={loading}
            aria-label="Regenerate section"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(index)}
            disabled={loading}
            aria-label="Delete section"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Input
        id={`title-${index}`}
        value={section.title}
        onChange={(e) => onEdit(index, 'title', e.target.value)}
        placeholder="Section title"
      />
      <div className="flex gap-2">
        <Input 
          placeholder="Section tag" 
          className="flex-1"
          value={section.tag || ''}
          onChange={(e) => onEdit(index, 'tag', e.target.value)}
        />
        <select 
          className="border rounded px-2 text-sm"
          value={section.length || 'medium'}
          onChange={(e) => onEdit(index, 'length', e.target.value as any)}
        >
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </div>
      <Textarea
        value={section.content}
        onChange={(e) => onEdit(index, 'content', e.target.value)}
        placeholder="Section content"
        className="min-h-[100px]"
      />
    </div>
  );
}
