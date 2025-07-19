'use client';

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { createEditor, Descendant, Transforms, Editor, Text, BaseEditor, BaseText, Element as SlateElement, Node, Range, Path } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { 
  Bold, Italic, Underline, Code2, List, ListOrdered, CheckSquare, Undo2, Redo2, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as Image2, 
  Video, Quote, Code as CodeIcon, Minus, ArrowRight, Table, Link2 as LinkIcon, ClipboardCopy, Trash2, Plus
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// ... (SyntaxHighlighter dynamic import and theme setup, as before)

type MarkFormat = 'bold' | 'italic' | 'underline' | 'code' | 'fontSize' | 'list' | 'check-list-item' | 'align-left' | 'align-center' | 'align-right' | 'align-justify' | 'undo' | 'redo';

interface CustomText extends BaseText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  fontSize?: number;
}

interface TableCellElement {
  type: 'table-cell';
  children: CustomText[];
  align?: string;
}

interface TableRowElement {
  type: 'table-row';
  children: TableCellElement[];
  align?: string;
}

interface TableElement {
  type: 'table';
  children: TableRowElement[];
  align?: string;
}

type CustomElement = 
  | { type: 'paragraph'; children: CustomText[]; align?: string }
  | { type: 'quote'; children: CustomText[]; align?: string }
  | { type: 'code'; children: CustomText[]; language?: string; align?: string }
  | { type: 'divider'; children: CustomText[]; align?: string }
  | { type: 'cta'; text: string; url: string; children: CustomText[]; align?: string }
  | { type: 'image'; url: string; alt?: string; children: CustomText[]; align?: string }
  | { type: 'video'; url: string; children: CustomText[]; align?: string }
  | { type: 'link'; url: string; children: CustomText[] }
  | { type: 'list-item'; children: CustomText[] }
  | { type: 'bulleted-list'; children: CustomElement[] }
  | { type: 'numbered-list'; children: CustomElement[] }
  | { type: 'checklist'; children: CustomElement[] }
  | { type: 'check-list-item'; children: CustomText[]; checked?: boolean }
  | TableElement
  | TableRowElement
  | TableCellElement;

// Check if a mark is active in the current selection
const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format as keyof typeof marks] === true : false;
};

// Toggle a mark on the current selection
const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);
  
  // Make sure there's a selection
  const { selection } = editor;
  if (!selection) return;

  // If the selection is collapsed, apply the mark to the current word
  if (Range.isCollapsed(selection)) {
    const wordRange = Editor.range(editor, selection.anchor);
    Transforms.select(editor, wordRange);
  }

  // Toggle the mark
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }

  // Refocus the editor to maintain selection
  ReactEditor.focus(editor);
};

// Toggle a block type
const toggleBlock = (editor: Editor, type: string) => {
  const isActive = isBlockActive(editor, type);
  const isList = ['bulleted-list', 'numbered-list', 'checklist'].includes(type);
  const isListItem = ['list-item', 'check-list-item'].includes(type);

  // Clear any existing formatting first
  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ['bulleted-list', 'numbered-list', 'checklist', 'list-item', 'check-list-item'].includes(n.type as string),
    split: true,
  });

  if (isList) {
    // For list types, wrap the selected block in a list container and convert to list items
    Transforms.setNodes(editor, {
      type: (type === 'checklist' ? 'check-list-item' : 'list-item') as any,
    });
    const block = { type, children: [{ text: '' }] } as CustomElement;
    Transforms.wrapNodes(editor, block);
  } else if (isListItem) {
    // For list items, convert to paragraph
    Transforms.setNodes(editor, { type: 'paragraph' } as any);
  } else {
    // For other block types, toggle the type
    Transforms.setNodes(editor, {
      type: (isActive ? 'paragraph' : type) as any,
    });
  }
};

// Check if a block type is active
const isBlockActive = (editor: Editor, type: string): boolean => {
  const [match] = Editor.nodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type,
  });
  return !!match;
};

// Types for elements that support alignment
type AlignableElement = 
  | { type: 'paragraph', children: CustomText[], align?: string }
  | { type: 'quote', children: CustomText[], align?: string }
  | { type: 'code', children: CustomText[], language?: string, align?: string }
  | { type: 'divider', children: CustomText[], align?: string }
  | { type: 'cta', text: string, url: string, children: CustomText[], align?: string }
  | { type: 'image', url: string, alt?: string, children: CustomText[], align?: string }
  | { type: 'video', url: string, children: CustomText[], align?: string };

// Set block alignment
const setBlockAlign = (editor: Editor, align: string) => {
  const { selection } = editor;
  if (!selection) return;

  const [match] = Editor.nodes<AlignableElement>(editor, {
    match: n => {
      if (Editor.isEditor(n) || !SlateElement.isElement(n)) return false;
      const element = n as AlignableElement;
      return [
        'paragraph',
        'quote',
        'code',
        'divider',
        'cta',
        'image',
        'video'
      ].includes(element.type);
    },
  });

  if (match) {
    const [node, path] = match;
    const newProperties: Partial<AlignableElement> = {
      align: node.align === align ? undefined : align,
    };
    
    Transforms.setNodes(editor, newProperties, { at: path });
  }
};

const RichBlogEditor = ({
  initialContent = '',
  onUpdate,
  className,
  autoSaveDelay = 30000,
}: {
  initialContent?: string;
  onUpdate?: (content: string) => void;
  className?: string;
  autoSaveDelay?: number;
}) => {
  // State for editor marks is now handled by Slate internally

  // --- Editor setup with plugins ---
  const [editor] = useState(() => {
    const withLinks = (editor: Editor) => {
      const { normalizeNode } = editor;
      editor.normalizeNode = (entry) => {
        const [node, path] = entry;
        if (SlateElement.isElement(node) && node.type === 'link') {
          if (Node.string(node).length === 0) {
            Transforms.unwrapNodes(editor, { at: path });
            return;
          }
        }
        normalizeNode(entry);
      };
      return editor;
    };
    return withLinks(withHistory(withReact(createEditor() as BaseEditor & ReactEditor & {
      undo: () => void;
      redo: () => void;
    })));
  });

  // --- State ---
  const [value, setValue] = useState<Descendant[]>(() => {
    try {
      if (!initialContent) return [{ type: 'paragraph', children: [{ text: '' }] }];
      const parsed = JSON.parse(initialContent);
      return Array.isArray(parsed) ? parsed : [{ type: 'paragraph', children: [{ text: '' }] }];
    } catch {
      return [{ type: 'paragraph', children: [{ text: '' }] }];
    }
  });
  const [pendingMarks, setPendingMarks] = useState<{ [key: string]: boolean }>({});
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showCtaDialog, setShowCtaDialog] = useState(false);
  const [ctaText, setCtaText] = useState('Learn More');
  const [ctaUrl, setCtaUrl] = useState('');
  // ... (other state as needed)

  // --- Dialog handlers ---
  const openLinkDialog = () => {
    const { selection } = editor;
    let defaultText = '';
    if (selection) {
      const [node] = Editor.node(editor, selection);
      if (Text.isText(node)) defaultText = node.text;
    }
    setLinkText(defaultText);
    setLinkUrl('');
    setShowLinkDialog(true);
  };

  const handleLinkInsert = () => {
    if (!linkUrl) return;
    const { selection } = editor;
    if (!selection) return;
    const formatUrl = (url: string) => {
      if (!url) return '#';
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
      if (url.includes('@')) return `mailto:${url}`;
      return `https://${url}`;
    };
    const formattedUrl = formatUrl(linkUrl);
    const text = linkText || linkUrl;
    if (Range.isExpanded(selection)) {
      const link = { type: 'link', url: formattedUrl, children: [{ text }] };
      Transforms.wrapNodes(editor, link as any, { split: true });
      Transforms.collapse(editor, { edge: 'end' });
    } else {
      Transforms.insertNodes(editor, { type: 'link', url: formattedUrl, children: [{ text }] });
    }
    ReactEditor.focus(editor);
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleCodeInsert = () => {
    insertNode('code', { language: codeLanguage || 'javascript' });
    setShowCodeDialog(false);
    setCodeLanguage('javascript');
  };

  const handleVideoInsert = () => {
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.includes('youtube.com') 
        ? new URLSearchParams(new URL(videoUrl).search).get('v')
        : videoUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (videoUrl.includes('vimeo.com')) {
      const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
    }
    insertNode('video', { url: embedUrl });
    setShowVideoDialog(false);
    setVideoUrl('');
  };

  const handleCtaInsert = () => {
    insertNode('cta', { text: ctaText || 'Learn More', url: ctaUrl || '#', children: [{ text: '' }] });
    setShowCtaDialog(false);
    setCtaText('Learn More');
    setCtaUrl('');
  };

  // --- Insert node logic (table, code, quote, divider, etc.) ---
  const insertNode = (type: string, props: any = {}) => {
    if (type === 'table' && props.rows && props.cols) {
      const table: TableElement = {
        type: 'table',
        children: Array.from({ length: props.rows }, () => ({
          type: 'table-row',
          children: Array.from({ length: props.cols }, () => ({
            type: 'table-cell',
            children: [{ text: '' }],
          })),
        })),
      };
      Transforms.insertNodes(editor, table as any);
      // Add a paragraph below the table and move cursor there
      const [lastNodeEntry] = Editor.nodes(editor, {
        at: [],
        match: n => SlateElement.isElement(n) && n.type === 'table',
        reverse: true,
      });
      if (lastNodeEntry) {
        const [, blockPath] = lastNodeEntry;
        const after = Path.next(blockPath);
        Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] }, { at: after });
        Transforms.select(editor, after);
        ReactEditor.focus(editor);
      }
      return;
    }
    const node = {
      type,
      children: [{ text: '' }],
      ...(type === 'code' ? { language: 'javascript' } : {}),
      ...props
    };
    Transforms.insertNodes(editor, node as any);

    // For code, quote, divider: always add a paragraph below and move cursor there
    if (["code", "quote", "divider"].includes(type)) {
      const [lastNodeEntry] = Editor.nodes(editor, {
        at: [],
        match: n => SlateElement.isElement(n) && n.type === type,
        reverse: true,
      });
      if (lastNodeEntry) {
        const [, blockPath] = lastNodeEntry;
        const after = Path.next(blockPath);
        Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] }, { at: after });
        Transforms.select(editor, after);
        ReactEditor.focus(editor);
      }
    }
  };

  // --- renderElement ---
  const renderElement = useCallback(({ 
    attributes, 
    children, 
    element 
  }: { 
    attributes: any; 
    children: React.ReactNode; 
    element: CustomElement; 
  }) => {
    switch (element.type) {
      case 'bulleted-list':
        return <ul {...attributes} className="pl-6 list-disc">{children}</ul>;
      case 'numbered-list':
        return <ol {...attributes} className="pl-6 list-decimal">{children}</ol>;
      case 'list-item':
      case 'check-list-item':
        return <li {...attributes}>{children}</li>;
      case 'quote':
        return <blockquote {...attributes} className="border-l-4 pl-4 italic text-muted-foreground">{children}</blockquote>;
      case 'divider':
        return <hr {...attributes} className="my-4 border-t" />;
      case 'code': {
        // Extract code text from children
        const codeText = Node.string(element);
        const language = element.language || 'javascript';
        return (
          <div {...attributes} className="relative my-4 group">
            {/* Language label (non-editable) */}
            <span contentEditable={false} className="absolute top-2 right-12 text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded font-mono text-gray-600 dark:text-gray-300 z-10">
              {language}
            </span>
            {/* Copy button (non-editable) */}
            <button
              type="button"
              contentEditable={false}
              className="absolute top-2 right-2 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={() => navigator.clipboard.writeText(codeText)}
              tabIndex={-1}
            >
              Copy
            </button>
            {/* Optional: Syntax highlighted preview (non-editable, above editable area) */}
            <div contentEditable={false} className="mb-1">
              <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{ background: 'none', margin: 0, padding: 0 }}
                PreTag="div"
              >
                {codeText}
              </SyntaxHighlighter>
            </div>
            {/* Editable code area */}
            <pre className="bg-zinc-100 dark:bg-zinc-900 rounded p-3 overflow-x-auto min-h-[40px]">
              <code>{children}</code>
            </pre>
          </div>
        );
      }
      case 'image':
        return <div {...attributes} className="my-4"><img src={element.url} alt={element.alt || ''} className="max-w-full rounded shadow" /></div>;
      case 'table':
        return <table {...attributes} className="my-4 w-full border" style={{ tableLayout: 'fixed', width: '100%' }}>{children}</table>;
      case 'table-row':
        return <tr {...attributes}>{children}</tr>;
      case 'table-cell':
        return <td {...attributes} className="border px-2 py-1 align-top">{children}</td>;
      case 'link': {
        const formatUrl = (url: string) => {
          if (!url) return '#';
          if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
          if (url.includes('@')) return `mailto:${url}`;
          return `https://${url}`;
        };
        const url = formatUrl(element.url);
        return (
          <a {...attributes} href={url} target="_blank" rel="noopener noreferrer nofollow" className="text-blue-600 hover:underline cursor-pointer">{children}</a>
        );
      }
      case 'video':
        return <div {...attributes} className="my-4"><iframe src={element.url} className="w-full aspect-video rounded shadow" allowFullScreen /></div>;
      case 'cta':
        return <div {...attributes} className="my-4"><a href={element.url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-primary text-white rounded shadow">{element.text || 'Learn More'}</a></div>;
      default: {
        const align = 'align' in element ? (element.align as string | undefined) : undefined;
        return (
          <p 
            {...attributes} 
            className="min-h-[24px] py-1" 
            style={{ 
              textAlign: align || 'left', 
              lineHeight: 1.1, 
              margin: '0.25rem 0' 
            }}
          >
            {children}
          </p>
        );
      }
    }
  }, [editor]);

  // --- renderLeaf ---
  const renderLeaf = useCallback(({ 
    attributes, 
    children, 
    leaf 
  }: { 
    attributes: any; 
    children: React.ReactNode; 
    leaf: CustomText; 
  }) => {
    let styledChildren = children;
    
    // Apply each style if it exists on the leaf
    if (leaf.bold) {
      styledChildren = <strong>{styledChildren}</strong>;
    }
    if (leaf.italic) {
      styledChildren = <em>{styledChildren}</em>;
    }
    if (leaf.underline) {
      styledChildren = <u>{styledChildren}</u>;
    }
    if (leaf.code) {
      styledChildren = <code className="bg-gray-100 px-1 rounded text-sm">{styledChildren}</code>;
    }
    if (leaf.fontSize) {
      styledChildren = <span style={{ fontSize: `${leaf.fontSize}px` }}>{styledChildren}</span>;
    }
    
    // The following is a workaround for a Slate issue with React 18+ and StrictMode
    const { text, ...rest } = leaf;
    
    // Modern font stack with system fonts for better performance and cross-platform consistency
    const fontFamily = leaf.code 
      ? '"JetBrains Mono", "Fira Code", "Source Code Pro", Menlo, Monaco, Consolas, monospace'
      : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    
    return (
      <span 
        {...attributes}
        style={{
          fontFamily,
          fontWeight: leaf.bold ? '600' : 'normal',
          fontStyle: leaf.italic ? 'italic' : 'normal',
          textDecoration: leaf.underline ? 'underline' : 'none',
          lineHeight: '1.6',
          letterSpacing: '0.01em',
          ...(leaf.fontSize && { fontSize: `${leaf.fontSize}px` }),
          ...(leaf.code && { 
            backgroundColor: 'rgba(175, 184, 193, 0.2)',
            padding: '0.2em 0.4em',
            borderRadius: '0.25rem',
            fontSize: '0.85em',
            lineHeight: '1.5',
            color: '#e6edf3'
          })
        }}
        {...(Object.keys(rest).length > 0 ? { 'data-slate-leaf': true } : {})}
      >
        {styledChildren}
      </span>
    );
  }, []);

  // --- Main render ---
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add JetBrains Mono for code blocks
    const monoLink = document.createElement('link');
    monoLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap';
    monoLink.rel = 'stylesheet';
    document.head.appendChild(monoLink);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(monoLink);
    };
  }, []);

  // Clear any pending marks when the selection changes
  useEffect(() => {
    const handleChange = () => {
      // Clear any pending marks when the editor content changes
      editor.onChange = () => {
        // No need for pending marks state anymore
      };
    };
    
    handleChange();
    return () => {
      // Cleanup if needed
    };
  }, [editor]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Only handle special cases for backspace
    if (event.key === 'Backspace') {
      const { selection } = editor;
      if (!selection || !Range.isCollapsed(selection)) return;

      try {
        // Find the current block
        const [blockEntry] = Editor.nodes(editor, {
          match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
        });
        
        if (!blockEntry) return;
        const [block, path] = blockEntry;
        const blockType = (block as any).type;

        // Only handle special cases at the very start of special blocks
        if (Editor.isStart(editor, selection.anchor, path) && blockType && blockType !== 'paragraph') {
          // For empty blocks, remove them
          if (Node.string(block) === '') {
            event.preventDefault();
            
            // Special handling for list items
            if (['list-item', 'check-list-item'].includes(blockType)) {
              const [parent] = Editor.parent(editor, path);
              if (parent.children.length === 1) {
                Transforms.liftNodes(editor, { at: path });
                Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
              } else {
                Transforms.removeNodes(editor, { at: path });
              }
            } else {
              // For other block types, just remove them
              Transforms.removeNodes(editor, { at: path });
            }
          } 
          // For non-empty blocks at the very start, convert to paragraph
          else if (selection.anchor.offset === 0) {
            event.preventDefault();
            Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
          }
        }
      } catch (error) {
        console.error('Error handling backspace:', error);
        // Let the default behavior handle it if there's an error
      }
      
      // Always let the default backspace behavior handle other cases
      return;
    }

    // Handle Enter key in lists
    if (event.key === 'Enter' && !event.shiftKey) {
      const { selection } = editor;
      if (!selection) return;

      const [match] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          ['list-item', 'check-list-item'].includes((n as any).type),
      });

      if (match) {
        const [node, path] = match;
        const text = Node.string(node);

        // If the list item is empty, exit the list
        if (!text) {
          event.preventDefault();
          Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
          // Move the cursor to the new paragraph
          Transforms.move(editor, { distance: 1, unit: 'offset' });
          return;
        }
      }
    }
  };

  return (
    <div 
      className={`relative rounded-lg border bg-background shadow-sm ${className || ''}`}
      style={{
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#1f2937',
      }}
    >
      <Slate editor={editor} initialValue={value} onChange={setValue}>
        {/* Toolbar Tabs */}
        <Tabs defaultValue="home" className="w-full mb-2">
          <TabsList className="flex gap-2 bg-transparent border-b rounded-none p-0">
            <TabsTrigger value="home" className="py-2 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Home</TabsTrigger>
            <TabsTrigger value="insert" className="py-2 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Insert</TabsTrigger>
          </TabsList>
          <TabsContent value="home">
            <div className="flex items-center gap-1 flex-wrap px-4 pt-4 pb-2">
              {/* Formatting group */}
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={e => { e.preventDefault(); toggleMark(editor, 'bold'); }}
                className={`transition-colors ${isMarkActive(editor, 'bold') ? 'bg-yellow-400 border border-yellow-400 shadow-sm' : ''} text-gray-900`}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={e => { e.preventDefault(); toggleMark(editor, 'italic'); }}
                className={`transition-colors ${isMarkActive(editor, 'italic') ? 'bg-yellow-400 border border-yellow-400 shadow-sm' : ''} text-gray-900`}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={e => { e.preventDefault(); toggleMark(editor, 'underline'); }}
                className={`transition-colors ${isMarkActive(editor, 'underline') ? 'bg-yellow-400 border border-yellow-400 shadow-sm' : ''} text-gray-900`}
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={e => { e.preventDefault(); toggleMark(editor, 'code'); }}
                className={`transition-colors ${isMarkActive(editor, 'code') ? 'bg-yellow-400 border border-yellow-400 shadow-sm' : ''} text-gray-900`}
              >
                <Code2 className="h-4 w-4" />
              </Button>
              <span className="w-px h-6 bg-border mx-1" />
              {/* List group */}
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={e => { e.preventDefault(); toggleBlock(editor, 'bulleted-list'); }}
                className={`transition-colors ${isBlockActive(editor, 'bulleted-list') ? 'bg-yellow-400 border border-yellow-400 shadow-sm' : ''} text-gray-900`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={e => { e.preventDefault(); toggleBlock(editor, 'numbered-list'); }}
                className={`transition-colors ${isBlockActive(editor, 'numbered-list') ? 'bg-yellow-400 border border-yellow-400 shadow-sm' : ''} text-gray-900`}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={e => { e.preventDefault(); toggleBlock(editor, 'checklist'); }}
                className={`transition-colors ${isBlockActive(editor, 'checklist') ? 'bg-yellow-400 border border-yellow-400 shadow-sm' : ''} text-gray-900`}
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
              <span className="w-px h-6 bg-border mx-1" />
              {/* Alignment group */}
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={e => { e.preventDefault(); setBlockAlign(editor, 'left'); }}
                className={`transition-colors ${isBlockActive(editor, 'align-left') ? 'bg-yellow-400 border border-yellow-400 shadow-sm' : ''} text-gray-900`}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={e => { e.preventDefault(); setBlockAlign(editor, 'center'); }}
                className={`transition-colors ${isBlockActive(editor, 'align-center') ? 'bg-yellow-400 border border-yellow-400 shadow-sm' : ''} text-gray-900`}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={e => { e.preventDefault(); setBlockAlign(editor, 'right'); }}
                className={`transition-colors ${isBlockActive(editor, 'align-right') ? 'bg-yellow-400 border border-yellow-400 shadow-sm' : ''} text-gray-900`}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={e => { e.preventDefault(); setBlockAlign(editor, 'justify'); }}
                className={`transition-colors ${isBlockActive(editor, 'align-justify') ? 'bg-yellow-400 border border-yellow-400 shadow-sm' : ''} text-gray-900`}
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
              <span className="w-px h-6 bg-border mx-1" />
              {/* Undo/Redo */}
              <Button variant="ghost" size="icon" onMouseDown={e => { e.preventDefault(); editor.undo && editor.undo(); ReactEditor.focus(editor); }}><Undo2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onMouseDown={e => { e.preventDefault(); editor.redo && editor.redo(); ReactEditor.focus(editor); }}><Redo2 className="h-4 w-4" /></Button>
            </div>
          </TabsContent>
          <TabsContent value="insert">
            <div className="flex items-center gap-1 flex-wrap px-4 pt-4 pb-2">
              <Button variant="ghost" size="icon" onMouseDown={e => { e.preventDefault(); insertNode('code'); ReactEditor.focus(editor); }}><CodeIcon className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onMouseDown={e => { e.preventDefault(); insertNode('quote'); ReactEditor.focus(editor); }}><Quote className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onMouseDown={e => { e.preventDefault(); insertNode('divider'); ReactEditor.focus(editor); }}><Minus className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onMouseDown={e => { e.preventDefault(); insertNode('table', { rows: 3, cols: 3 }); ReactEditor.focus(editor); }}><Table className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onMouseDown={e => { e.preventDefault(); openLinkDialog(); ReactEditor.focus(editor); }}><LinkIcon className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onMouseDown={e => { e.preventDefault(); insertNode('image'); ReactEditor.focus(editor); }}><Image2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onMouseDown={e => { e.preventDefault(); setShowVideoDialog(true); ReactEditor.focus(editor); }}><Video className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onMouseDown={e => { e.preventDefault(); setShowCtaDialog(true); ReactEditor.focus(editor); }}><ArrowRight className="h-4 w-4" /></Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
              <DialogDescription>Enter the URL and link text.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                autoFocus
                placeholder="https://example.com"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                type="url"
              />
              <Input
                placeholder="Link text"
                value={linkText}
                onChange={e => setLinkText(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleLinkInsert} type="button">OK</Button>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Code Block</DialogTitle>
              <DialogDescription>Enter the language for syntax highlighting.</DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              placeholder="e.g. javascript, python, html, css"
              value={codeLanguage}
              onChange={e => setCodeLanguage(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleCodeInsert} type="button">OK</Button>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Video</DialogTitle>
              <DialogDescription>Enter a YouTube or Vimeo URL.</DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              placeholder="https://youtube.com/... or https://vimeo.com/..."
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              type="url"
            />
            <DialogFooter>
              <Button onClick={handleVideoInsert} type="button">OK</Button>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showCtaDialog} onOpenChange={setShowCtaDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Call to Action</DialogTitle>
              <DialogDescription>Enter the button text and URL.</DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              placeholder="Button text"
              value={ctaText}
              onChange={e => setCtaText(e.target.value)}
            />
            <Input
              placeholder="Button URL"
              value={ctaUrl}
              onChange={e => setCtaUrl(e.target.value)}
              type="url"
            />
            <DialogFooter>
              <Button onClick={handleCtaInsert} type="button">OK</Button>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* The main editor */}
        <Editable
          className="min-h-[300px] p-4 focus:outline-none"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      </Slate>
    </div>
  );
};

export default RichBlogEditor;

