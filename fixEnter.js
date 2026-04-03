const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/RichTextEditor.jsx', 'utf8');

content = content.replace(
  "import { useEditor, EditorContent } from '@tiptap/react';",
  "import { useEditor, EditorContent } from '@tiptap/react';\nimport { Extension } from '@tiptap/core';"
);

content = content.replace(
  "const RichTextEditor = ({ content, onChange, placeholder }) => {",
  `const CustomEnterOption = Extension.create({
  name: 'customEnterOption',
  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.setHardBreak(),
    };
  },
});

const RichTextEditor = ({ content, onChange, placeholder }) => {`
);

content = content.replace(
  "extensions: [",
  "extensions: [\n      CustomEnterOption,"
);

fs.writeFileSync('frontend/src/components/RichTextEditor.jsx', content);
console.log('success updating RichTextEditor');
