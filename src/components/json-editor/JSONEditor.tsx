import { useState, useEffect } from "react";
import { ResizablePanel } from "./ResizablePanel";
import { JSONTextEditor } from "./JSONTextEditor";
import { JSONTableViewer } from "./JSONTableViewer";
import { ThemeToggle } from "@/components/ThemeToggle";

const defaultJSON = {
  "title": "",
  "description": "This is a very long text field used to test the editor's ability to handle long strings. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus facilisis.",
  "data": {
    "emptyObj": {},
    "emptyArr": [],
    "arrOfObjs": [
      {},
      {"k": "v"},
      {"nested": {}}
    ],
    "deep": {
      "l1": {
        "l2": {
          "l3": {
            "l4": "end"
          }
        }
      }
    },
    "nullValue": null,
    "specialChars": "!@#$%^&*()_+-=[]{}|;:'\",.<>/?`~",
    "emojiString": "😀🚀✨💡🎉",
    "mixedArray": [123, "string", true, false, null, {"nestedKey": "nestedValue"}],
    "booleanTest": true,
    "numericTest": 98765.4321,
    "nestedArrayObjects": [
      {"id": 1, "tags": ["alpha", "beta"]},
      {"id": 2, "tags": ["gamma", "delta"]}
    ],
    "deepNestedMixed": {
      "level1": {
        "level2": {
          "level3": [
            {"name": "Alice", "score": null},
            {"name": "Bob", "score": 95, "emoji": "🏆"}
          ]
        }
      }
    }
  }
};

export const JSONEditor = () => {
  const [jsonText, setJsonText] = useState(JSON.stringify(defaultJSON, null, 2));
  const [jsonObject, setJsonObject] = useState<any>(defaultJSON);
  const [isValidJSON, setIsValidJSON] = useState(true);
  const [history, setHistory] = useState<string[]>([JSON.stringify(defaultJSON, null, 2)]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleTextChange = (text: string) => {
    setJsonText(text);
    
    // Add to history with max 16 snapshots
    const newHistory = history.slice(Math.max(0, history.length - 32), historyIndex + 1);
    newHistory.push(text);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    try {
      const parsed = JSON.parse(text);
      setJsonObject(parsed);
      setIsValidJSON(true);
    } catch (error) {
      setIsValidJSON(false);
    }
  };

  const handleObjectChange = (newObject: any) => {
    setJsonObject(newObject);
    const newText = JSON.stringify(newObject, null, 2);
    setJsonText(newText);
    setIsValidJSON(true);
    
    // Add to history with max 16 snapshots
    const newHistory = history.slice(Math.max(0, history.length - 15), historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleReset = () => {
    const resetText = JSON.stringify(defaultJSON, null, 2);
    setJsonText(resetText);
    setJsonObject(defaultJSON);
    setIsValidJSON(true);
    setHistory([resetText]);
    setHistoryIndex(0);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const text = history[newIndex];
      setHistoryIndex(newIndex);
      setJsonText(text);
      try {
        const parsed = JSON.parse(text);
        setJsonObject(parsed);
        setIsValidJSON(true);
      } catch (error) {
        setIsValidJSON(false);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const text = history[newIndex];
      setHistoryIndex(newIndex);
      setJsonText(text);
      try {
        const parsed = JSON.parse(text);
        setJsonObject(parsed);
        setIsValidJSON(true);
      } catch (error) {
        setIsValidJSON(false);
      }
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-background">

      {/* FIXED HEADER */}
      <header className="h-16 shrink-0 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <img
            src="./img/JSONLife.png"
            alt="JSONLife Logo"
            className="p-1 h-14 w-14 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl"
          />
          <h1 className="text-xl font-semibold text-foreground">
            Table Visualizer & Editor
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/jsonlife/json-table-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex px-2 py-1 rounded-lg group border border-border bg-muted hover:bg-muted/70 transition flex items-center justify-center hover:shadow-sm"
            title="Star on GitHub"
          >
            <span className="text-red-500 group-hover:scale-110 transition-transform duration-200">
              ⭐
            </span>
            <span className="px-1 font-semibold text-foreground">Star on</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="h-5 w-5 text-foreground"
            >
              <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.088 3.292 9.395 7.868 10.919.575.105.785-.25.785-.556 0-.274-.01-1-.015-1.96-3.2.695-3.878-1.542-3.878-1.542-.523-1.33-1.278-1.684-1.278-1.684-1.044-.714.08-.699.08-.699 1.155.082 1.763 1.188 1.763 1.188 1.027 1.76 2.695 1.252 3.35.957.105-.744.402-1.252.73-1.54-2.555-.29-5.238-1.278-5.238-5.686 0-1.256.45-2.283 1.187-3.087-.119-.29-.515-1.46.113-3.043 0 0 .967-.31 3.168 1.18a10.98 10.98 0 0 1 5.774 0c2.2-1.49 3.165-1.18 3.165-1.18.63 1.583.234 2.753.115 3.043.74.804 1.185 1.83 1.185 3.087 0 4.42-2.687 5.392-5.252 5.675.414.36.783 1.067.783 2.15 0 1.552-.014 2.804-.014 3.185 0 .31.207.67.79.554C20.21 21.39 23.5 17.084 23.5 12c0-6.352-5.148-11.5-11.5-11.5Z"/>
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* MIDDLE SECTION — fills remaining space automatically */}
      <main className="h-[calc(100vh-104px)]">

        {/* MOBILE (stacked layout) */}
        <div className="flex flex-col h-full sm:hidden">

          {/* JSONTextEditor = 36% */}
          <div className="h-[36%] overflow-auto">
            <JSONTextEditor 
              value={jsonText}
              onChange={handleTextChange}
              isValid={isValidJSON}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
            />
          </div>

          {/* JSONTableViewer = 64% */}
          <div className="h-[64%] overflow-auto">
            <JSONTableViewer 
              data={jsonObject}
              onChange={handleObjectChange}
              isValid={isValidJSON}
            />
          </div>
        </div>

        {/* DESKTOP (resizable side-by-side panels) */}
        <div className="hidden sm:block h-full overflow-auto">
          <ResizablePanel
            leftPanel={
              <div className="h-full overflow-auto">
                <JSONTextEditor 
                  value={jsonText}
                  onChange={handleTextChange}
                  isValid={isValidJSON}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < history.length - 1}
                />
              </div>
            }
            rightPanel={
              <div className="h-full overflow-auto">
                <JSONTableViewer 
                  data={jsonObject}
                  onChange={handleObjectChange}
                  isValid={isValidJSON}
                />
              </div>
            }
          />
        </div>

      </main>

      {/* FIXED FOOTER */}
      <footer className="h-10 shrink-0 flex items-center justify-center bg-card">
        <p className="text-gray-500 text-xs inline-flex items-center">
          &copy; 2025 JSONLife. Designed and developed by
          <span className="ml-2 p-1 bg-white border-2 inline-flex items-center">
            <a href="https://crafesign.com" target="_blank">
              <img className="h-3" alt="Crafesign logo" src="./img/CrafesignLogo.svg" />
            </a>
          </span>
        </p>
      </footer>

    </div>


  );
};
