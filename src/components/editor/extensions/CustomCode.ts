import { Mark, mergeAttributes } from '@tiptap/core';

console.log('CustomCode extension is being loaded');

export const CustomCode = Mark.create({
  name: 'code',
  
  // Explicitly allow all marks inside code
  // Using an empty string is the correct way to allow all marks
  excludes: '',
  
  // Explicitly include the marks we want to allow
  // This ensures compatibility with our styling
  includes: 'textStyle',
  
  // Define the HTML rendering for the code mark
  renderHTML({ HTMLAttributes }) {
    return ['code', mergeAttributes(HTMLAttributes), 0];
  },
  
  // Define the parsing rules for the code mark
  parseHTML() {
    return [
      {
        tag: 'code',
      },
    ];
  },
  
  // Add commands like toggleCode()
  addCommands() {
    return {
      toggleCode: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
    };
  },
  
  // Add keyboard shortcuts
  addKeyboardShortcuts() {
    return {
      'Mod-`': () => this.editor.commands.toggleCode(),
    };
  },
  
  // Add debug info
  onUpdate() {
    if (this.editor) {
      console.log('CustomCode active:', this.editor.isActive('code'));
      console.log('Current marks:', this.editor.state.selection.$from.marks());
    }
  },
});
