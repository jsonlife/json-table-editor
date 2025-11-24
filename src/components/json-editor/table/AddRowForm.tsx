import { useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";

interface AddRowFormProps {
  isArray: boolean;
  onAdd: (key: string, type: string, value: any) => void;
  onCancel: () => void;
  isInline?: boolean;
}

export const AddRowForm = ({ isArray, onAdd, onCancel, isInline = false }: AddRowFormProps) => {
  const [key, setKey] = useState("");
  const [type, setType] = useState("string");
  const [value, setValue] = useState("");
  const [boolValue, setBoolValue] = useState(false);
  const formRef = useRef<HTMLTableRowElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAdd();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, type, value, boolValue]);

  const handleAdd = () => {
    if (!isArray && !key.trim()) {
      alert("Key cannot be empty");
      return;
    }

    let parsedValue: any;

    switch (type) {
      case "string":
        parsedValue = value;
        break;
      case "number":
        parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
          alert("Invalid number");
          return;
        }
        break;
      case "boolean":
        parsedValue = boolValue;
        break;
      case "null":
        parsedValue = null;
        break;
      case "object":
        if (value.trim() === "") {
          parsedValue = {};
        } else {
          try {
            parsedValue = JSON.parse(value);
            if (typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
              alert("Value must be a valid object");
              return;
            }
          } catch {
            alert("Invalid JSON");
            return;
          }
        }
        break;
      case "array":
        if (value.trim() === "") {
          parsedValue = [];
        } else {
          try {
            parsedValue = JSON.parse(value);
            if (!Array.isArray(parsedValue)) {
              alert("Value must be a valid array");
              return;
            }
          } catch {
            alert("Invalid JSON");
            return;
          }
        }
        break;
    }

    onAdd(key, type, parsedValue);
  };

  if (isInline) {
    return (
      <div className="bg-card border border-primary/50 rounded-lg shadow-lg p-3 min-w-[400px]">
        <div className="flex items-center gap-2">
          {!isArray && (
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Key"
              className="px-2 py-1 text-sm font-mono bg-background border border-input rounded flex-1"
              autoFocus
            />
          )}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              if (e.target.value === "object") setValue("{}");
              else if (e.target.value === "array") setValue("[]");
              else if (e.target.value === "null") setValue("null");
              else if (e.target.value === "boolean") setBoolValue(false);
              else setValue("");
            }}
            className="px-2 py-1 text-sm bg-background border border-input rounded-md z-50"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="object">Object</option>
            <option value="array">Array</option>
            <option value="null">Null</option>
          </select>
          
          {type === "boolean" ? (
            <div className="flex gap-2">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="boolValue"
                  value="true"
                  checked={boolValue === true}
                  onChange={() => setBoolValue(true)}
                />
                <span className="text-sm">true</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="boolValue"
                  value="false"
                  checked={boolValue === false}
                  onChange={() => setBoolValue(false)}
                />
                <span className="text-sm">false</span>
              </label>
            </div>
          ) : type === "object" ? (
            <span className="text-xs text-muted-foreground">empty object{}</span>
          ) : type === "array" ? (
            <span className="text-xs text-muted-foreground">empty array[]</span>
          ) : type !== "null" ? (
            <input
              type={type === "number" ? "number" : "text"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Value"
              className="flex-1 px-2 py-1 text-sm font-mono bg-background border border-input rounded"
            />
          ) : (
            <span className="text-xs text-muted-foreground">null</span>
          )}
          
          <button
            onClick={handleAdd}
            className="p-1 hover:bg-green-400/20 rounded transition-colors border-2 border-green-600 rounded-md"
            title="Add"
          >
            <Check className="h-4 w-4 text-green-600" />
          </button>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-destructive/20 rounded transition-colors border border-destructive rounded-md"
            title="Cancel"
          >
            <X className="h-4 w-4 text-destructive" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <tr ref={formRef} className="bg-primary/5">
      {!isArray && (
        <td className="border border-table-border p-2 bg-table-key">
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Key"
            className="w-full px-2 py-1 text-sm font-mono bg-background border border-input rounded"
            autoFocus
          />
        </td>
      )}
      <td className="border border-table-border p-2" colSpan={isArray ? 2 : 1}>
        <div className="flex items-center gap-2">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              if (e.target.value === "object") setValue("{}");
              else if (e.target.value === "array") setValue("[]");
              else if (e.target.value === "null") setValue("null");
              else if (e.target.value === "boolean") setBoolValue(false);
              else setValue("");
            }}
            className="px-2 py-1 text-sm bg-background border border-input rounded-md z-50"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="object">Object</option>
            <option value="array">Array</option>
            <option value="null">Null</option>
          </select>
          
          {type === "boolean" ? (
            <div className="flex gap-2">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="boolValue"
                  value="true"
                  checked={boolValue === true}
                  onChange={() => setBoolValue(true)}
                />
                <span className="text-sm">true</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="boolValue"
                  value="false"
                  checked={boolValue === false}
                  onChange={() => setBoolValue(false)}
                />
                <span className="text-sm">false</span>
              </label>
            </div>
          ) : type === "object" ? (
            <span className="text-xs text-muted-foreground">empty object{}</span>
          ) : type === "array" ? (
            <span className="text-xs text-muted-foreground">empty array[]</span>
          ) : type !== "null" ? (
            <input
              type={type === "number" ? "number" : "text"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Value"
              className="flex-1 px-2 py-1 text-sm font-mono bg-background border border-input rounded"
            />
          ) : (
            <span className="text-xs text-muted-foreground">null</span>
          )}
          
          <button
            onClick={handleAdd}
            className="p-1 hover:bg-green-400/20 rounded transition-colors border-2 border-green-600 rounded-md"
            title="Add"
          >
            <Check className="h-4 w-4 text-green-600" />
          </button>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-destructive/20 rounded transition-colors border-2 border-destructive rounded-md"
            title="Cancel"
          >
            <X className="h-4 w-4 text-destructive" />
          </button>
        </div>
      </td>
    </tr>
  );
};
