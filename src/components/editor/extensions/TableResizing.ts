import { Extension, Node as ProseNode, Mark, Attribute, NodeViewRenderer, NodeViewRendererProps, Node as TiptapNode } from '@tiptap/core';
import { Node as ProseMirrorNode, NodeType, ResolvedPos } from 'prosemirror-model';
import { Decoration, DecorationSource } from 'prosemirror-view';

type GlobalAttributes = {
  types: string[];
  attributes: Record<string, Attribute | undefined>;
};

export interface TableResizingOptions {
  handleWidth?: number;
  cellMinWidth?: number;
  lastColumnResizable?: boolean;
  allowTableNodeSelection?: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableResizing: {
      setCellWidth: (position: number, width: string) => ReturnType;
      setRowHeight: (position: number, height: string) => ReturnType;
    };
  }
  
  interface NodeConfig<Options, Storage> {
    tableResizable?: boolean | {
      resizable?: boolean;
      handleWidth?: number;
      cellMinWidth?: number;
      lastColumnResizable?: boolean;
    };
  }
}

type ResizeHandleType = 'column' | 'row' | 'cell' | 'table';

interface ResizeState {
  isResizing: boolean;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  type: ResizeHandleType;
  cells: HTMLElement[];
  rows: HTMLTableRowElement[];
  initialTableWidth?: string;
  initialTableHeight?: string;
}

export const TableResizing = Extension.create<TableResizingOptions>({
  name: 'tableResizing',
  
  addOptions() {
    return {
      handleWidth: 5,
      cellMinWidth: 50,
      lastColumnResizable: true,
      allowTableNodeSelection: false,
    };
  },

  addGlobalAttributes(): GlobalAttributes[] {
    return [
      {
        types: ['table'],
        attributes: {
          class: {
            default: 'resizable-table',
          },
          'data-col-widths': {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('data-col-widths'),
          },
          'data-row-heights': {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('data-row-heights'),
          },
        },
      } as GlobalAttributes,
      {
        types: ['tableCell', 'tableHeader'],
        attributes: {
          'data-col-index': {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('data-col-index'),
          },
          'data-row-index': {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('data-row-index'),
          },
          style: {
            default: 'min-width: 100px;',
            parseHTML: (element: HTMLElement) => ({
              style: element.getAttribute('style'),
            }),
          },
        },
      } as unknown as GlobalAttributes,
    ];
  },

  addCommands() {
    return {
      setCellWidth:
        (position, width) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setNodeAttribute(position, 'style', `width: ${width}px; min-width: ${width}px;`);
          }
          return true;
        },
      setRowHeight:
        (position, height) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setNodeAttribute(position, 'style', `height: ${height}px; min-height: ${height}px;`);
          }
          return true;
        },
    };
  },

  addNodeView(): NodeViewRenderer {
    return ({ node: nodeProp, getPos, editor }: NodeViewRendererProps) => {
      // Cast the node to the correct type
      const node = nodeProp as unknown as TiptapNode & { attrs: Record<string, any> };
      if (typeof getPos !== 'function') {
        throw new Error('getPos is not a function');
      }

      const table = document.createElement('table');
      table.className = 'resizable-table';
      table.style.width = node.attrs.width || '100%';
      table.style.tableLayout = 'fixed';

      // Create a container for the table and resize handles
      const container = document.createElement('div');
      container.className = 'table-container';
      container.style.position = 'relative';
      container.appendChild(table);

      // State for resizing
      const resizeState: ResizeState = {
        isResizing: false,
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        type: 'column',
        cells: [],
        rows: [],
      };

      // Helper to get all cells in a column
      const getColumnCells = (colIndex: number): HTMLElement[] => {
        return Array.from(table.rows).map(row => row.cells[colIndex]);
      };

      // Helper to get all cells in a row
      const getRowCells = (rowIndex: number): HTMLElement[] => {
        return Array.from(table.rows[rowIndex].cells);
      };

      // Update column widths in the editor state
      const updateColumnWidths = () => {
        const pos = getPos();
        if (pos === undefined) return;
        
        const firstRow = table.rows[0];
        if (!firstRow) return;
        
        const colWidths = Array.from(firstRow.cells).map(cell => cell.style.width || '100px');
        
        editor.view.dispatch(
          editor.view.state.tr.setNodeAttribute(pos, 'data-col-widths', colWidths.join(','))
        );
      };

      // Update row heights in the editor state
      const updateRowHeights = () => {
        const pos = getPos();
        if (pos === undefined) return;
        
        const rowHeights = Array.from(table.rows).map(row => row.style.height || '');
        
        editor.view.dispatch(
          editor.view.state.tr.setNodeAttribute(pos, 'data-row-heights', rowHeights.join(','))
        );
      };

      // Handle mouse down on a resize handle
      const onMouseDown = (e: MouseEvent, type: ResizeHandleType, rowIndex?: number, colIndex?: number) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLElement;
        const tableRect = table.getBoundingClientRect();
        
        // Set initial resize state
        resizeState.isResizing = true;
        resizeState.startX = e.clientX;
        resizeState.startY = e.clientY;
        resizeState.type = type;
        
        // Set up resize based on handle type
        if (type === 'column' && colIndex !== undefined) {
          const cells = getColumnCells(colIndex);
          if (cells.length === 0) return;
          
          resizeState.cells = cells as HTMLElement[];
          resizeState.startWidth = cells[0].offsetWidth;
          
          // Highlight the column being resized
          cells.forEach(cell => cell.classList.add('resizing'));
        } 
        else if (type === 'row' && rowIndex !== undefined) {
          const row = table.rows[rowIndex];
          if (!row) return;
          
          resizeState.rows = [row];
          resizeState.startHeight = row.offsetHeight;
          
          // Highlight the row being resized
          row.classList.add('resizing');
        }
        else if (type === 'cell' && rowIndex !== undefined && colIndex !== undefined) {
          const cell = table.rows[rowIndex]?.cells[colIndex];
          if (!cell) return;
          
          resizeState.cells = [cell as HTMLElement];
          resizeState.startWidth = cell.offsetWidth;
          resizeState.startHeight = cell.offsetHeight;
          
          // Highlight the cell being resized
          cell.classList.add('resizing');
        }
        else if (type === 'table') {
          resizeState.initialTableWidth = table.style.width;
          resizeState.initialTableHeight = table.style.height;
          table.classList.add('resizing');
        }

        // Add active class to handle
        target.classList.add('active');
        
        // Set cursor and prevent text selection
        document.body.style.cursor = type === 'row' ? 'row-resize' : 'col-resize';
        document.body.style.userSelect = 'none';
        
        // Add event listeners
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp, { once: true });
      };

      // Handle mouse move during resize
      const onMouseMove = (e: MouseEvent) => {
        if (!resizeState.isResizing) return;
        
        const dx = e.clientX - resizeState.startX;
        const dy = e.clientY - resizeState.startY;
        
        switch (resizeState.type) {
          case 'column':
            const newWidth = Math.max(50, resizeState.startWidth + dx);
            resizeState.cells.forEach(cell => {
              cell.style.width = `${newWidth}px`;
              cell.style.minWidth = `${newWidth}px`;
            });
            updateHandles();
            break;
            
          case 'row':
            const newHeight = Math.max(20, resizeState.startHeight + dy);
            resizeState.rows.forEach(row => {
              row.style.height = `${newHeight}px`;
              row.style.minHeight = `${newHeight}px`;
            });
            updateHandles();
            break;
            
          case 'cell':
            const cellNewWidth = Math.max(50, resizeState.startWidth + dx);
            const cellNewHeight = Math.max(20, resizeState.startHeight + dy);
            resizeState.cells.forEach(cell => {
              cell.style.width = `${cellNewWidth}px`;
              cell.style.minWidth = `${cellNewWidth}px`;
              cell.style.height = `${cellNewHeight}px`;
              cell.style.minHeight = `${cellNewHeight}px`;
            });
            updateHandles();
            break;
            
          case 'table':
            if (resizeState.initialTableWidth && !resizeState.initialTableWidth.endsWith('px')) {
              resizeState.initialTableWidth = table.offsetWidth + 'px';
            }
            if (resizeState.initialTableHeight && !resizeState.initialTableHeight.endsWith('px')) {
              resizeState.initialTableHeight = table.offsetHeight + 'px';
            }
            
            if (resizeState.initialTableWidth) {
              const currentWidth = parseFloat(resizeState.initialTableWidth);
              table.style.width = `${Math.max(100, currentWidth + dx)}px`;
            }
            
            if (resizeState.initialTableHeight) {
              const currentHeight = parseFloat(resizeState.initialTableHeight);
              table.style.height = `${Math.max(50, currentHeight + dy)}px`;
            }
            break;
        }
      };

      // Handle mouse up after resize
      const onMouseUp = () => {
        if (!resizeState.isResizing) return;
        
        // Clean up
        resizeState.isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // Remove active classes
        container.querySelectorAll('.resize-handle.active, .corner-handle.active')
          .forEach(el => el.classList.remove('active'));
        
        // Remove resizing classes
        table.classList.remove('resizing');
        container.querySelectorAll('.resizing').forEach(el => el.classList.remove('resizing'));
        
        // Update the editor state
        updateColumnWidths();
        updateRowHeights();
        
        // Force a re-render
        editor.view.dispatch(editor.view.state.tr);
      };

      // Create a column resize handle
      const createColumnHandle = (colIndex: number, cell: HTMLTableCellElement, rowIndex: number) => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle column-handle';
        handle.setAttribute('data-type', 'column');
        handle.setAttribute('data-column', colIndex.toString());
        
        const rect = cell.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();
        
        handle.style.position = 'absolute';
        handle.style.top = '0';
        handle.style.bottom = '0';
        handle.style.width = '6px';
        handle.style.left = `${rect.right - tableRect.left - 2}px`;
        handle.style.cursor = 'col-resize';
        handle.style.zIndex = '20';
        
        handle.addEventListener('mousedown', (e) => onMouseDown(e, 'column', undefined, colIndex));
        
        return handle;
      };

      // Create a row resize handle
      const createRowHandle = (rowIndex: number, cell: HTMLTableCellElement) => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle row-handle';
        handle.setAttribute('data-type', 'row');
        handle.setAttribute('data-row', rowIndex.toString());
        
        const rect = cell.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();
        
        handle.style.position = 'absolute';
        handle.style.left = '0';
        handle.style.right = '0';
        handle.style.height = '6px';
        handle.style.top = `${rect.bottom - tableRect.top - 3}px`;
        handle.style.cursor = 'row-resize';
        handle.style.zIndex = '20';
        
        handle.addEventListener('mousedown', (e) => onMouseDown(e, 'row', rowIndex));
        
        return handle;
      };

      // Create a cell corner handle
      const createCornerHandle = (rowIndex: number, colIndex: number, cell: HTMLTableCellElement) => {
        const handle = document.createElement('div');
        handle.className = 'corner-handle';
        handle.setAttribute('data-type', 'cell');
        handle.setAttribute('data-row', rowIndex.toString());
        handle.setAttribute('data-col', colIndex.toString());
        
        const rect = cell.getBoundingClientRect();
        const tableRect = table.getBoundingClientRect();
        
        handle.style.position = 'absolute';
        handle.style.width = '10px';
        handle.style.height = '10px';
        handle.style.left = `${rect.right - tableRect.left - 5}px`;
        handle.style.top = `${rect.bottom - tableRect.top - 5}px`;
        handle.style.cursor = 'nwse-resize';
        handle.style.zIndex = '30';
        
        handle.addEventListener('mousedown', (e) => onMouseDown(e, 'cell', rowIndex, colIndex));
        
        return handle;
      };

      // Create a table corner handle
      const createTableCornerHandle = () => {
        const handle = document.createElement('div');
        handle.className = 'table-corner-handle';
        handle.setAttribute('data-type', 'table');
        
        handle.style.position = 'absolute';
        handle.style.width = '16px';
        handle.style.height = '16px';
        handle.style.right = '-8px';
        handle.style.bottom = '-8px';
        handle.style.cursor = 'nwse-resize';
        handle.style.zIndex = '40';
        
        handle.addEventListener('mousedown', (e) => onMouseDown(e, 'table'));
        
        return handle;
      };

      // Update all resize handles
      const updateHandles = () => {
        // Remove existing handles
        container.querySelectorAll('.resize-handle, .corner-handle, .table-corner-handle')
          .forEach(handle => handle.remove());
        
        if (table.rows.length === 0) return;
        
        const tableRect = table.getBoundingClientRect();
        
        // Add column handles (one per column, on the first row)
        const firstRow = table.rows[0];
        for (let colIndex = 0; colIndex < firstRow.cells.length - 1; colIndex++) {
          const cell = firstRow.cells[colIndex];
          container.appendChild(createColumnHandle(colIndex, cell, 0));
        }
        
        // Add row handles and cell corner handles
        for (let rowIndex = 0; rowIndex < table.rows.length - 1; rowIndex++) {
          const row = table.rows[rowIndex];
          const firstCell = row.cells[0];
          
          // Add row handle on the first cell of each row
          if (firstCell) {
            container.appendChild(createRowHandle(rowIndex, firstCell));
          }
          
          // Add corner handles for each cell
          for (let colIndex = 0; colIndex < row.cells.length - 1; colIndex++) {
            const cell = row.cells[colIndex];
            container.appendChild(createCornerHandle(rowIndex, colIndex, cell));
          }
        }
        
        // Add table corner handle
        container.appendChild(createTableCornerHandle());
      };
      
      // Initial update of handles
      const observer = new MutationObserver(() => {
        updateHandles();
      });
      
      observer.observe(table, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      
      // Initial update
      setTimeout(updateHandles, 0);
      
      // Create a mutable reference to the node
      let currentNode = node;
      
      return {
        dom: container,
        update: (updatedNode: ProseMirrorNode, decorations: readonly Decoration[], innerDecorations: DecorationSource) => {
          const tiptapNode = updatedNode as unknown as TiptapNode & { type: { name: string }, attrs: Record<string, any> };
          if (!tiptapNode || !tiptapNode.type || tiptapNode.type.name !== 'table') return false;
          
          // Update node reference
          currentNode = tiptapNode;
          
          // Update table width if it was changed externally
          const attrs = tiptapNode.attrs as Record<string, any>;
          if (attrs && 'width' in attrs && attrs.width !== currentNode.attrs.width) {
            table.style.width = attrs.width || '100%';
          }
          
          // Update column widths from saved state
          if (attrs && 'data-col-widths' in attrs && attrs['data-col-widths']) {
            const colWidths = String(attrs['data-col-widths']).split(',');
            const firstRow = table.rows[0];
            if (firstRow) {
              for (let i = 0; i < Math.min(colWidths.length, firstRow.cells.length); i++) {
                const width = colWidths[i].trim();
                if (width) {
                  const cells = getColumnCells(i);
                  cells.forEach(cell => {
                    cell.style.width = width;
                    cell.style.minWidth = width;
                  });
                }
              }
            }
          }
          
          // Update row heights from saved state
          if (attrs && 'data-row-heights' in attrs && attrs['data-row-heights']) {
            const rowHeights = String(attrs['data-row-heights']).split(',');
            for (let i = 0; i < Math.min(rowHeights.length, table.rows.length); i++) {
              const height = rowHeights[i].trim();
              if (height) {
                table.rows[i].style.height = height;
                table.rows[i].style.minHeight = height;
              }
            }
          }
          
          updateHandles();
          return true;
        },
        destroy: () => {
          observer.disconnect();
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        },
      };
    };
  },

  addProseMirrorPlugins() {
    return [];
  },
});
