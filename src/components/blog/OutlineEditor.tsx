import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface OutlineSection {
  id: string;
  title: string;
  description: string;
}

interface OutlineEditorProps {
  initialOutline: OutlineSection[];
  onOutlineChange: (outline: OutlineSection[]) => void;
  onGenerateBlog: () => void;
}

export function OutlineEditor({ initialOutline, onOutlineChange, onGenerateBlog }: OutlineEditorProps) {
  const [sections, setSections] = useState<OutlineSection[]>(initialOutline);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);
    onOutlineChange(items);
  };

  const addSection = () => {
    const newSection: OutlineSection = {
      id: `section-${Date.now()}`,
      title: '',
      description: '',
    };
    const newSections = [...sections, newSection];
    setSections(newSections);
    onOutlineChange(newSections);
  };

  const removeSection = (id: string) => {
    const newSections = sections.filter(section => section.id !== id);
    setSections(newSections);
    onOutlineChange(newSections);
  };

  const updateSection = (id: string, field: keyof OutlineSection, value: string) => {
    const newSections = sections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    );
    setSections(newSections);
    onOutlineChange(newSections);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Blog Outline</CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="outline">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="p-4 border rounded-lg bg-card"
                      >
                        <div className="flex items-start gap-4">
                          <div {...provided.dragHandleProps} className="mt-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <Input
                              placeholder="Section Title"
                              value={section.title}
                              onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                            />
                            <Textarea
                              placeholder="Section Description"
                              value={section.description}
                              onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSection(section.id)}
                            className="mt-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            onClick={addSection}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
          <Button
            onClick={onGenerateBlog}
            className="flex-1"
          >
            Generate Full Blog
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 