'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Video, Quote, Code as CodeIcon, Minus, ArrowRight, Link2 as LinkIcon, 
  Image, Upload, FolderOpen, Globe, Play, Undo2, Redo2, Type, Hash, Highlighter, Palette
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { 
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  DecoratorNode,
  $applyNodeReplacement,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $insertNodes,
  $createTextNode,
  $patchStyleText,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW
} from 'lexical';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, ListNode, ListItemNode, REMOVE_LIST_COMMAND, $createListItemNode, $createListNode, $isListNode } from '@lexical/list';
import { $createLinkNode, LinkNode } from '@lexical/link';
import { $createCodeNode, CodeNode } from '@lexical/code';
import { HorizontalRuleNode, $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { $insertTableRowAtSelection, $deleteTableRowAtSelection, $insertTableColumnAtSelection, $deleteTableColumnAtSelection, $mergeCells, $unmergeCell } from '@lexical/table';
import { UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { $createHeadingNode, HeadingNode } from '@lexical/rich-text';
import { registerRichText } from '@lexical/rich-text';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import type { EditorState, ElementNode, TextNode } from 'lexical';
import { TextNode as LexicalTextNode } from 'lexical';

// List of valid programming languages for code block validation
const PROGRAMMING_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'c++', 'c#', 'go', 'ruby', 'php', 'swift', 'kotlin', 'rust', 'scala', 'perl', 'haskell', 'lua', 'dart', 'elixir', 'clojure', 'f#', 'r', 'matlab', 'objective-c', 'shell', 'bash', 'powershell', 'html', 'css', 'json', 'xml', 'yaml', 'markdown', 'sql', 'assembly', 'fortran', 'groovy', 'julia', 'lisp', 'sas', 'vb', 'visualbasic', 'tsx', 'jsx', 'vbnet', 'abap', 'ada', 'apex', 'awk', 'cobol', 'd', 'delphi', 'erlang', 'j', 'ocaml', 'pascal', 'prolog', 'scheme', 'smalltalk', 'solidity', 'verilog', 'vhdl', 'plsql', 'tcl', 'actionscript', 'coffeescript', 'crystal', 'elm', 'nim', 'reason', 'vala', 'zig'
];

const PRISM_LANGUAGE_MAP: Record<string, string> = {
  'c++': 'cpp',
  'c#': 'csharp',
  'shell': 'bash',
  'sh': 'bash',
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'html': 'markup',
  'xml': 'markup',
  'plaintext': 'text',
  'text': 'text',
  // add more aliases as needed
};

// Add LexicalErrorBoundary for RichTextPlugin
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Enhanced Image Component
function ImageComponent({ nodeKey, src, alt }: { nodeKey: string, src: string, alt: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="my-4 text-center">
      {isLoading && (
        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      )}
      {hasError && (
        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
          <div className="text-gray-500 text-sm">Failed to load image</div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`max-w-full h-auto rounded-lg shadow-md ${isLoading ? 'hidden' : ''}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        style={{ display: isLoading ? 'none' : 'block', margin: '0 auto' }}
      />
      {alt && !hasError && !isLoading && (
        <p className="text-sm text-gray-600 mt-2 italic">{alt}</p>
      )}
    </div>
  );
}

// Enhanced Video Component
function VideoComponent({ nodeKey, src, title }: { nodeKey: string, src: string, title?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Extract video ID and determine platform
  const getVideoEmbedUrl = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
        platform: 'youtube'
      };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return {
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        platform: 'vimeo'
      };
    }

    // Direct video file
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return {
        embedUrl: url,
        platform: 'direct'
      };
    }

    return null;
  };

  const videoInfo = getVideoEmbedUrl(src);

  if (!videoInfo) {
    return (
      <div className="my-4 p-4 bg-gray-100 rounded-lg text-center">
        <Play className="mx-auto mb-2 text-gray-400" size={24} />
        <p className="text-gray-600 text-sm">Unsupported video URL</p>
        <p className="text-gray-500 text-xs mt-1">{src}</p>
      </div>
    );
  }

  if (videoInfo.platform === 'direct') {
    return (
      <div className="my-4">
        <video
          controls
          className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
          onLoadStart={() => setIsLoading(true)}
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        >
          <source src={videoInfo.embedUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {title && (
          <p className="text-sm text-gray-600 mt-2 text-center italic">{title}</p>
        )}
      </div>
    );
  }

  return (
    <div className="my-4">
      {isLoading && (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      )}
      {hasError && (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-gray-500 text-sm">Failed to load video</div>
        </div>
      )}
      <iframe
        src={videoInfo.embedUrl}
        className={`w-full h-64 md:h-80 lg:h-96 rounded-lg shadow-md ${isLoading ? 'hidden' : ''}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      {title && !hasError && !isLoading && (
        <p className="text-sm text-gray-600 mt-2 text-center italic">{title}</p>
      )}
    </div>
  );
}

// Enhanced ImageNode
class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt: string;
  static getType() { return 'image'; }
  static clone(node: ImageNode) { return new ImageNode(node.__src, node.__alt, node.__key); }
  constructor(src: string, alt = '', key?: string) {
    super(key);
    this.__src = src;
    this.__alt = alt;
  }
  createDOM() { const dom = document.createElement('div'); return dom; }
  updateDOM() { return false; }
  decorate() {
    return <ImageComponent nodeKey={this.getKey()} src={this.__src} alt={this.__alt} />;
  }
  static importJSON(serialized: any) {
    return new ImageNode(serialized.src, serialized.alt, serialized.key);
  }
  exportJSON() {
    return { ...super.exportJSON(), type: 'image', src: this.__src, alt: this.__alt, version: 1 };
  }
}

// Enhanced VideoNode
class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __title: string;
  static getType() { return 'video'; }
  static clone(node: VideoNode) { return new VideoNode(node.__src, node.__title, node.__key); }
  constructor(src: string, title = '', key?: string) {
    super(key);
    this.__src = src;
    this.__title = title;
  }
  createDOM() { const dom = document.createElement('div'); return dom; }
  updateDOM() { return false; }
  decorate() {
    return <VideoComponent nodeKey={this.getKey()} src={this.__src} title={this.__title} />;
  }
  static importJSON(serialized: any) {
    return new VideoNode(serialized.src, serialized.title, serialized.key);
  }
  exportJSON() {
    return { ...super.exportJSON(), type: 'video', src: this.__src, title: this.__title, version: 1 };
  }
}

// Add missing Lexical imports
import { 
  LexicalComposer 
} from '@lexical/react/LexicalComposer';
import { 
  RichTextPlugin 
} from '@lexical/react/LexicalRichTextPlugin';
import { 
  ContentEditable 
} from '@lexical/react/LexicalContentEditable';
import { 
  HistoryPlugin 
} from '@lexical/react/LexicalHistoryPlugin';
import { 
  OnChangePlugin 
} from '@lexical/react/LexicalOnChangePlugin';
import { 
  useLexicalComposerContext 
} from '@lexical/react/LexicalComposerContext';
import { 
  ListPlugin 
} from '@lexical/react/LexicalListPlugin';
import { 
  LinkPlugin 
} from '@lexical/react/LexicalLinkPlugin';

// 1. BlockquoteNode and component
import { $getNodeByKey } from 'lexical';

function BlockquoteComponent({ nodeKey, text }: { nodeKey: string, text: string }) {
  const [editor] = useLexicalComposerContext();
  const [value, setValue] = React.useState(text);
  const [isEditing, setIsEditing] = React.useState(true); // Start in editing mode
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => { setValue(text); }, [text]);

  // Auto-expand textarea as user types
  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [isEditing, value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && typeof (node as any).setText === 'function') (node as any).setText(e.target.value);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Exit blockquote on Esc or Ctrl+Enter
    if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      setIsEditing(false);
      // Optionally, move focus to next block or editor
    }
  };

  return (
    <blockquote
      className="my-4 py-2 px-2 rounded-lg text-gray-800 relative"
      style={{ background: '#e6f9f9', borderLeft: '5px solid #ffe066' }}
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="block w-full bg-transparent border-none outline-none resize-none text-lg italic"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a quote..."
          autoFocus
        />
      ) : (
        <div className="min-h-[28px] italic text-lg cursor-text" style={{whiteSpace: 'pre-wrap'}}>
          {value || <span className="text-gray-400">Type a quote...</span>}
        </div>
      )}
    </blockquote>
  );
}

class BlockquoteNode extends DecoratorNode<JSX.Element> {
  __text: string;
  static getType() { return 'blockquote'; }
  static clone(node: BlockquoteNode) { return new BlockquoteNode(node.__text, node.__key); }
  constructor(text: string, key?: string) {
    super(key);
    this.__text = text;
  }
  createDOM() { return document.createElement('div'); }
  updateDOM() { return false; }
  decorate() { return <BlockquoteComponent nodeKey={this.getKey()} text={this.__text} />; }
  static importJSON(serialized: any) { return new BlockquoteNode(serialized.text, serialized.key); }
  exportJSON() { return { ...super.exportJSON(), type: 'blockquote', text: this.__text, version: 1 }; }
  setText(text: string) {
    const self = this.getWritable();
    self.__text = text;
  }
}
export function $createBlockquoteNode(text: string) {
  return $applyNodeReplacement(new BlockquoteNode(text));
}

// 2. Insert blockquote function
function insertBlockquote(editor: any) {
  if (!editor) return;
  editor.update(() => {
    const blockquoteNode = $createBlockquoteNode('Edit this quote...');
    $insertNodes([blockquoteNode, $createParagraphNode()]);
  });
}

// Custom CodeBlockComponent
function CodeBlockComponent({ nodeKey, code, language }: { nodeKey: string, code: string, language: string }) {
  const [editor] = useLexicalComposerContext();
  const [value, setValue] = useState(code);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setValue(code); }, [code]);

  // Auto-expand textarea as user types
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-expand as user types
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };
  const handleBlur = () => {
    setIsEditing(false);
    editor.update(() => {
      const node = editor.getEditorState().read(() => $getNodeByKey(nodeKey));
      if (node && typeof (node as any).setCode === 'function') (node as any).setCode(value);
    });
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      (e.target as HTMLTextAreaElement).blur();
    }
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };
  // Map user language to Prism key
  const prismLanguage = PRISM_LANGUAGE_MAP[language] || language;
  return (
    <div className="relative my-4 bg-[#181c24] rounded-lg shadow-md border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-[#23272f] rounded-t-lg">
        <span className="text-xs text-gray-300 font-mono">{language || 'text'}</span>
        <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded border border-gray-600 bg-[#23272f]">Copy</button>
      </div>
      {isEditing ? (
        <textarea
          ref={textareaRef}
          className="w-full min-h-[80px] bg-[#181c24] text-white font-mono text-sm p-4 outline-none resize-none rounded-b-lg"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          style={{overflow: 'hidden'}}
        />
      ) : (
        <div
          className="p-4 cursor-text rounded-b-lg"
          onClick={() => setIsEditing(true)}
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') setIsEditing(true); }}
        >
          <SyntaxHighlighter
            language={prismLanguage}
            style={oneDark}
            customStyle={{ margin: 0, borderRadius: 0, background: 'transparent', padding: 0, minHeight: 0 }}
            showLineNumbers={false}
          >{value || ' '}</SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

// Custom CodeBlockNode
class CodeBlockNode extends DecoratorNode<JSX.Element> {
  __code: string;
  __language: string;
  static getType() { return 'codeblock'; }
  static clone(node: CodeBlockNode) { return new CodeBlockNode(node.__code, node.__language, node.__key); }
  constructor(code: string, language: string, key?: string) {
    super(key);
    this.__code = code;
    this.__language = language;
  }
  createDOM() { return document.createElement('div'); }
  updateDOM() { return false; }
  decorate() { return <CodeBlockComponent nodeKey={this.getKey()} code={this.__code} language={this.__language} />; }
  static importJSON(serialized: any) { return new CodeBlockNode(serialized.code, serialized.language, serialized.key); }
  exportJSON() { return { ...super.exportJSON(), type: 'codeblock', code: this.__code, language: this.__language, version: 1 }; }
  setCode(code: string) { this.__code = code; }
}
export function $createCodeBlockNode(language: string, code: string) {
  return $applyNodeReplacement(new CodeBlockNode(code, language));
}

// Update insertCodeBlock to use custom node
function insertCodeBlock(editor: any, language: string) {
  if (!editor) return;
  editor.update(() => {
    const codeNode = $createCodeBlockNode(language, '');
    $insertNodes([codeNode, $createParagraphNode()]);
  });
}

// --- CTA Button Node and Component ---
function CtaButtonComponent({ nodeKey, text, url, variant }: { nodeKey: string, text: string, url: string, variant: string }) {
  const tabYellow = '#ffc800';
  const tabText = '#222';
  return (
    <div className="my-4 flex justify-center">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={
          'px-6 py-3 rounded-lg font-semibold shadow transition-all duration-200'
        }
        style={
          {
            background: variant === 'secondary' ? '#fff' : tabYellow,
            color: tabText,
            fontSize: '1.1rem',
            minWidth: 120,
            textAlign: 'center',
            textDecoration: 'none',
            border: variant === 'secondary' ? `2px solid ${tabYellow}` : 'none',
            cursor: 'pointer',
            display: 'inline-block',
            transition: 'transform 0.15s cubic-bezier(.4,1.3,.5,1), box-shadow 0.15s cubic-bezier(.4,1.3,.5,1)',
          }
        }
        onMouseOver={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px 0 rgba(0,0,0,0.10)';
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLElement).style.boxShadow = '';
        }}
      >
        {text && text.trim() ? text : 'Call to Action'}
      </a>
    </div>
  );
}

class CtaButtonNode extends DecoratorNode<JSX.Element> {
  __text: string;
  __url: string;
  __variant: string;
  static getType() { return 'cta-button'; }
  static clone(node: CtaButtonNode) { return new CtaButtonNode(node.__text, node.__url, node.__variant, node.__key); }
  constructor(text: string, url: string, variant: string, key?: string) {
    super(key);
    this.__text = text;
    this.__url = url;
    this.__variant = variant;
  }
  createDOM() { return document.createElement('div'); }
  updateDOM() { return false; }
  decorate() { return <CtaButtonComponent nodeKey={this.getKey()} text={this.__text} url={this.__url} variant={this.__variant} />; }
  static importJSON(serialized: any) { return new CtaButtonNode(serialized.text, serialized.url, serialized.variant, serialized.key); }
  exportJSON() { return { ...super.exportJSON(), type: 'cta-button', text: this.__text, url: this.__url, variant: this.__variant, version: 1 }; }
}
export function $createCtaButtonNode(text: string, url: string, variant: string) {
  return $applyNodeReplacement(new CtaButtonNode(text, url, variant));
}
function insertCtaButton(editor: any, text: string, url: string, variant: string) {
  if (!editor) return;
  editor.update(() => {
    const ctaNode = $createCtaButtonNode(text, url, variant);
    $insertNodes([ctaNode, $createParagraphNode()]);
  });
}

// Add a placeholder upload function at the top (replace with real upload logic as needed)
async function uploadFile(file: File, type: 'image' | 'video'): Promise<string> {
  // TODO: Replace with real upload logic (e.g., to S3, Supabase, etc.)
  // For now, return a fake URL after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`https://fake-uploaded-files.com/${type}s/${file.name}`);
    }, 1200);
  });
}

// Add these helper functions above the Toolbar component
function insertTag(editor: any) {
  editor.update(() => {
    const tagNode = $createTextNode('#tag');
    $insertNodes([tagNode, $createParagraphNode()]);
  });
}

// Toolbar component
import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import type { TextFormatType, ElementFormatType } from 'lexical';

const COLOR_PALETTE: string[] = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#ffffff',
  '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#3d85c6', '#674ea7', '#a64d79',
  '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#073763', '#20124d', '#4c1130',
  '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#073763', '#20124d', '#4c1130',
  '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130', '#1c4587',
];

function Toolbar({
  activeTab,
  setActiveTab,
  toolbarGroupStyle,
  dividerStyle
}: {
  activeTab: 'home' | 'insert';
  setActiveTab: Dispatch<SetStateAction<'home' | 'insert'>>;
  toolbarGroupStyle: CSSProperties;
  dividerStyle: CSSProperties;
}) {
  const [editor] = useLexicalComposerContext();
  
  // Dialog states
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showCtaDialog, setShowCtaDialog] = useState(false);
  // Form states
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('');
  const [codeLangError, setCodeLangError] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [ctaVariant, setCtaVariant] = useState('primary');

  // Selection ref for restoring selection after dropdown
  const selectionRef = useRef<Range | null>(null);
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      selectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && selectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(selectionRef.current);
    }
    editor.focus();
  };

  const ToolbarButton = ({ 
    onClick, 
    children, 
    title, 
    active = false 
  }: { 
    onClick: () => void; 
    children: React.ReactNode; 
    title: string; 
    active?: boolean; 
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      onMouseDown={e => e.preventDefault()}
      style={{
        padding: '6px',
        border: 'none',
        background: active ? '#FFC107' : 'transparent',
        color: '#1C8C8C',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        fontSize: '14px',
        minWidth: '32px',
        height: '32px'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#FFC107';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );

  // Remove the current heading dropdown tool from the toolbar and rewrite it:
  const [headingValue, setHeadingValue] = useState('');

  // Listen for selection changes to update heading dropdown
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          let foundHeading = null;
          let mixed = false;
          const nodes = selection.getNodes();
          for (const node of nodes) {
            if (node.getType && node.getType().startsWith('heading') && typeof HeadingNode !== 'undefined' && node instanceof HeadingNode) {
              let level = null;
              if (typeof node.getTag === 'function') {
                const tag = node.getTag();
                if (tag && tag.startsWith('h')) level = tag.replace('h', '');
              }
              if (level) {
                if (foundHeading === null) foundHeading = level;
                else if (foundHeading !== level) { mixed = true; break; }
              }
            } else if (node.getType && node.getType() === 'paragraph') {
              if (foundHeading === null) foundHeading = 'normal';
              else if (foundHeading !== 'normal') { mixed = true; break; }
            }
          }
          if (mixed) setHeadingValue('');
          else setHeadingValue(foundHeading || '');
        } else {
          setHeadingValue('');
        }
      });
    });
  }, [editor]);

  const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '60', '72', '96'];
  const [fontSize, setFontSize] = useState('');

  // Update font size state on selection change
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          let foundSize = null;
          let mixed = false;
          for (const node of selection.getNodes()) {
            if (node instanceof LexicalTextNode) {
              const style = node.getStyle();
              const match = style && style.match(/font-size:\s*([^;]+)px?/);
              const size = match ? match[1] : null;
              if (size) {
                if (foundSize === null) foundSize = size;
                else if (foundSize !== size) { mixed = true; break; }
              }
            }
          }
          if (mixed) setFontSize('');
          else setFontSize(foundSize || '');
        } else {
          setFontSize('');
        }
      });
    });
  }, [editor]);

  // In the toolbar state:
  const [fontColor, setFontColor] = useState('#000000');
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);

  // Listen for selection changes to update font color input
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          let foundColor = null;
          let mixed = false;
          const nodes = selection.getNodes();
          for (const node of nodes) {
            if (node instanceof LexicalTextNode) {
              const style = node.getStyle();
              const match = style && style.match(/color:\s*([^;]+);?/);
              const color = match ? match[1] : null;
              if (color) {
                if (foundColor === null) foundColor = color;
                else if (foundColor !== color) { mixed = true; break; }
              }
            }
          }
          if (mixed) setFontColor('#000000');
          else setFontColor(foundColor || '#000000');
        } else {
          setFontColor('#000000');
        }
      });
    });
  }, [editor]);

  // Listen for selection changes to update highlight button state
  const [isHighlight, setIsHighlight] = useState(false);
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsHighlight(selection.hasFormat && selection.hasFormat('highlight'));
        } else {
          setIsHighlight(false);
        }
      });
    });
  }, [editor]);

  const HIGHLIGHT_PALETTE: string[] = [
    '#ffffff', '#ffff00', '#ffd966', '#f6b26b', '#f4cccc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#c9daf8',
    '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#b4a7d6', '#d5a6bd', '#ead1dc', '#fff2cc',
    '#fce5cd', '#d9ead3', '#d0e0e3', '#cfe2f3', '#c9daf8', '#b4a7d6', '#d5a6bd', '#ead1dc', '#fff2cc',
    '#fce5cd', '#d9ead3', '#d0e0e3', '#cfe2f3', '#c9daf8', '#b4a7d6', '#d5a6bd', '#ead1dc', '#fff2cc',
  ];
  const [highlightPopoverOpen, setHighlightPopoverOpen] = useState(false);
  const [highlightColor, setHighlightColor] = useState('');
  // Listen for selection changes to update highlight color
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          let foundColor = null;
          let mixed = false;
          const nodes = selection.getNodes();
          for (const node of nodes) {
            if (node instanceof LexicalTextNode) {
              const style = node.getStyle();
              const match = style && style.match(/background-color:\s*([^;]+);?/);
              const color = match ? match[1] : null;
              if (color) {
                if (foundColor === null) foundColor = color;
                else if (foundColor !== color) { mixed = true; break; }
              }
            }
          }
          if (mixed) setHighlightColor('');
          else setHighlightColor(foundColor || '');
        } else {
          setHighlightColor('');
        }
      });
    });
  }, [editor]);

  return (
    <>
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {activeTab === 'home' && (
            <>
              {/* Formatting Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton active={false} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} title="Bold"><Bold size={20} /></ToolbarButton>
                <ToolbarButton active={false} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} title="Italic"><Italic size={20} /></ToolbarButton>
                <ToolbarButton active={false} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} title="Underline"><Underline size={20} /></ToolbarButton>
                {/* Font Size Dropdown */}
                <Select
                  value={fontSize}
                  onValueChange={val => {
                    setFontSize(val);
                    // Apply font size synchronously and immediately
                    editor.update(() => {
                      const selection = $getSelection();
                      if ($isRangeSelection(selection)) {
                        $patchStyleText(selection, { 'font-size': val + 'px' });
                      }
                    }, { discrete: true }); // Use discrete update for instant effect
                  }}
                  className="ml-2 w-[90px]"
                >
                  <SelectTrigger className="ml-2 w-[90px]" onMouseDown={e => e.preventDefault()} style={{ color: '#000' }}>
                    <SelectValue placeholder="Font size" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map(size => (
                      <SelectItem key={size} value={size} className="focus:bg-[#FFC107] data-[state=checked]:bg-[#FFC107]" style={{ color: '#000' }}>{size}px</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div style={dividerStyle}></div>
              {/* Alignment Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton active={false} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} title="Align Left"><AlignLeft size={20} /></ToolbarButton>
                <ToolbarButton active={false} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} title="Align Center"><AlignCenter size={20} /></ToolbarButton>
                <ToolbarButton active={false} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} title="Align Right"><AlignRight size={20} /></ToolbarButton>
                <ToolbarButton active={false} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')} title="Align Justify"><AlignJustify size={20} /></ToolbarButton>
              </div>
              <div style={dividerStyle}></div>
              {/* List Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton active={false} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} title="Bulleted List"><List size={20} /></ToolbarButton>
                <ToolbarButton active={false} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} title="Numbered List"><ListOrdered size={20} /></ToolbarButton>
              </div>
            </>
          )}
          {activeTab === 'insert' && (
            <>
              {/* Media Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton onClick={() => setShowImageDialog(true)} title="Insert Image"><Image size={20} /></ToolbarButton>
                <ToolbarButton onClick={() => setShowVideoDialog(true)} title="Insert Video"><Video size={20} /></ToolbarButton>
              </div>
              <div style={dividerStyle}></div>
              {/* Content Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton onClick={() => setShowLinkDialog(true)} title="Insert Link"><LinkIcon size={20} /></ToolbarButton>
                <ToolbarButton onClick={() => insertTag(editor)} title="Insert Tag"><Hash size={20} /></ToolbarButton>
              </div>
              <div style={dividerStyle}></div>
              {/* Formatting Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton onClick={() => insertBlockquote(editor)} title="Insert Blockquote"><Quote size={20} /></ToolbarButton>
                <ToolbarButton onClick={() => setShowCodeDialog(true)} title="Insert Code Block"><CodeIcon size={20} /></ToolbarButton>
                <ToolbarButton onClick={() => editor.update(() => { const hrNode = $createHorizontalRuleNode(); $insertNodes([hrNode, $createParagraphNode()]); })} title="Insert Divider"><Minus size={20} /></ToolbarButton>
              </div>
              <div style={dividerStyle}></div>
              {/* Action Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton onClick={() => setShowCtaDialog(true)} title="Insert CTA Button"><ArrowRight size={20} /></ToolbarButton>
              </div>
            </>
          )}
          <div style={toolbarGroupStyle}>
            <ToolbarButton onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} title="Undo"><Undo2 size={20} /></ToolbarButton>
            <ToolbarButton onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} title="Redo"><Redo2 size={20} /></ToolbarButton>
          </div>
          <div style={toolbarGroupStyle}>
            <ToolbarButton
              active={isHighlight}
              onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')}
              title="Highlight"
            >
              <Highlighter size={20} />
            </ToolbarButton>
          </div>
          {/* For the highlight tool, only render the button. Remove any circle indicator element entirely. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginRight: 4 }}>
              <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    style={{
                      width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #ccc', background: fontColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative',
                    }}
                    title="Font Color"
                  />
                </PopoverTrigger>
                <PopoverContent align="start" style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 20px)', gap: 8, marginBottom: 12 }}>
                    {COLOR_PALETTE.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => {
                          setFontColor(color);
                          setColorPopoverOpen(false);
                          editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                              $patchStyleText(selection, { color });
                            }
                          }, { discrete: true });
                        }}
                        style={{
                          width: 20, height: 20, borderRadius: '50%', border: color === fontColor ? '2px solid #1C8C8C' : '1.5px solid #ccc', background: color,
                          cursor: 'pointer', outline: 'none', margin: 0, padding: 0,
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#888' }}>Custom</span>
                    <input
                      type="color"
                      value={fontColor}
                      onChange={e => {
                        const color = e.target.value;
                        setFontColor(color);
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            $patchStyleText(selection, { color });
                          }
                        }, { discrete: true });
                      }}
                      style={{ width: 28, height: 28, border: 'none', background: 'none', borderRadius: '50%', cursor: 'pointer' }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
      {/* All dialogs for insert tools go here, as previously implemented */}
      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>Add a link to your content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Link text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
            <Input
              placeholder="URL (https://...)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (!linkText.trim() || !linkUrl.trim()) return;
              const linkNode = $createLinkNode(linkUrl);
              $insertNodes([linkNode, $createTextNode(linkText)]);
              setShowLinkDialog(false);
              setLinkText('');
              setLinkUrl('');
            }}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>Add an image to your content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e: any) => {
                    const file = e.target.files[0];
                    if (file) {
                      const localUrl = URL.createObjectURL(file);
                      setImageUrl(localUrl);
                    }
                  };
                  input.click();
                }}
              >Upload from Device</Button>
              <Button
                variant="outline"
                onClick={() => alert('Google Drive upload not implemented in this demo.')}
              >Upload from Drive</Button>
            </div>
            <Input
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Input
              placeholder="Alt text (optional)"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (!imageUrl.trim()) return;
              const imageNode = new ImageNode(imageUrl, imageAlt);
              $insertNodes([imageNode, $createParagraphNode()]);
              setShowImageDialog(false);
              setImageUrl('');
              setImageAlt('');
            }}>Insert Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Video</DialogTitle>
            <DialogDescription>Add a video to your content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'video/*';
                  input.onchange = (e: any) => {
                    const file = e.target.files[0];
                    if (file) {
                      const localUrl = URL.createObjectURL(file);
                      setVideoUrl(localUrl);
                    }
                  };
                  input.click();
                }}
              >Upload from Device</Button>
              <Button
                variant="outline"
                onClick={() => alert('Google Drive upload not implemented in this demo.')}
              >Upload from Drive</Button>
            </div>
            <Input
              placeholder="Video URL (YouTube, Vimeo, or direct link)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <Input
              placeholder="Video title (optional)"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (!videoUrl.trim()) return;
              const videoNode = new VideoNode(videoUrl, videoTitle);
              $insertNodes([videoNode, $createParagraphNode()]);
              setShowVideoDialog(false);
              setVideoUrl('');
              setVideoTitle('');
            }}>Insert Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Code Block</DialogTitle>
            <DialogDescription>Add a code block with syntax highlighting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Programming language (e.g. javascript, python, c++)"
              value={codeLanguage}
              onChange={e => {
                const val = e.target.value.trim().toLowerCase();
                setCodeLanguage(val);
                if (!val.match(/^[a-zA-Z0-9+#-]+$/)) {
                  setCodeLangError('Only programming language names are allowed (letters, numbers, +, #, -)');
                } else if (!PROGRAMMING_LANGUAGES.includes(val)) {
                  setCodeLangError('Please enter a valid programming language.');
                } else {
                  setCodeLangError('');
                }
              }}
              autoFocus
              maxLength={32}
            />
            {codeLangError && <div className="text-red-500 text-xs">{codeLangError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const val = codeLanguage.trim().toLowerCase();
                if (!val || codeLangError || !PROGRAMMING_LANGUAGES.includes(val)) {
                  setCodeLangError('Please enter a valid programming language.');
                  return;
                }
                insertCodeBlock(editor, val);
                setShowCodeDialog(false);
                setCodeLanguage('');
                setCodeLangError('');
              }}
              disabled={!codeLanguage.trim() || !!codeLangError || !PROGRAMMING_LANGUAGES.includes(codeLanguage.trim().toLowerCase())}
            >
              Insert Code Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* CTA Dialog */}
      <Dialog open={showCtaDialog} onOpenChange={setShowCtaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert CTA Button</DialogTitle>
            <DialogDescription>Add a call-to-action button to your content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Button text (e.g. Get Started)"
              value={ctaText}
              onChange={e => setCtaText(e.target.value)}
              maxLength={40}
            />
            <Input
              placeholder="Button URL (https://...)"
              value={ctaUrl}
              onChange={e => setCtaUrl(e.target.value)}
            />
            <div className="flex gap-4 items-center">
              <label className="font-medium">Style:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-4 py-1 rounded border font-semibold transition-colors duration-150 ${ctaVariant === 'primary' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-teal-700 border-teal-600'}`}
                  onClick={() => setCtaVariant('primary')}
                  style={{ outline: ctaVariant === 'primary' ? '2px solid #1C8C8C' : 'none', color: ctaVariant === 'primary' ? '#fff' : '#1C8C8C', background: ctaVariant === 'primary' ? '#1C8C8C' : '#fff' }}
                >
                  Primary
                </button>
                <button
                  type="button"
                  className={`px-4 py-1 rounded border font-semibold transition-colors duration-150 ${ctaVariant === 'secondary' ? 'bg-teal-100 text-teal-700 border-teal-600' : 'bg-white text-teal-700 border-teal-600'}`}
                  onClick={() => setCtaVariant('secondary')}
                  style={{ outline: ctaVariant === 'secondary' ? '2px solid #1C8C8C' : 'none', color: ctaVariant === 'secondary' ? '#1C8C8C' : '#1C8C8C', background: ctaVariant === 'secondary' ? '#e6f9f9' : '#fff' }}
                >
                  Secondary
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCtaDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!ctaText.trim() || !ctaUrl.trim()) return;
                insertCtaButton(editor, ctaText.trim(), ctaUrl.trim(), ctaVariant);
                setShowCtaDialog(false);
                setCtaText('');
                setCtaUrl('');
                setCtaVariant('primary');
              }}
              disabled={!ctaText.trim() || !ctaUrl.trim()}
            >
              Insert CTA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Add TableToolbar component
function TableToolbarPortal({ editor }: { editor: any }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;
    return editor.registerUpdateListener(({ editorState }: { editorState: EditorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        let foundTable = false;
        let tableElement: HTMLElement | null = null;
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          let node = anchorNode;
          while (node) {
            if (node.getType && node.getType() === 'table') {
              foundTable = true;
              // Find the DOM element for the table
              const dom = editor.getElementByKey(node.getKey());
              if (dom) tableElement = dom as HTMLElement;
              break;
            }
            if (typeof node.getParent === 'function') {
              const parent = node.getParent();
              if (parent) {
                node = parent as ElementNode | TextNode;
              } else {
                break;
              }
            } else {
              break;
            }
          }
        }
        setShow(foundTable && !!tableElement);
        if (foundTable && tableElement) {
          const rect = tableElement.getBoundingClientRect();
          setPosition({
            top: rect.top + window.scrollY - 48, // 48px above the table
            left: rect.left + window.scrollX,
          });
        } else {
          setPosition(null);
        }
      });
    });
  }, [editor]);

  if (!editor || !show || !position) return null;

  return ReactDOM.createPortal(
    <div
      ref={toolbarRef}
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        zIndex: 1001,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
        padding: 8,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <Button size="sm" variant="outline" onClick={() => editor.update(() => $insertTableRowAtSelection(true))}>Add Row</Button>
      <Button size="sm" variant="outline" onClick={() => editor.update(() => $deleteTableRowAtSelection())}>Remove Row</Button>
      <Button size="sm" variant="outline" onClick={() => editor.update(() => $insertTableColumnAtSelection(true))}>Add Col</Button>
      <Button size="sm" variant="outline" onClick={() => editor.update(() => $deleteTableColumnAtSelection())}>Remove Col</Button>
      <Button size="sm" variant="outline" onClick={() => editor.update(() => $mergeCells([]))}>Merge</Button>
      <Button size="sm" variant="outline" onClick={() => editor.update(() => $unmergeCell())}>Split</Button>
    </div>,
    document.body
  );
}

// 4. Register BlockquoteNode and CodeNode in editorConfig
const editorConfig = {
  namespace: 'RichBlogEditor',
  theme: {
    link: 'editor-link',
    text: {
      bold: 'editor-text-bold',
      italic: 'editor-text-italic',
      underline: 'editor-text-underline',
    },
  },
  onError(error: Error) {
    throw error;
  },
  nodes: [
    HorizontalRuleNode,
    LinkNode,
    ListNode,
    ListItemNode,
    LexicalTextNode,
    ImageNode,
    VideoNode,
    BlockquoteNode,
    CodeBlockNode,
    CtaButtonNode,
    HeadingNode,
  ],
};

// Plugin to register rich text features (headings, font size, color, etc.)
function RegisterRichTextPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return registerRichText(editor);
  }, [editor]);
  return null;
}

// Create a wrapper component that uses the context
function EditorContent({ 
  onUpdate, 
  initialContent = '',
  className = '',
  activeTab,
  setActiveTab,
  toolbarGroupStyle,
  dividerStyle
}: { 
  onUpdate?: (content: string) => void, 
  initialContent?: string, 
  className?: string,
  activeTab: 'home' | 'insert',
  setActiveTab: React.Dispatch<React.SetStateAction<'home' | 'insert'>>,
  toolbarGroupStyle: any,
  dividerStyle: any
}) {
  const [editor] = useLexicalComposerContext();
  const editorRef = useRef<any>(null);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    // Listen for selection changes to update font size dropdown
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            let fontSize: string | null = null;
            let foundDifferent = false;
            const nodes = selection.getNodes();
            for (const node of nodes) {
              if (node instanceof LexicalTextNode) {
                const styleStr = node.getStyle();
                let size: string | null = null;
                if (styleStr) {
                  // Parse CSS string for font-size
                  const match = styleStr.match(/font-size:\s*([^;]+);?/);
                  if (match) {
                    size = match[1];
                  }
                }
                if (size) {
                  if (fontSize === null) {
                    fontSize = size;
                  } else if (fontSize !== size) {
                    foundDifferent = true;
                    break;
                  }
                }
              }
            }
            // setFontSize(foundDifferent || fontSize === null ? '16px' : fontSize); // Removed
          }
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  useEffect(() => {
    // Add CSS styles for links and lists
    const style = document.createElement('style');
    style.textContent = `
      .editor-link {
        color: #1C8C8C !important;
        text-decoration: underline !important;
        cursor: pointer !important;
      }
      .editor-link:hover {
        color: #0f6b6b !important;
        text-decoration: underline !important;
      }
      .editor-text-bold {
        font-weight: bold !important;
      }
      .editor-text-italic {
        font-style: italic !important;
      }
      .editor-text-underline {
        text-decoration: underline !important;
      }
      
      /* List styles */
      .rich-editor ul {
        list-style-type: disc !important;
        margin-left: 20px !important;
        padding-left: 0 !important;
      }
      .rich-editor ol {
        list-style-type: decimal !important;
        margin-left: 20px !important;
        padding-left: 0 !important;
      }
      .rich-editor li {
        margin: 4px 0 !important;
        padding-left: 8px !important;
      }
      .rich-editor ul ul {
        list-style-type: circle !important;
      }
      .rich-editor ul ul ul {
        list-style-type: square !important;
      }
      .rich-editor ol ol {
        list-style-type: lower-alpha !important;
      }
      .rich-editor ol ol ol {
        list-style-type: lower-roman !important;
      }
      
      /* Do not override inline font-size styles so $patchStyleText works */
      .rich-editor {
        font-size: 16px;
      }
      .rich-editor * {
        font-size: inherit; /* Ensure child elements inherit font size */
      }
      /* Heading styles */
      .rich-editor h1 {
        font-size: 2.25rem !important;
        font-weight: 700 !important;
        line-height: 1.2 !important;
        margin: 1rem 0 !important;
      }
      .rich-editor h2 {
        font-size: 1.875rem !important;
        font-weight: 600 !important;
        line-height: 1.3 !important;
        margin: 0.875rem 0 !important;
      }
      .rich-editor h3 {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        line-height: 1.4 !important;
        margin: 0.75rem 0 !important;
      }
      .rich-editor h4 {
        font-size: 1.25rem !important;
        font-weight: 600 !important;
        line-height: 1.4 !important;
        margin: 0.625rem 0 !important;
      }
      .rich-editor h5 {
        font-size: 1.125rem !important;
        font-weight: 600 !important;
        line-height: 1.4 !important;
        margin: 0.5rem 0 !important;
      }
      .rich-editor h6 {
        font-size: 1rem !important;
        font-weight: 600 !important;
        line-height: 1.4 !important;
        margin: 0.5rem 0 !important;
      }
    `;
    document.head.appendChild(style);

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Check if the clicked element is a link or inside a link
      let linkElement = target;
      while (linkElement && linkElement.tagName !== 'A') {
        linkElement = linkElement.parentElement as HTMLElement;
        if (!linkElement || linkElement === document.body) break;
      }
      
      if (linkElement && linkElement.tagName === 'A') {
        const href = (linkElement as HTMLAnchorElement).href;
        if (href) {
          e.preventDefault();
          e.stopPropagation();
          window.open(href, '_blank', 'noopener,noreferrer');
          return false;
        }
      }
    };

    // Add event listener to document to catch all clicks
    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // In useEffect of LexicalRichBlogEditor, add table styles
  useEffect(() => {
    const tableStyle = document.createElement('style');
    tableStyle.textContent = `
      .rich-editor table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin: 16px 0;
      }
      .rich-editor td, .rich-editor th {
        min-width: 80px;
        padding: 8px;
        border: 1px solid #e5e7eb;
        background: #fcfcfc;
        text-align: left;
      }
      .rich-editor th {
        background: #f3f4f6;
        font-weight: 600;
      }
    `;
    document.head.appendChild(tableStyle);

    return () => {
      if (document.head.contains(tableStyle)) {
        document.head.removeChild(tableStyle);
      }
    };
  }, []);

  return (
    <>
      {/* Toolbar */}
      <Toolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toolbarGroupStyle={toolbarGroupStyle}
        dividerStyle={dividerStyle}
      />
      
      {/* Editor */}
      <div style={{ padding: '16px' }}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="min-h-[200px] p-8 focus:outline-none rich-editor" />}
          placeholder={<div className="text-gray-400">Start writing your blog post...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin 
          validateUrl={(url) => {
            // Basic URL validation
            try {
              new URL(url);
              return true;
            } catch {
              return /^https?:\/\//.test(url);
            }
          }}
        />
        <OnChangePlugin onChange={(editorState: EditorState) => {
          // Convert editorState to HTML or JSON as needed
          // onUpdate?.(htmlOrJson);
        }} />
        {/* Register rich text features (headings, font size, color, etc.) */}
        <RegisterRichTextPlugin />
      </div>
      {/* Render TableToolbarPortal above the editor */}
      {editorRef.current && <TableToolbarPortal editor={editorRef.current} />}
    </>
  );
}

export function LexicalRichBlogEditor({ 
  onUpdate, 
  initialContent = '',
  className = '' 
}: { onUpdate?: (content: string) => void, initialContent?: string, className?: string }) {
  const [activeTab, setActiveTab] = useState<'home' | 'insert'>('home');

  const toolbarGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    padding: '2px',
    borderRadius: '4px',
    margin: '0 -1px',
  };
  
  const dividerStyle = {
    width: '2px',
    height: '24px',
    background: '#1C8C8C',
    margin: '0 6px',
    flexShrink: 0,
  };
    
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div style={{ borderRadius: 8, background: '#fff', minHeight: '500px', position: 'relative' }}>
        {/* Tab Navigation */}
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
                transition: 'all 0.2s' 
              }}
              onMouseDown={e => { e.preventDefault(); setActiveTab('home'); }}
              type="button"
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
                transition: 'all 0.2s' 
              }}
              onMouseDown={e => { e.preventDefault(); setActiveTab('insert'); }}
              type="button"
            >
              Insert
            </button>
          </div>
        </div>
        
        <EditorContent
          onUpdate={onUpdate}
          initialContent={initialContent}
          className={className}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toolbarGroupStyle={toolbarGroupStyle}
          dividerStyle={dividerStyle}
        />
      </div>
    </LexicalComposer>
  );
}

export default LexicalRichBlogEditor;