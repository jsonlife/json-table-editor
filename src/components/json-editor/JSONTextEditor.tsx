import { useState, useMemo, useRef } from "react";
import { ChevronDown, ChevronRight, Copy, Undo, Redo, Code2, Minimize2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface JSONTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const JSONTextEditor = ({ value, onChange, isValid, onUndo, onRedo, canUndo, canRedo }: JSONTextEditorProps) => {
  const [collapsedLines, setCollapsedLines] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const lines = value.split('\n');
  
  // Parse JSON structure to find collapsible sections
  const collapsibleSections = useMemo(() => {
    const sections: Map<number, { start: number; end: number; type: 'object' | 'array' }> = new Map();
    const stack: { line: number; char: string }[] = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      // Check if line starts with { or [
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        stack.push({ line: index, char: trimmed[0] });
      }
      // Check if line contains closing bracket
      if (trimmed.includes('}') || trimmed.includes(']')) {
        if (stack.length > 0) {
          const start = stack.pop();
          if (start) {
            sections.set(start.line, {
              start: start.line,
              end: index,
              type: start.char === '{' ? 'object' : 'array'
            });
          }
        }
      }
    });
    
    return sections;
  }, [lines]);

  const toggleCollapse = (lineNum: number) => {
    const newCollapsed = new Set(collapsedLines);
    if (newCollapsed.has(lineNum)) {
      newCollapsed.delete(lineNum);
    } else {
      newCollapsed.add(lineNum);
    }
    setCollapsedLines(newCollapsed);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };


  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      toast({
        title: "Formatted",
        description: "JSON formatted successfully"
      });
    } catch (error) {
      toast({
        title: "Format Failed",
        description: "Cannot format invalid JSON",
        variant: "destructive"
      });
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed));
      toast({
        title: "Minified",
        description: "JSON minified successfully"
      });
    } catch (error) {
      toast({
        title: "Minify Failed",
        description: "Cannot minify invalid JSON",
        variant: "destructive"
      });
    }
  };

  // const isLineVisible = (lineNum: number): boolean => {
  //   for (const [startLine, section] of collapsibleSections.entries()) {
  //     if (collapsedLines.has(startLine) && lineNum > startLine && lineNum <= section.end) {
  //       return false;
  //     }
  //   }
  //   return true;
  // };

  // const getVisibleLines = () => {
  //   return lines.map((line, index) => ({
  //     line,
  //     lineNum: index,
  //     visible: isLineVisible(index),
  //     collapsible: collapsibleSections.has(index),
  //     collapsed: collapsedLines.has(index),
  //     section: collapsibleSections.get(index)
  //   }));
  // };

  // const visibleLines = getVisibleLines().filter(l => l.visible);
  
  // const getCollapsedPlaceholder = (line: string, section: { start: number; end: number; type: 'object' | 'array' }) => {
  //   const match = line.match(/^\s*"?([^":\s]+)"?\s*:\s*/);
  //   const key = match ? match[1] : '';
  //   return section.type === 'object' 
  //     ? `"${key}": {...}` 
  //     : `"${key}": [...]`;
  // };

  return (
    <div className="h-full bg-editor-bg flex flex-col">
      <div className="h-10 border-b border-border bg-card px-4 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">JSON Text</span>
        <div className="flex items-center gap-1">
          {!isValid && (
            <span className="text-sm text-destructive font-medium mr-2">Invalid JSON</span>
          )}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
          <button
            onClick={handleFormat}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title="Format JSON"
          >
            <Code2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleMinify}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title="Minify JSON"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title="Copy JSON"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editable content area */}
        <textarea
          ref={textareaRef}
          value={value}
        onChange={(e) => onChange(e.target.value)}
          className={`flex-1 w-full p-4 bg-editor-bg text-editor-text font-mono text-sm resize-none focus:outline-none overflow-auto whitespace-pre ${
            !isValid ? "border-l-4 border-destructive" : ""
          }`}
          spellCheck={false}
          style={{
            tabSize: 2,
            lineHeight: "1.6",
            wordWrap: "normal",
            overflowWrap: "normal"
          }}
        />
      </div>
    </div>
  );
};
