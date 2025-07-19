import { BaseEditor, BaseText, BaseElement } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  fontSize?: number;
} & BaseText;

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
  | { type: 'table'; children: TableRowElement[]; align?: string }
  | { type: 'table-row'; children: TableCellElement[]; align?: string }
  | { type: 'table-cell'; children: CustomText[]; align?: string };

type TableCellElement = {
  type: 'table-cell';
  children: CustomText[];
  align?: string;
};

type TableRowElement = {
  type: 'table-row';
  children: TableCellElement[];
  align?: string;
};

type TableElement = {
  type: 'table';
  children: TableRowElement[];
  align?: string;
};
