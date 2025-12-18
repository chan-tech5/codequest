import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
}

export const CodeEditor = ({ 
  value, 
  onChange, 
  language = 'python',
  height = '300px'
}: CodeEditorProps) => {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Editor
        height={height}
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          tabSize: 4,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};
