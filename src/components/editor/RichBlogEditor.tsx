'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Bold, Italic, Underline, List, ListOrdered, ArrowRight, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Video, Quote, Code as CodeIcon, Minus, Link2 as LinkIcon, 
  Image, Upload, FolderOpen, Globe, Play, Hash, Undo2, Redo2,
  Highlighter, Type
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Import Lexical and @lexical/react
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $patchStyleText } from '@lexical/selection';
import { $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode, $insertNodes, SELECTION_CHANGE_COMMAND } from 'lexical';
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  DecoratorNode,
  $applyNodeReplacement
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  ListNode,
  ListItemNode,
} from '@lexical/list';
import { $createLinkNode, LinkNode } from '@lexical/link';
import { $createCodeNode, CodeNode } from '@lexical/code';
import { HorizontalRuleNode, $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { ElementNode, TextNode } from 'lexical';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { $createHeadingNode, HeadingNode, registerRichText } from '@lexical/rich-text';

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

// 1. BlockquoteNode and component
import { $getNodeByKey } from 'lexical';

function BlockquoteComponent({ nodeKey, text }: { nodeKey: string, text: string }) {
  const [editor] = useLexicalComposerContext();
  const [value, setValue] = React.useState(text);
  const [isEditing, setIsEditing] = React.useState(text === 'Edit this quote...');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => { setValue(text); }, [text]);

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
      textareaRef.current.select();
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
    if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <div className="my-4">
    <blockquote
        onClick={handleClick}
        style={{
          margin: '0',
          padding: '12px 20px',
          borderLeft: '3px solid #1C8C8C',
          background: 'transparent',
          position: 'relative',
          cursor: isEditing ? 'text' : 'pointer',
          fontFamily: 'inherit',
        }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          placeholder="Type a quote..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: '15px',
              lineHeight: '1.4',
              fontWeight: '400',
              fontStyle: 'italic',
              color: '#374151',
              fontFamily: 'inherit',
              padding: '0',
              margin: '0',
            }}
          autoFocus
        />
      ) : (
          <div
            style={{
              fontSize: '15px',
              lineHeight: '1.4',
              fontWeight: '400',
              fontStyle: 'italic',
              color: value && value !== 'Edit this quote...' ? '#374151' : '#9ca3af',
              fontFamily: 'inherit',
              whiteSpace: 'pre-wrap',
              minHeight: '21px',
            }}
          >
            {value && value !== 'Edit this quote...' 
              ? value 
              : 'Type a quote...'}
        </div>
      )}
    </blockquote>
    </div>
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

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing, value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
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

function insertCodeBlock(editor: any, language: string) {
  if (!editor) return;
  editor.update(() => {
    const codeNode = $createCodeBlockNode(language, '');
    $insertNodes([codeNode, $createParagraphNode()]);
  });
}

// CTA Button Node and Component
function CtaButtonComponent({ nodeKey, text, url, variant }: { nodeKey: string, text: string, url: string, variant: string }) {
  const tabYellow = '#ffc800';
  const tabText = '#222';
  return (
    <div className="my-4 flex justify-center">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 rounded-lg font-semibold shadow transition-all duration-200"
        style={{
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
        }}
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

import type { Dispatch, SetStateAction } from 'react';

const Toolbar = ({
  activeTab,
  setActiveTab,
  fontSize,
  setFontSize,
  highlightColor,
  setHighlightColor,
  toolbarGroupStyle,
  dividerStyle
}: {
  activeTab: 'home' | 'insert';
  setActiveTab: Dispatch<SetStateAction<'home' | 'insert'>>;
  fontSize: string;
  setFontSize: Dispatch<SetStateAction<string>>;
  highlightColor: string;
  setHighlightColor: Dispatch<SetStateAction<string>>;
  toolbarGroupStyle: React.CSSProperties;
  dividerStyle: React.CSSProperties;
}) => {
  const [editor] = useLexicalComposerContext();
  
  // Dialog states
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showCtaDialog, setShowCtaDialog] = useState(false);
  
  // Form states
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaAlt, setMediaAlt] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('');
  const [codeLangError, setCodeLangError] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [ctaVariant, setCtaVariant] = useState('primary');
  const [showHighlightPalette, setShowHighlightPalette] = useState(false);
  const highlightPaletteRef = useRef<HTMLDivElement>(null);

  // Add state for custom highlight color
  const [customHighlightColor, setCustomHighlightColor] = useState('#FFD700');

  // Font color states
  const [showFontColorPalette, setShowFontColorPalette] = useState(false);
  const [fontColor, setFontColor] = useState('#000000');
  const [customFontColor, setCustomFontColor] = useState('#000000');
  const [showCustomFontColorPicker, setShowCustomFontColorPicker] = useState(false);
  const [showCustomHighlightColorPicker, setShowCustomHighlightColorPicker] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLeftAlign, setIsLeftAlign] = useState(false);
  const [isCenterAlign, setIsCenterAlign] = useState(false);
  const [isRightAlign, setIsRightAlign] = useState(false);
  const [isJustifyAlign, setIsJustifyAlign] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);
  const fontColorPaletteRef = useRef<HTMLDivElement>(null);

  // Premium/classy color palette: fewer, harmonious colors
  const colorPalette = [
    // Grays
    ['#222222', '#666666', '#A0A0A0', '#E0E0E0', '#F5F5F5'],
    // Reds
    ['#D7263D', '#F46036', '#FFB385', '#FFD6BA', '#FFF1E6'],
    // Oranges
    ['#F2994A', '#F2C94C', '#F6E7B4', '#FFF6E0', '#FDF3E7'],
    // Greens
    ['#219653', '#6FCF97', '#B7EFC5', '#E9F9EF', '#F6FFF8'],
    // Blues
    ['#2D9CDB', '#56CCF2', '#B2E0F7', '#EAF6FB', '#F5FCFF'],
    // Purples
    ['#9B51E0', '#BB6BD9', '#E0C3FC', '#F3E8FF', '#F9F6FF'],
    // Pinks
    ['#EB5757', '#FF8FA3', '#FFD6E0', '#FFF0F6', '#FFF8FB'],
  ];

  // Function to update active states based on current selection
  const updateActiveStates = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Check text formatting
        const format = selection.format;
        setIsBold((format & 1) !== 0); // Bold is bit 0
        setIsItalic((format & 2) !== 0); // Italic is bit 1
        setIsUnderline((format & 4) !== 0); // Underline is bit 2
        
        // Check alignment
        const anchorElement = selection.anchor.getNode().getParent();
        if (anchorElement) {
          const elementFormat = anchorElement.getFormat();
          setIsLeftAlign(elementFormat === 1); // left
          setIsCenterAlign(elementFormat === 2); // center
          setIsRightAlign(elementFormat === 3); // right
          setIsJustifyAlign(elementFormat === 4); // justify
        }
        
        // Check list types - simplified for now
        setIsBulletList(false);
        setIsNumberedList(false);
      }
    });
  };

  // Update active states when selection changes
  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateActiveStates();
      });
    });
    return unregister;
  }, [editor]);

  // Handle click outside to close palettes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (highlightPaletteRef.current && !highlightPaletteRef.current.contains(event.target as Node)) {
        setShowHighlightPalette(false);
      }
      if (fontColorPaletteRef.current && !fontColorPaletteRef.current.contains(event.target as Node)) {
        setShowFontColorPalette(false);
      }
    };

    if (showHighlightPalette || showFontColorPalette) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHighlightPalette, showFontColorPalette]);

  const applyHighlight = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (color === 'transparent') {
          // Remove highlight by setting background-color to empty
          $patchStyleText(selection, { 'background-color': '' });
        } else {
          $patchStyleText(selection, { 'background-color': color });
        }
      }
    });
    setHighlightColor(color);
    setShowHighlightPalette(false);
    // Restore focus to editor
    editor.focus();
  };

  const applyFontColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (color === 'default') {
          // Remove font color by setting color to empty
          $patchStyleText(selection, { 'color': '' });
        } else {
          $patchStyleText(selection, { 'color': color });
        }
      }
    });
    setFontColor(color);
    setShowFontColorPalette(false);
    // Restore focus to editor
    editor.focus();
  };

  const insertHorizontalRule = () => {
    editor.update(() => {
      const hrNode = $createHorizontalRuleNode();
      $insertNodes([hrNode, $createParagraphNode()]);
    });
  };

  const insertLink = () => {
    if (!linkUrl || !linkText) return;
    editor.update(() => {
      const linkNode = $createLinkNode(linkUrl);
      linkNode.append($createTextNode(linkText));
      $insertNodes([linkNode]);
    });
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const insertMedia = () => {
    if (!mediaUrl) return;
    editor.update(() => {
      if (mediaType === 'image') {
        const imageNode = new ImageNode(mediaUrl, mediaAlt);
      $insertNodes([imageNode, $createParagraphNode()]);
      } else {
        const videoNode = new VideoNode(mediaUrl, mediaTitle);
      $insertNodes([videoNode, $createParagraphNode()]);
      }
    });
    setShowMediaDialog(false);
    setMediaUrl('');
    setMediaAlt('');
    setMediaTitle('');
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
  }) => {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
      // Restore focus to editor after a short delay
      setTimeout(() => {
        editor.focus();
      }, 10);
    };

        return (
    <button
      type="button"
        onClick={handleClick}
      title={title}
      style={{
        padding: '10px',
        border: 'none',
        background: active 
          ? 'linear-gradient(135deg, rgba(28, 140, 140, 0.12) 0%, rgba(28, 140, 140, 0.08) 100%)' 
          : 'transparent',
        color: active ? '#1C8C8C' : '#64748b',
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '14px',
        minWidth: '40px',
        height: '40px',
        position: 'relative',
        boxShadow: active 
          ? '0 2px 8px rgba(28, 140, 140, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
          : '0 1px 3px rgba(0, 0, 0, 0.02)',
        border: active ? '1px solid rgba(28, 140, 140, 0.2)' : '1px solid transparent',
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(28, 140, 140, 0.06) 0%, rgba(28, 140, 140, 0.04) 100%)';
          e.currentTarget.style.color = '#1C8C8C';
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(28, 140, 140, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.border = '1px solid rgba(28, 140, 140, 0.15)';
        } else {
          e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(28, 140, 140, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#64748b';
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.02)';
          e.currentTarget.style.border = '1px solid transparent';
        } else {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(28, 140, 140, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
        }
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
      }}
      onMouseUp={(e) => {
        if (!active) {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        } else {
          e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
        }
      }}
    >
      {children}
    </button>
  );
  };

  const [heading, setHeading] = useState('normal');
  
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

  const fontSizes = Array.from({ length: 41 }, (_, i) => `${8 + i * 2}px`);
  const [customFontSize, setCustomFontSize] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Helper to set font size for current selection
  function setFontSizeForSelection(editor: any, fontSize: string) {
                      editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { 'font-size': fontSize });
      }
    });
  }

  // Track current font size from selection
  useEffect(() => {
    if (!editor) return;
    
    const updateFontSize = () => {
      editor.getEditorState().read(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          if (nodes.length > 0) {
            const firstNode = nodes[0];
            if (firstNode.getType() === 'text') {
              const style = (firstNode as any).getStyle();
              if (style) {
                const fontSizeMatch = style.match(/font-size:\s*([^;]+)/);
                if (fontSizeMatch) {
                  setFontSize(fontSizeMatch[1]);
                }
              }
            }
          }
        }
      });
    };

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateFontSize();
      });
    });

    return unregister;
  }, [editor, setFontSize]);

  return (
    <>
      <div style={{ 
        padding: '12px 24px', 
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)', 
        display: 'flex', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.6) 0%, rgba(255, 255, 255, 0.8) 100%)',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {activeTab === 'home' && (
            <>
              {/* Formatting Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton active={isBold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold' as any)} title="Bold"><Bold size={20} /></ToolbarButton>
                <ToolbarButton active={isItalic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic' as any)} title="Italic"><Italic size={20} /></ToolbarButton>
                <ToolbarButton active={isUnderline} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline' as any)} title="Underline"><Underline size={20} /></ToolbarButton>
                
                {/* Font Size Dropdown */}
                <Select
                  value={showCustomInput ? 'custom' : fontSize}
                  onOpenChange={(open: boolean) => { if (open) saveSelection(); if (!open) setShowCustomInput(false); }}
                  onValueChange={(val: string) => {
                    restoreSelection();
                    if (val === 'custom') {
                      setShowCustomInput(true);
                    } else {
                      setShowCustomInput(false);
                      setFontSize(val);
                      setFontSizeForSelection(editor, val);
                      // Restore focus to editor
                      setTimeout(() => {
                        editor.focus();
                      }, 10);
                    }
                  }}
                >
                  <SelectTrigger className="ml-2 w-[90px]" onMouseDown={(e: React.MouseEvent) => e.preventDefault()}>
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizes.map(sizeStr => (
                      <SelectItem
                        key={sizeStr}
                        value={sizeStr}
                        className="focus:bg-[#FFC107] data-[state=checked]:bg-[#FFC107]"
                      >
                        <span>{sizeStr}</span>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="focus:bg-[#FFC107] data-[state=checked]:bg-[#FFC107]">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                
                {showCustomInput && (
                  <input
                    type="number"
                    min={8}
                    max={200}
                    step={1}
                    value={customFontSize}
                    onChange={e => setCustomFontSize(e.target.value)}
                    onBlur={() => {
                      if (customFontSize) {
                        const px = `${customFontSize}px`;
                        setFontSize(px);
                        setFontSizeForSelection(editor, px);
                      }
                      setShowCustomInput(false);
                      // Restore focus to editor
                      setTimeout(() => {
                        editor.focus();
                      }, 10);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    style={{ width: 60, marginLeft: 8, border: '1px solid #e5e7eb', borderRadius: 4, padding: '2px 6px' }}
                    autoFocus
                    placeholder="px"
                  />
                )}
                

                
                {/* Font Color Tool */}
                <div style={{ position: 'relative', marginLeft: 8 }}>
                  <ToolbarButton 
                    active={showFontColorPalette} 
                    onClick={() => setShowFontColorPalette(!showFontColorPalette)} 
                    title="Font Color"
                  >
                    <div style={{ position: 'relative' }}>
                      <Type size={20} />
                      <div style={{
                        position: 'absolute',
                        bottom: -2,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: fontColor,
                        borderRadius: '1px'
                      }} />
                    </div>
                  </ToolbarButton>
                  
                  {/* Font Color Palette Popup */}
                  {showFontColorPalette && (
                    <div
                      ref={fontColorPaletteRef}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 1000,
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '14px',
                        padding: '20px 24px 16px 24px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        minWidth: 320,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      {/* Reset option */}
                      <button
                        onClick={() => applyFontColor('default')}
                        title="Reset"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#3c4043', fontWeight: 500, fontSize: 14, fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
                        }}
                      >
                        <div style={{
                          width: 20,
                          height: 20,
                          background: '#fce8e6',
                          border: '1px solid #fad2cf',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#d93025',
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}>
                          ✕
                        </div>
                        Reset
                      </button>
                      {/* Color grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${colorPalette.length}, 1fr)`,
                          gap: 12,
                          marginBottom: 18,
                        }}
                      >
                        {colorPalette.map((col, colIdx) =>
                          col.map((color, rowIdx) => (
                            <button
                              key={`font-${colIdx}-${rowIdx}`}
                              onClick={() => applyFontColor(color)}
                              title={color}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '4px',
                                border: fontColor === color ? '2px solid #1a73e8' : '1px solid #dadce0',
                                background: color,
                                margin: 0,
                                padding: 0,
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'all 0.1s ease',
                                position: 'relative'
                              }}
                              onMouseEnter={e => { 
                                if (fontColor !== color) {
                                  e.currentTarget.style.transform = 'scale(1.1)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                                }
                              }}
                              onMouseLeave={e => { 
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {fontColor === color && (
                                <div style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: 12,
                                  height: 8,
                                  border: '2px solid white',
                                  borderTop: 'none',
                                  borderRight: 'none',
                                  transform: 'translate(-50%, -60%) rotate(-45deg)',
                                }} />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                      {/* Custom color section */}
                      <div style={{ 
                        borderTop: '1px solid #dadce0', 
                        marginTop: '8px', 
                        paddingTop: '8px' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                          <div style={{
                            width: 20,
                            height: 20,
                            border: '1px solid #dadce0',
                            borderRadius: '2px',
                            background: `linear-gradient(45deg, 
                              #ff0000 0%, #ff0000 14.28%, 
                              #ff8000 14.28%, #ff8000 28.56%, 
                              #ffff00 28.56%, #ffff00 42.84%, 
                              #00ff00 42.84%, #00ff00 57.12%, 
                              #0000ff 57.12%, #0000ff 71.4%, 
                              #8000ff 71.4%, #8000ff 85.68%, 
                              #ff00ff 85.68%, #ff00ff 100%)`,
                            position: 'relative',
                            cursor: 'pointer'
                          }} 
                          onClick={() => setShowCustomFontColorPicker(!showCustomFontColorPicker)}
                          />
                          <span style={{ fontSize: '14px', color: '#3c4043', fontFamily: 'Google Sans, Roboto, Arial, sans-serif' }}>
                            Custom
                          </span>
                        </div>
                        
                        {showCustomFontColorPicker && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            background: 'white',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1001,
                            minWidth: '200px'
                          }}>
                            <input
                              type="color"
                              value={customFontColor}
                              onChange={(e) => setCustomFontColor(e.target.value)}
                              style={{
                                width: '100%',
                                height: '40px',
                                border: '1px solid #dadce0',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: '8px' }}>
                              <button
                                onClick={() => {
                                  applyFontColor(customFontColor);
                                  setShowCustomFontColorPicker(false);
                                }}
                                style={{
                                  padding: '6px 12px',
                                  background: '#1a73e8',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}
                              >
                                Apply
                              </button>
                              <button
                                onClick={() => setShowCustomFontColorPicker(false)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#f1f3f4',
                                  color: '#3c4043',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Highlight Tool */}
                <div style={{ position: 'relative' }}>
                  <ToolbarButton 
                    active={showHighlightPalette} 
                    onClick={() => setShowHighlightPalette(!showHighlightPalette)} 
                    title="Text highlight color"
                  >
                    <div style={{ position: 'relative' }}>
                      <Highlighter size={20} />
                      <div style={{
                        position: 'absolute',
                        bottom: -2,
                        left: 2,
                        right: 2,
                        height: 3,
                        background: highlightColor === 'transparent' ? '#ffff00' : highlightColor,
                        borderRadius: '1px'
                      }} />
                    </div>
                  </ToolbarButton>
                  
                  {/* Google Docs Style Highlight Palette */}
                  {showHighlightPalette && (
                    <div
                      ref={highlightPaletteRef}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 1000,
                        background: 'white',
                        border: '1px solid #dadce0',
                        borderRadius: '8px',
                        padding: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        minWidth: 240,
                      }}
                    >
                      {/* Reset option */}
                      <div style={{ marginBottom: '8px' }}>
                        <button
                          onClick={() => applyHighlight('transparent')}
                          title="Reset"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            width: '100%',
                            padding: '6px 8px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '14px',
                            color: '#3c4043',
                            fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f1f3f4'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                        >
                          <div style={{
                            width: 20,
                            height: 20,
                            border: '1px solid #dadce0',
                            borderRadius: '2px',
                            background: 'white',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <div style={{
                              width: 14,
                              height: 1,
                              background: '#ea4335',
                              transform: 'rotate(45deg)',
                              position: 'absolute'
                            }} />
                            <div style={{
                              width: 14,
                              height: 1,
                              background: '#ea4335',
                              transform: 'rotate(-45deg)',
                              position: 'absolute'
                            }} />
                          </div>
                          Reset
                        </button>
                      </div>
                      
                      {/* Google Docs highlight colors */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '4px',
                        padding: '4px 0'
                      }}>
                        {[
                          '#ffff00', // Yellow
                          '#00ff00', // Lime
                          '#00ffff', // Cyan
                          '#ff00ff', // Magenta
                          '#ff0000', // Red
                          '#0000ff', // Blue
                          '#00ff80', // Spring Green
                          '#8000ff', // Purple
                          '#ff8000', // Orange
                          '#ff0080', // Deep Pink
                          '#80ff00', // Chartreuse
                          '#0080ff', // Dodger Blue
                          '#ff8080', // Light Red
                          '#8080ff', // Light Blue
                          '#80ff80', // Light Green
                          '#ffff80', // Light Yellow
                          '#ff80ff', // Light Magenta
                          '#80ffff', // Light Cyan
                          '#ffc080', // Peach
                          '#c080ff', // Light Purple
                        ].map((color, index) => (
                          <button
                            key={index}
                            onClick={() => applyHighlight(color)}
                            title={`Highlight color ${index + 1}`}
                            style={{
                              width: 32,
                              height: 32,
                              border: highlightColor === color ? '2px solid #1a73e8' : '1px solid #dadce0',
                              borderRadius: '4px',
                              background: color,
                              margin: 0,
                              padding: 0,
                              cursor: 'pointer',
                              outline: 'none',
                              transition: 'all 0.1s ease',
                              position: 'relative'
                            }}
                            onMouseEnter={e => { 
                              if (highlightColor !== color) {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                              }
                            }}
                            onMouseLeave={e => { 
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {highlightColor === color && (
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 12,
                                height: 8,
                                border: '2px solid white',
                                borderTop: 'none',
                                borderRight: 'none',
                                transform: 'translate(-50%, -60%) rotate(-45deg)',
                              }} />
                            )}
                          </button>
                        ))}
                      </div>
                      
                      {/* Custom color section */}
                      <div style={{ 
                        borderTop: '1px solid #dadce0', 
                        marginTop: '8px', 
                        paddingTop: '8px' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                          <div style={{
                            width: 20,
                            height: 20,
                            border: '1px solid #dadce0',
                            borderRadius: '2px',
                            background: `linear-gradient(45deg, 
                              #ff0000 0%, #ff0000 14.28%, 
                              #ff8000 14.28%, #ff8000 28.56%, 
                              #ffff00 28.56%, #ffff00 42.84%, 
                              #00ff00 42.84%, #00ff00 57.12%, 
                              #0000ff 57.12%, #0000ff 71.4%, 
                              #8000ff 71.4%, #8000ff 85.68%, 
                              #ff00ff 85.68%, #ff00ff 100%)`,
                            position: 'relative',
                            cursor: 'pointer'
                          }} 
                          onClick={() => setShowCustomHighlightColorPicker(!showCustomHighlightColorPicker)}
                          />
                          <span style={{ fontSize: '14px', color: '#3c4043', fontFamily: 'Google Sans, Roboto, Arial, sans-serif' }}>
                            Custom
                          </span>
                        </div>
                        
                        {showCustomHighlightColorPicker && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            background: 'white',
                            border: '1px solid #dadce0',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 1001,
                            minWidth: '200px'
                          }}>
                            <input
                              type="color"
                              value={customHighlightColor}
                              onChange={(e) => setCustomHighlightColor(e.target.value)}
                              style={{
                                width: '100%',
                                height: '40px',
                                border: '1px solid #dadce0',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: '8px' }}>
                              <button
                                onClick={() => {
                                  applyHighlight(customHighlightColor);
                                  setShowCustomHighlightColorPicker(false);
                                }}
                                style={{
                                  padding: '6px 12px',
                                  background: '#1a73e8',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}
                              >
                                Apply
                              </button>
                              <button
                                onClick={() => setShowCustomHighlightColorPicker(false)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#f1f3f4',
                                  color: '#3c4043',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={dividerStyle}></div>
              
              {/* Alignment Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton active={isLeftAlign} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left' as any)} title="Align Left"><AlignLeft size={20} /></ToolbarButton>
                <ToolbarButton active={isCenterAlign} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center' as any)} title="Align Center"><AlignCenter size={20} /></ToolbarButton>
                <ToolbarButton active={isRightAlign} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right' as any)} title="Align Right"><AlignRight size={20} /></ToolbarButton>
                <ToolbarButton active={isJustifyAlign} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify' as any)} title="Align Justify"><AlignJustify size={20} /></ToolbarButton>
              </div>
              <div style={dividerStyle}></div>
              
              {/* List Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton active={isBulletList} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} title="Bulleted List"><List size={20} /></ToolbarButton>
                <ToolbarButton active={isNumberedList} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} title="Numbered List"><ListOrdered size={20} /></ToolbarButton>
              </div>
            </>
          )}
          
          {activeTab === 'insert' && (
            <>
              {/* Media Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton active={false} onClick={() => setShowMediaDialog(true)} title="Insert Media">
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image size={16} style={{ position: 'absolute', top: -2, left: -2 }} />
                    <Video size={16} style={{ position: 'absolute', bottom: -2, right: -2 }} />
                  </div>
                </ToolbarButton>
              </div>
              <div style={dividerStyle}></div>
              
              {/* Content Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton active={false} onClick={() => setShowLinkDialog(true)} title="Insert Link"><LinkIcon size={20} /></ToolbarButton>
              </div>
              <div style={dividerStyle}></div>
              
              {/* Formatting Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton active={false} onClick={() => insertBlockquote(editor)} title="Insert Blockquote"><Quote size={20} /></ToolbarButton>
                <ToolbarButton active={false} onClick={() => setShowCodeDialog(true)} title="Insert Code Block"><CodeIcon size={20} /></ToolbarButton>
                <ToolbarButton active={false} onClick={() => insertHorizontalRule()} title="Insert Divider"><Minus size={20} /></ToolbarButton>
              </div>
              <div style={dividerStyle}></div>
              
              {/* Action Group */}
              <div style={toolbarGroupStyle}>
                <ToolbarButton active={false} onClick={() => setShowCtaDialog(true)} title="Insert CTA Button"><ArrowRight size={20} /></ToolbarButton>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* All dialogs for insert tools */}
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
            <Button onClick={insertLink}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Dialog */}
      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Media</DialogTitle>
            <DialogDescription>Add an image or video to your content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Media Type Toggle */}
            <div className="flex gap-2 p-1 bg-gray-50 rounded-lg">
              <button
                onClick={() => setMediaType('image')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  mediaType === 'image' 
                    ? 'bg-gray-800 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Image size={16} />
                  Image
            </div>
              </button>
              <button
                onClick={() => setMediaType('video')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  mediaType === 'video' 
                    ? 'bg-gray-800 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Video size={16} />
                  Video
          </div>
              </button>
            </div>
            
            {/* Upload Options */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = mediaType === 'image' ? 'image/*' : 'video/*';
                  input.onchange = (e: any) => {
                    const file = e.target.files[0];
                    if (file) {
                      const localUrl = URL.createObjectURL(file);
                      setMediaUrl(localUrl);
                    }
                  };
                  input.click();
                }}
              >
                <Upload size={16} className="mr-2" />
                Upload from Device
              </Button>
              <Button
                variant="outline"
                onClick={() => alert('Google Drive upload not implemented in this demo.')}
              >
                <FolderOpen size={16} className="mr-2" />
                Upload from Drive
              </Button>
            </div>
            
            {/* URL Input */}
            <Input
              placeholder={mediaType === 'image' ? 'Image URL' : 'Video URL (YouTube, Vimeo, or direct link)'}
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
            
            {/* Conditional Inputs */}
            {mediaType === 'image' ? (
              <Input
                placeholder="Alt text (optional)"
                value={mediaAlt}
                onChange={(e) => setMediaAlt(e.target.value)}
              />
            ) : (
            <Input
              placeholder="Video title (optional)"
                value={mediaTitle}
                onChange={(e) => setMediaTitle(e.target.value)}
            />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMediaDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertMedia}>
              Insert {mediaType === 'image' ? 'Image' : 'Video'}
            </Button>
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

// Editor configuration
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
    ImageNode,
    VideoNode,
    BlockquoteNode,
    CodeBlockNode,
    CtaButtonNode,
    HeadingNode,
  ],
};

export function LexicalRichBlogEditor({ 
  onUpdate, 
  initialContent = '',
  className = '' 
}: { onUpdate?: (content: string) => void, initialContent?: string, className?: string }) {
  const [activeTab, setActiveTab] = useState<'home' | 'insert'>('home');
  const [fontSize, setFontSize] = useState('16px');
  const [highlightColor, setHighlightColor] = useState('#ffff00');

  useEffect(() => {
    // Add CSS styles for links and headings
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
      .rich-editor {
        font-size: 16px;
      }
      .rich-editor h1 {
        font-size: 2.25rem !important;
        font-weight: 700 !important;
        line-height: 1.2 !important;
        margin: 1rem 0 !important;
      }
      .rich-editor h2 {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        line-height: 1.3 !important;
        margin: 0.75rem 0 !important;
      }
      .rich-editor h3 {
        font-size: 1.17rem !important;
        font-weight: 500 !important;
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

  const toolbarGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    padding: '6px',
    borderRadius: '12px',
    margin: '0 3px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    position: 'relative',
  };
  
  const dividerStyle = {
    width: '2px',
    height: '32px',
    background: 'linear-gradient(to bottom, transparent 0%, rgba(28, 140, 140, 0.15) 20%, rgba(28, 140, 140, 0.4) 50%, rgba(28, 140, 140, 0.15) 80%, transparent 100%)',
    margin: '0 12px',
    flexShrink: 0,
    borderRadius: '1px',
    position: 'relative',
  };
    
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div style={{ 
        borderRadius: '20px', 
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)', 
        minHeight: '600px', 
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(226, 232, 240, 0.6)',
        overflow: 'hidden',
        transform: 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'editorFloat 6s ease-in-out infinite',
      }}>
        <style>{`
          @keyframes editorFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-2px) scale(1.001); }
          }
        `}</style>
        {/* Tab Navigation */}
        <div style={{ 
          padding: '16px 24px 12px 24px', 
          borderTopLeftRadius: '16px', 
          borderTopRightRadius: '16px', 
          display: 'flex', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '2px', 
            padding: '4px', 
            borderRadius: '12px', 
            width: 'fit-content',
            background: 'rgba(248, 250, 252, 0.8)',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <button
              style={{ 
                padding: '8px 24px', 
                border: 'none', 
                background: activeTab === 'home' ? 'linear-gradient(135deg, #1C8C8C 0%, #16a085 100%)' : 'transparent', 
                color: activeTab === 'home' ? 'white' : '#64748b', 
                fontWeight: activeTab === 'home' ? 600 : 500, 
                fontSize: '14px', 
                borderRadius: '10px', 
                cursor: 'pointer', 
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeTab === 'home' ? '0 2px 8px rgba(28, 140, 140, 0.25)' : 'none',
                letterSpacing: '0.025em'
              }}
              onMouseDown={e => { e.preventDefault(); setActiveTab('home'); }}
              onMouseEnter={e => {
                if (activeTab !== 'home') {
                  e.currentTarget.style.background = 'rgba(100, 116, 139, 0.08)';
                  e.currentTarget.style.color = '#1C8C8C';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'home') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
              type="button"
            >
              Home
            </button>
            <button
              style={{ 
                padding: '8px 24px', 
                border: 'none', 
                background: activeTab === 'insert' ? 'linear-gradient(135deg, #1C8C8C 0%, #16a085 100%)' : 'transparent', 
                color: activeTab === 'insert' ? 'white' : '#64748b', 
                fontWeight: activeTab === 'insert' ? 600 : 500, 
                fontSize: '14px', 
                borderRadius: '10px', 
                cursor: 'pointer', 
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeTab === 'insert' ? '0 2px 8px rgba(28, 140, 140, 0.25)' : 'none',
                letterSpacing: '0.025em'
              }}
              onMouseDown={e => { e.preventDefault(); setActiveTab('insert'); }}
              onMouseEnter={e => {
                if (activeTab !== 'insert') {
                  e.currentTarget.style.background = 'rgba(100, 116, 139, 0.08)';
                  e.currentTarget.style.color = '#1C8C8C';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'insert') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
              type="button"
            >
              Insert
            </button>
          </div>
        </div>
        
        {/* Toolbar */}
        <Toolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          fontSize={fontSize}
          setFontSize={setFontSize}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
          toolbarGroupStyle={toolbarGroupStyle}
          dividerStyle={dividerStyle}
        />
        
        {/* Editor */}
        <div style={{ 
          padding: '24px 32px 32px 32px',
          background: 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)',
          minHeight: '400px'
        }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="min-h-[300px] focus:outline-none rich-editor" 
                style={{
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(226, 232, 240, 0.6)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: '#1f2937',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
                onFocus={e => {
                  e.currentTarget.style.border = '1px solid rgba(28, 140, 140, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(28, 140, 140, 0.1)';
                  e.currentTarget.style.background = '#ffffff';
                }}
                onBlur={e => {
                  e.currentTarget.style.border = '1px solid rgba(226, 232, 240, 0.6)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                }}
              />
            }
            placeholder={
              <div style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                color: '#9ca3af',
                fontSize: '16px',
                fontStyle: 'italic',
                pointerEvents: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                Start writing your blog post...
              </div>
            }
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
          <OnChangePlugin onChange={editorState => {
            // Convert editorState to HTML or JSON as needed
            // onUpdate?.(htmlOrJson);
          }} />
        </div>
      </div>
    </LexicalComposer>
  );
}

export default LexicalRichBlogEditor;