import React, { useState, useRef } from "react";
import { useEditor, EditorContent, BubbleMenu, FloatingMenu, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { GripVertical, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import { Node, mergeAttributes } from '@tiptap/core';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

// Types for SectionView props
interface SectionViewProps {
  node: any;
  getPos: () => number;
  editor: any;
}

const Section = Node.create({
  name: 'section',
  group: 'block',
  content: 'heading block*',
  draggable: true,
  parseHTML() {
    return [
      { tag: 'section' },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['section', mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(SectionView);
  },
});

function SectionView({ node, getPos, editor }: SectionViewProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [headingValue, setHeadingValue] = useState(node.firstChild?.textContent || "Section");
  const inputRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: getPos() });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    marginBottom: 8,
    background: '#fff',
  };

  // Move section up/down
  const moveSection = (direction: 'up' | 'down') => {
    const pos = getPos();
    const sectionNode = editor.state.doc.nodeAt(pos);
    if (!sectionNode) return;
    const tr = editor.state.tr;
    const parent = editor.state.doc;
    let index = 0;
    let found = false;
    parent.forEach((childNode: any, offset: number) => {
      if (offset === pos) found = true;
      if (!found) index++;
    });
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= parent.childCount) return;
    const newPos = parent.child(newIndex).content.findDiffStart(sectionNode.content);
    if (newPos === null) return;
    tr.delete(pos, pos + sectionNode.nodeSize);
    tr.insert(parent.child(newIndex).pos, sectionNode);
    editor.view.dispatch(tr);
  };

  // Delete section
  const deleteSection = () => {
    const pos = getPos();
    const sectionNode = editor.state.doc.nodeAt(pos);
    if (!sectionNode) return;
    editor.chain().focus().deleteRange({ from: pos, to: pos + sectionNode.nodeSize }).run();
  };

  // Rename section
  const handleRename = () => {
    setRenaming(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pos = getPos();
    const sectionNode = editor.state.doc.nodeAt(pos);
    if (!sectionNode) return;
    const heading = sectionNode.firstChild;
    if (!heading) return;
    const tr = editor.state.tr;
    tr.insertText(headingValue, pos + 1, pos + 1 + heading.nodeSize - 2);
    editor.view.dispatch(tr);
    setRenaming(false);
  };

  return (
    <NodeViewWrapper ref={setNodeRef} style={style}>
      <div className="flex items-center px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-t">
        <span {...listeners} className="cursor-grab mr-2"><GripVertical size={16} /></span>
        <button onClick={() => setCollapsed(c => !c)} className="mr-2">
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
        {renaming ? (
          <form onSubmit={handleRenameSubmit} className="flex-1">
            <input
              ref={inputRef}
              value={headingValue}
              onChange={e => setHeadingValue(e.target.value)}
              onBlur={handleRenameSubmit}
              className="font-semibold bg-transparent border-b border-zinc-400 outline-none w-full"
            />
          </form>
        ) : (
          <span className="font-semibold flex-1">{node.firstChild?.textContent || 'Section'}</span>
        )}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="ml-2"><MoreVertical size={16} /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleRename}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => moveSection('up')}>Move Up</DropdownMenuItem>
            <DropdownMenuItem onClick={() => moveSection('down')}>Move Down</DropdownMenuItem>
            <DropdownMenuItem onClick={deleteSection} className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {!collapsed && <div className="p-2"><NodeViewWrapper as="div" className="section-content" contentEditable /></div>}
    </NodeViewWrapper>
  );
}

interface HeroImage {
  id: string;
  url: string;
  caption: string;
  altText: string;
}

interface BlogEditorProps {
  content?: string;
  title?: string;
  onSave?: (content: string, heroImage?: HeroImage) => Promise<void>;
  isLoading?: boolean;
}

export default function BlogEditor({ content: initialContent, title, onSave, isLoading }: BlogEditorProps) {
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your blog...",
      }),
      Section,
    ],
    content: initialContent || `<section><h2>Introduction</h2><p></p></section><section><h2>Body</h2><p></p></section>`,
    autofocus: true,
    editable: true,
  });

  // Helper: get all section node positions
  const getSectionPositions = () => {
    const positions: number[] = [];
    if (!editor) return positions;
    editor.state.doc.forEach((node, pos) => {
      if (node.type.name === 'section') {
        positions.push(pos);
      }
    });
    return positions;
  };

  // DnD: handle drag end
  const handleDragEnd = (event: any) => {
    if (!editor) return;
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    const sectionPositions = getSectionPositions();
    const fromIndex = sectionPositions.findIndex(pos => pos === active.id);
    const toIndex = sectionPositions.findIndex(pos => pos === over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    // Move section node in TipTap doc
    const fromPos = sectionPositions[fromIndex];
    const toPos = sectionPositions[toIndex];
    const sectionNode = editor.state.doc.nodeAt(fromPos);
    if (!sectionNode) return;
    let tr = editor.state.tr.delete(fromPos, fromPos + sectionNode.nodeSize);
    // If moving down, toPos will shift after delete
    const insertPos = fromIndex < toIndex ? toPos - sectionNode.nodeSize : toPos;
    tr = tr.insert(insertPos, sectionNode);
    editor.view.dispatch(tr);
  };

  return (
    <div className="relative w-full h-full">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-1 bg-white dark:bg-zinc-900 border rounded shadow p-1">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'font-bold' : ''}>B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'italic' : ''}>I</button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'line-through' : ''}>S</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'underline' : ''}>H2</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'underline' : ''}>H3</button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</button>
            <button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</button>
          </div>
        </BubbleMenu>
      )}
      {editor && (
        <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-1 bg-white dark:bg-zinc-900 border rounded shadow p-1">
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Section (H2)</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>Subsection (H3)</button>
          </div>
        </FloatingMenu>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <EditorContent editor={editor} className="prose dark:prose-invert min-h-[400px]" />
      </DndContext>
    </div>
  );
} 