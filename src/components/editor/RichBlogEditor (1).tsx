// Ensure you have installed 'slate', 'slate-react', and 'slate-history' and that your custom slate.d.ts only augments types.
import React, { useMemo, useState, useCallback } from 'react';
import {
  createEditor,
  Editor,
  Transforms,
  Node,
  Path,
  Range,
  Element as SlateElement
} from 'slate';
import { Editable, Slate, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import type { CustomElement, CustomText, CustomEditor } from './types';
import { LIST_TYPES, LIST_ITEM_TYPES, ALIGN_TYPES } from './types';
import {
  Bold, Italic, Underline, Code2, List, ListOrdered, CheckSquare, Undo2, Redo2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as Image2, Video, Quote, Code as CodeIcon, Minus, ArrowRight, Table, Link2 as LinkIcon
} from 'lucide-react';

// Fallback for cn utility
const cn = (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ');

const RichBlogEditor: React.FC<{
  initialContent?: string;
  onUpdate?: (content: string) => void;
  className?: string;
}> = ({ initialContent = '', onUpdate, className }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor() as CustomEditor)), []);

  const [value, setValue] = useState<CustomElement[]>(() => {
    try {
      return initialContent ? JSON.parse(initialContent) : [
        { type: 'paragraph', children: [{ text: '' }] },
      ];
    } catch {
      return [{ type: 'paragraph', children: [{ text: '' }] }];
    }
  });
  const [activeTab, setActiveTab] = useState<'home' | 'insert'>('home');

  // Mark helpers
  const isMarkActive = (format: keyof Omit<CustomText, 'text'>) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };
  const toggleMark = (format: keyof Omit<CustomText, 'text'>) => {
    const isActive = isMarkActive(format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  // Block helpers
  const isBlockActive = (type: CustomElement['type']) => {
    const [match] = Editor.nodes(editor, {
      match: (n: any) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type,
    });
    return !!match;
  };
  const toggleBlock = (type: CustomElement['type']) => {
    const isActive = isBlockActive(type);
    if (LIST_TYPES.includes(type as any)) {
      Transforms.unwrapNodes(editor, {
        match: (n: any) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          LIST_TYPES.includes(n.type as any),
        split: true,
      });
      const newType = isActive ? 'paragraph' : type === 'checklist' ? 'check-list-item' : 'list-item';
      Transforms.setNodes(editor, { type: newType } as any);
      if (!isActive) {
        const block = { type, children: [] } as any;
        Transforms.wrapNodes(editor, block);
      }
    } else {
      Transforms.setNodes(editor, { type: isActive ? 'paragraph' : type } as any);
    }
  };

  // Insert elements
  const insertElement = (type: CustomElement['type']) => {
    const { selection } = editor;
    if (!selection) return;
    const isCollapsed = Range.isCollapsed(selection);
    switch (type) {
      case 'code': {
        const codeBlock = { type: 'code' as const, children: [{ text: '' }] as CustomText[] };
        Transforms.insertNodes(editor, codeBlock);
        break;
      }
      case 'blockquote': {
        const quote = { type: 'blockquote', children: [{ text: '' }] } as CustomElement;
        Transforms.insertNodes(editor, quote);
        break;
      }
      case 'divider': {
        const divider = { type: 'divider' as const, children: [{ text: '' }] as CustomText[] };
        Transforms.insertNodes(editor, divider);
        break;
      }
      case 'table': {
        const table = {
          type: 'table' as const,
          children: [
            {
              type: 'table-row' as const,
              children: [
                { type: 'table-cell' as const, children: [{ text: '' }] as CustomText[] },
                { type: 'table-cell' as const, children: [{ text: '' }] as CustomText[] },
              ],
            },
            {
              type: 'table-row' as const,
              children: [
                { type: 'table-cell' as const, children: [{ text: '' }] as CustomText[] },
                { type: 'table-cell' as const, children: [{ text: '' }] as CustomText[] },
              ],
            },
          ],
        };
        Transforms.insertNodes(editor, table);
        break;
      }
      case 'image': {
        const url = window.prompt('Enter the image URL:');
        if (!url) return;
        const image = { type: 'image' as const, url, children: [{ text: '' }] as CustomText[] };
        Transforms.insertNodes(editor, image);
        break;
      }
      case 'video': {
        const url = window.prompt('Enter the video URL:');
        if (!url) return;
        const video = { type: 'video' as const, url, children: [{ text: '' }] as CustomText[] };
        Transforms.insertNodes(editor, video);
        break;
      }
      case 'link': {
        const url = window.prompt('Enter the link URL:');
        if (!url) return;
        if (isCollapsed) {
          Transforms.insertText(editor, url);
        } else {
          Transforms.wrapNodes(
            editor,
            { type: 'link' as const, url, children: [{ text: '' }] as CustomText[] },
            { split: true, at: selection }
          );
        }
        break;
      }
      default:
        break;
    }
  };

  // Alignment (stub, for UI only)
  const toggleBlockAlignment = (align: typeof ALIGN_TYPES[number]) => {
    // This is a stub for UI highlight only; real alignment logic can be added as needed
  };

  // Renderers
  const renderElement = useCallback(({ attributes, children, element }: any) => {
    switch (element.type) {
      case 'bulleted-list':
        return <ul {...attributes} style={{ paddingLeft: 24 }}>{children}</ul>;
      case 'numbered-list':
        return <ol {...attributes} style={{ paddingLeft: 24 }}>{children}</ol>;
      case 'checklist':
        return <ul {...attributes} style={{ paddingLeft: 24 }}>{children}</ul>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'check-list-item':
        return (
          <li {...attributes} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={!!element.checked}
              onChange={e => {
                const path = ReactEditor.findPath(editor, element);
                Transforms.setNodes(editor, { checked: e.target.checked }, { at: path });
              }}
              style={{ marginRight: 8 }}
            />
            <span>{children}</span>
          </li>
        );
      case 'divider':
        return <hr {...attributes} className="my-4 border-t" />;
      case 'code':
        return <pre {...attributes} className="bg-gray-100 rounded p-2"><code>{children}</code></pre>;
      case 'image':
        return <img {...attributes} src={element.url} alt="" style={{ maxWidth: '100%', borderRadius: 8 }} />;
      case 'video':
        return <video {...attributes} src={element.url} controls style={{ maxWidth: '100%', borderRadius: 8 }} />;
      case 'link':
        return <a {...attributes} href={element.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{children}</a>;
      case 'table':
        return <table {...attributes} className="my-4 w-full border" style={{ tableLayout: 'fixed', width: '100%' }}>{children}</table>;
      case 'table-row':
        return <tr {...attributes}>{children}</tr>;
      case 'table-cell':
        return <td {...attributes} className="border px-2 py-1 align-top">{children}</td>;
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, [editor]);

  const renderLeaf = useCallback(({ attributes, children, leaf }: any) => {
    if (leaf.bold) children = <strong>{children}</strong>;
    if (leaf.italic) children = <em>{children}</em>;
    if (leaf.underline) children = <u>{children}</u>;
    if (leaf.code) children = <code style={{ background: '#f4f4f4', borderRadius: 4, padding: '0 4px' }}>{children}</code>;
    return <span {...attributes}>{children}</span>;
  }, []);

  // Key handling
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { selection } = editor;
    if (!selection) return;
    if (event.key === 'Backspace') {
      if (Range.isCollapsed(selection)) {
        const [node, path] = Editor.node(editor, selection);
        if (
          SlateElement.isElement(node) &&
          (node.type === 'list-item' || node.type === 'check-list-item') &&
          Node.string(node).trim() === ''
        ) {
          event.preventDefault();
          Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
          return;
        }
      }
    }
    if (event.key === 'Enter') {
      if (Range.isCollapsed(selection)) {
        const [node, path] = Editor.node(editor, selection);
        if (SlateElement.isElement(node) && (node.type === 'list-item' || node.type === 'check-list-item')) {
          const text = Node.string(node);
          if (text.trim() === '') {
            event.preventDefault();
            Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
            return;
          }
          if (selection.anchor.offset === text.length) {
            event.preventDefault();
            if (node.type === 'check-list-item') {
              const newItem: any = { type: 'check-list-item', children: [{ text: '' }], checked: false };
              Transforms.insertNodes(editor, newItem, { at: Path.next(path) });
              Transforms.select(editor, { path: [...Path.next(path), 0], offset: 0 });
              return;
            } else if (node.type === 'list-item') {
              const newItem: any = { type: 'list-item', children: [{ text: '' }] };
              Transforms.insertNodes(editor, newItem, { at: Path.next(path) });
              Transforms.select(editor, { path: [...Path.next(path), 0], offset: 0 });
              return;
            }
          }
        }
      }
    }
  };

  // Update callback
  const handleChange = (newValue: CustomElement[]) => {
    setValue(newValue);
    if (onUpdate) onUpdate(JSON.stringify(newValue));
  };

  // Toolbar styles
  const buttonBase = 'p-1.5 mx-0.5 rounded transition-colors duration-200';
  const buttonHover = 'hover:bg-[#FFC107]';
  const buttonActive = 'active:bg-[#1C8C8C] active:text-white';
  const buttonActiveState = 'bg-[#1C8C8C] text-white';
  const toolbarGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0', // Removed gap to prevent affecting divider width
    padding: '2px',
    borderRadius: '4px',
    margin: '0 -1px', // Compensate for the gap removal
  };
  const dividerStyle = {
    width: '2px',
    height: '24px',
    background: '#1C8C8C',
    margin: '0 6px',
    flexShrink: 0, // Prevent the divider from shrinking
  };

  // Toolbar and tab design


  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>

      {/* Tabs */}
      <div style={{ padding: '8px 16px', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: '4px', padding: '2px', borderRadius: '6px', width: 'fit-content' }}>
          <button
            style={{
              padding: '6px 20px',
              border: 'none',
              background: activeTab === 'home' ? '#1C8C8C' : 'transparent',
              color: activeTab === 'home' ? 'white' : '#64748b',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            style={{
              padding: '6px 20px',
              border: 'none',
              background: activeTab === 'insert' ? '#1C8C8C' : 'transparent',
              color: activeTab === 'insert' ? 'white' : '#64748b',
              fontWeight: 500,
              fontSize: '14px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => setActiveTab('insert')}
          >
            Insert
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {activeTab === 'home' && (
            <>
              {/* Text Formatting Group */}
              <div style={toolbarGroupStyle}>
                <button 
                  className={cn(buttonBase, buttonHover, buttonActive, isMarkActive('bold') && buttonActiveState)} 
                  onMouseDown={e => { e.preventDefault(); toggleMark('bold'); }} 
                  title="Bold"
                >
                  <Bold size={20} />
                </button>
                <button 
                  className={cn(buttonBase, buttonHover, buttonActive, isMarkActive('italic') && buttonActiveState)} 
                  onMouseDown={e => { e.preventDefault(); toggleMark('italic'); }} 
                  title="Italic"
                >
                  <Italic size={20} />
                </button>
                <button 
                  className={cn(buttonBase, buttonHover, buttonActive, isMarkActive('underline') && buttonActiveState)} 
                  onMouseDown={e => { e.preventDefault(); toggleMark('underline'); }} 
                  title="Underline"
                >
                  <Underline size={20} />
                </button>
              </div>

              {/* Divider */}
              <div style={dividerStyle}></div>

              {/* Alignment Group */}
              <div style={toolbarGroupStyle}>
                <button className={cn(buttonBase, buttonHover, buttonActive)} title="Align Left">
                  <AlignLeft size={20} />
                </button>
                <button className={cn(buttonBase, buttonHover, buttonActive)} title="Align Center">
                  <AlignCenter size={20} />
                </button>
                <button className={cn(buttonBase, buttonHover, buttonActive)} title="Align Right">
                  <AlignRight size={20} />
                </button>
                <button className={cn(buttonBase, buttonHover, buttonActive)} title="Align Justify">
                  <AlignJustify size={20} />
                </button>
              </div>

              {/* Divider */}
              <div style={dividerStyle}></div>

              {/* List Group */}
              <div style={toolbarGroupStyle}>
                <button 
                  className={cn(buttonBase, buttonHover, buttonActive, isBlockActive('bulleted-list') && buttonActiveState)} 
                  onMouseDown={e => { e.preventDefault(); toggleBlock('bulleted-list'); }} 
                  title="Bulleted List"
                >
                  <List size={20} />
                </button>
                <button 
                  className={cn(buttonBase, buttonHover, buttonActive, isBlockActive('numbered-list') && buttonActiveState)} 
                  onMouseDown={e => { e.preventDefault(); toggleBlock('numbered-list'); }} 
                  title="Numbered List"
                >
                  <ListOrdered size={20} />
                </button>
                <button 
                  className={cn(buttonBase, buttonHover, buttonActive, isBlockActive('checklist') && buttonActiveState)} 
                  onMouseDown={e => { e.preventDefault(); toggleBlock('checklist'); }} 
                  title="Checklist"
                >
                  <CheckSquare size={20} />
                </button>
              </div>
            </>
          )}

          {activeTab === 'insert' && (
            <>
              {/* Media Group */}
              <div style={toolbarGroupStyle}>
                <button className={cn(buttonBase, buttonHover, buttonActive)} onMouseDown={e => { e.preventDefault(); insertElement('image'); }} title="Insert Image">
                  <Image2 size={20} />
                </button>
                <button className={cn(buttonBase, buttonHover, buttonActive)} onMouseDown={e => { e.preventDefault(); insertElement('video'); }} title="Insert Video">
                  <Video size={20} />
                </button>
              </div>

              {/* Divider */}
              <div style={dividerStyle}></div>

              {/* Content Group */}
              <div style={toolbarGroupStyle}>
                <button className={cn(buttonBase, buttonHover, buttonActive)} onMouseDown={e => { e.preventDefault(); insertElement('link'); }} title="Insert Link">
                  <LinkIcon size={20} />
                </button>
                <button className={cn(buttonBase, buttonHover, buttonActive)} onMouseDown={e => { e.preventDefault(); insertElement('table'); }} title="Insert Table">
                  <Table size={20} />
                </button>
              </div>

              {/* Divider */}
              <div style={dividerStyle}></div>

              {/* Formatting Group */}
              <div style={toolbarGroupStyle}>
                <button className={cn(buttonBase, buttonHover, buttonActive)} onMouseDown={e => { e.preventDefault(); insertElement('blockquote'); }} title="Insert Blockquote">
                  <Quote size={20} />
                </button>
                <button className={cn(buttonBase, buttonHover, buttonActive)} onMouseDown={e => { e.preventDefault(); insertElement('code'); }} title="Insert Code Block">
                  <Code2 size={20} />
                </button>
                <button className={cn(buttonBase, buttonHover, buttonActive)} onMouseDown={e => { e.preventDefault(); insertElement('divider'); }} title="Insert Divider">
                  <Minus size={20} />
                </button>
              </div>

              {/* Divider */}
              <div style={dividerStyle}></div>

              {/* Action Group */}
              <div style={toolbarGroupStyle}>
                <button className={cn(buttonBase, buttonHover, buttonActive)} title="Insert CTA">
                  <ArrowRight size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Slate 
        editor={editor} 
        initialValue={value as unknown as any[]} 
        onChange={(v: any) => handleChange(v as CustomElement[])}
      >
        <div style={{ padding: '16px' }}>
          <Editable
            className="min-h-[200px] p-8 focus:outline-none"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder="Start writing your blog post..."
            autoFocus
          />
        </div>
      </Slate>
    </div>
  );
};

export default RichBlogEditor;  