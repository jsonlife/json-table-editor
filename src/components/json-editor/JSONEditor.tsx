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
        <ThemeToggle />
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
