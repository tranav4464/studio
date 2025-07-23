'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, CheckSquare, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Video, Quote, Code as CodeIcon, Minus, ArrowRight, Table, Link2 as LinkIcon, 
  Image, Upload, FolderOpen, Globe, Play
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
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { $patchStyleText } from '@lexical/selection';
import { $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode, $insertNodes } from 'lexical';
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  DecoratorNode,
  $applyNodeReplacement
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  ListNode,
  ListItemNode,
} from '@lexical/list';
import { $createLinkNode, LinkNode } from '@lexical/link';
import { $createTableNode, $createTableCellNode, $createTableRowNode, TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { $createCodeNode, CodeNode } from '@lexical/code';
import { HorizontalRuleNode, $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

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
  React.useEffect(() => { setValue(text); }, [text]);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && typeof (node as any).setText === 'function') (node as any).setText(e.target.value);
    });
  };
  return (
    <blockquote
      className="my-4 py-2 px-2 rounded-lg text-gray-800 relative"
      style={{ background: '#e6f9f9', borderLeft: '5px solid #ffe066' }}
    >
      <textarea
        className="block w-full bg-transparent border-none outline-none resize-none text-lg italic"
        value={value}
        onChange={handleChange}
        rows={1}
      />
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
  setText(text: string) { this.__text = text; }
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

// 3. Code block dialog: only ask for language
// In Toolbar, on code block button click: setShowCodeDialog(true)
// Dialog: only Input for language
// On submit: insertCodeBlock(editor, codeLanguage)
function insertCodeBlock(editor: any, language: string) {
  if (!editor) return;
  editor.update(() => {
    const codeNode = $createCodeNode(language);
    $insertNodes([codeNode, $createParagraphNode()]);
  });
}

// Toolbar component
function Toolbar({ activeTab, setActiveTab, fontSize, setFontSize, fontColor, setFontColor, toolbarGroupStyle, dividerStyle }) {
  const [editor] = useLexicalComposerContext();
  // Dialog states
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showCtaDialog, setShowCtaDialog] = useState(false);
  // Form states
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);
  const [codeLanguage, setCodeLanguage] = useState('');
  const [codeLangError, setCodeLangError] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [ctaVariant, setCtaVariant] = useState('primary');
  // Insert helpers (use the insertBlockquote and insertCodeBlock from above)
  const formatText = (format: string) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatElement = (format: string) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  };

  const insertList = (type: 'bullet' | 'number' | 'check') => {
    if (type === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else if (type === 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else if (type === 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    }
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

  const insertImage = () => {
    if (!imageUrl) return;
    editor.update(() => {
      const imageNode = new ImageNode(imageUrl, imageAlt);
      $insertNodes([imageNode, $createParagraphNode()]);
    });
    setShowImageDialog(false);
    setImageUrl('');
    setImageAlt('');
  };

  const insertVideo = () => {
    if (!videoUrl) return;
    editor.update(() => {
      const videoNode = new VideoNode(videoUrl, videoTitle);
      $insertNodes([videoNode, $createParagraphNode()]);
    });
    setShowVideoDialog(false);
    setVideoUrl('');
    setVideoTitle('');
  };

  const insertTable = () => {
    editor.update(() => {
      const tableNode = $createTableNode();
      for (let i = 0; i < 2; i++) {
        const rowNode = $createTableRowNode();
        for (let j = 0; j < 3; j++) {
          const cellNode = $createTableCellNode();
          cellNode.append($createParagraphNode());
          rowNode.append(cellNode);
        }
        tableNode.append(rowNode);
      }
      $insertNodes([tableNode, $createParagraphNode()]);
    });
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
      style={{
        padding: '6px',
        border: 'none',
        background: active ? '#e6f9f9' : 'transparent',
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
          e.currentTarget.style.background = '#f0f9ff';
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

  return (
    <>
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {activeTab === 'home' && (
            <>
              {/* Formatting Group */}
              <div style={toolbarGroupStyle}>
                <button className="p-1.5 mx-0.5 rounded" title="Bold" onMouseDown={e => { e.preventDefault(); editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'); }}><Bold size={20} /></button>
                <button className="p-1.5 mx-0.5 rounded" title="Italic" onMouseDown={e => { e.preventDefault(); editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'); }}><Italic size={20} /></button>
                <button className="p-1.5 mx-0.5 rounded" title="Underline" onMouseDown={e => { e.preventDefault(); editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline'); }}><Underline size={20} /></button>
                <select value={fontSize} onChange={e => { setFontSize(e.target.value); editor.update(() => { const selection = $getSelection(); if ($isRangeSelection(selection)) { $patchStyleText(selection, { fontSize: e.target.value }); } }); }} style={{ marginLeft: 8, borderRadius: 4, border: '1px solid #e5e7eb', padding: '2px 6px' }}>{[12, 14, 16, 18, 20, 24, 28, 32].map(size => (<option key={size} value={`${size}px`}>{size}px</option>))}</select>
                <input type="color" value={fontColor} onChange={e => { setFontColor(e.target.value); editor.update(() => { const selection = $getSelection(); if ($isRangeSelection(selection)) { $patchStyleText(selection, { color: e.target.value }); } }); }} style={{ marginLeft: 8, width: 28, height: 28, border: 'none', background: 'none' }} />
              </div>
              <div style={dividerStyle}></div>
              {/* Alignment Group */}
              <div style={toolbarGroupStyle}>
                <button className="p-1.5 mx-0.5 rounded" title="Align Left" onMouseDown={e => { e.preventDefault(); editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'); }}><AlignLeft size={20} /></button>
                <button className="p-1.5 mx-0.5 rounded" title="Align Center" onMouseDown={e => { e.preventDefault(); editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'); }}><AlignCenter size={20} /></button>
                <button className="p-1.5 mx-0.5 rounded" title="Align Right" onMouseDown={e => { e.preventDefault(); editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'); }}><AlignRight size={20} /></button>
                <button className="p-1.5 mx-0.5 rounded" title="Align Justify" onMouseDown={e => { e.preventDefault(); editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify'); }}><AlignJustify size={20} /></button>
              </div>
              <div style={dividerStyle}></div>
              {/* List Group */}
              <div style={toolbarGroupStyle}>
                <button className="p-1.5 mx-0.5 rounded" title="Bulleted List" onMouseDown={e => { e.preventDefault(); editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined); }}><List size={20} /></button>
                <button className="p-1.5 mx-0.5 rounded" title="Numbered List" onMouseDown={e => { e.preventDefault(); editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined); }}><ListOrdered size={20} /></button>
                <button className="p-1.5 mx-0.5 rounded" title="Checklist" onMouseDown={e => { e.preventDefault(); editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined); }}><CheckSquare size={20} /></button>
              </div>
            </>
          )}
          {activeTab === 'insert' && (
            <>
              {/* Media Group */}
              <div style={toolbarGroupStyle}>
                <button className="p-1.5 mx-0.5 rounded" title="Insert Image" onMouseDown={e => { e.preventDefault(); setShowImageDialog(true); }}><Image size={20} /></button>
                <button className="p-1.5 mx-0.5 rounded" title="Insert Video" onMouseDown={e => { e.preventDefault(); setShowVideoDialog(true); }}><Video size={20} /></button>
              </div>
              <div style={dividerStyle}></div>
              {/* Content Group */}
              <div style={toolbarGroupStyle}>
                <button className="p-1.5 mx-0.5 rounded" title="Insert Link" onMouseDown={e => { e.preventDefault(); setShowLinkDialog(true); }}><LinkIcon size={20} /></button>
                <button className="p-1.5 mx-0.5 rounded" title="Insert Table" onMouseDown={e => { e.preventDefault(); setShowTableDialog(true); }}><Table size={20} /></button>
              </div>
              <div style={dividerStyle}></div>
              {/* Formatting Group */}
              <div style={toolbarGroupStyle}>
                <button className="p-1.5 mx-0.5 rounded" title="Insert Blockquote" onMouseDown={e => { e.preventDefault(); insertBlockquote(editor); }}><Quote size={20} /></button>
                <button className="p-1.5 mx-0.5 rounded" title="Insert Code Block" onMouseDown={e => { e.preventDefault(); setShowCodeDialog(true); }}><CodeIcon size={20} /></button>
                <button className="p-1.5 mx-0.5 rounded" title="Insert Divider" onMouseDown={e => { e.preventDefault(); editor.dispatchCommand('INSERT_HORIZONTAL_RULE', undefined); }}><Minus size={20} /></button>
              </div>
              <div style={dividerStyle}></div>
              {/* Action Group */}
              <div style={toolbarGroupStyle}>
                <button className="p-1.5 mx-0.5 rounded" title="Insert CTA Button" onMouseDown={e => { e.preventDefault(); setShowCtaDialog(true); }}><ArrowRight size={20} /></button>
              </div>
            </>
          )}
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
            <Button onClick={insertLink}>Insert Link</Button>
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
            <Button onClick={insertImage}>Insert Image</Button>
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
            <Button onClick={insertVideo}>Insert Video</Button>
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
            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
              <option value="bash">Bash</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              insertCodeBlock(editor, codeLanguage);
              setShowCodeDialog(false);
            }}>
              Insert Code Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
    TableNode,
    TableCellNode,
    TableRowNode,
    ImageNode,
    VideoNode,
    CodeNode,
    BlockquoteNode,
  ],
};

export function LexicalRichBlogEditor({ 
  onUpdate, 
  initialContent = '',
  className = '' 
}: { onUpdate?: (content: string) => void, initialContent?: string, className?: string }) {
  const [activeTab, setActiveTab] = useState<'home' | 'insert'>('home');
  const [fontSize, setFontSize] = useState('16px');
  const [fontColor, setFontColor] = useState('#000000');

  useEffect(() => {
    // Add CSS styles for links
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
    `;
    document.head.appendChild(style);

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      console.log('Click detected on:', target.tagName, target);
      
      // Check if the clicked element is a link or inside a link
      let linkElement = target;
      while (linkElement && linkElement.tagName !== 'A') {
        linkElement = linkElement.parentElement as HTMLElement;
        if (!linkElement || linkElement === document.body) break;
      }
      
      if (linkElement && linkElement.tagName === 'A') {
        const href = (linkElement as HTMLAnchorElement).href;
        console.log('Link found with href:', href);
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
        
        {/* Toolbar */}
        <Toolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontColor={fontColor}
          setFontColor={setFontColor}
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
          <TablePlugin />
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