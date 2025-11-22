import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

interface EditRowFormProps {
  currentKey: string;
  currentValue: any;
  isArray: boolean;
  editingTarget: 'key' | 'value' | null;
  onSave: (newKey: string, type: string, value: any) => void;
  onCancel: () => void;
}

export const EditRowForm = ({ currentKey, currentValue, isArray, editingTarget, onSave, onCancel }: EditRowFormProps) => {
  const getInitialType = (val: any): string => {
    if (val === null) return "null";
    if (Array.isArray(val)) return "array";
    if (typeof val === "object") return "object";
    return typeof val;
  };

  const getValueType = (val: any): string => {
    if (val === null) return "null";
    if (Array.isArray(val)) return "array";
    if (typeof val === "object") return "object";
    return typeof val;
  };

  const [newKey, setNewKey] = useState(currentKey);
  const [type, setType] = useState(getInitialType(currentValue));
  const [value, setValue] = useState(
    typeof currentValue === "object" && currentValue !== null
      ? JSON.stringify(currentValue)
      : String(currentValue)
  );
  const [boolValue, setBoolValue] = useState(currentValue === true);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('tr')) {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [newKey, type, value, boolValue]);

  const handleSave = () => {
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
      case "array":
        try {
          parsedValue = JSON.parse(value);
          if (type === "array" && !Array.isArray(parsedValue)) {
            alert("Value must be a valid array");
            return;
          }
          if (type === "object" && (typeof parsedValue !== "object" || Array.isArray(parsedValue))) {
            alert("Value must be a valid object");
            return;
          }
        } catch {
          alert("Invalid JSON");
          return;
        }
        break;
    }

    onSave(newKey, type, parsedValue);
  };

  const getDefaultValue = (type: string): any => {
    switch (type) {
      case "string": return "";
      case "number": return 0;
      case "boolean": return false;
      case "null": return null;
      case "object": return {};
      case "array": return [];
      default: return "";
    }
  };

  return (
    <tr className="bg-primary/10">
      <td className="border border-table-border p-2 font-mono text-sm bg-table-key">
        {editingTarget === 'key' && !isArray ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="flex-1 px-2 py-1 text-sm font-mono bg-background border border-input rounded"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-1 hover:bg-primary/20 rounded transition-colors border border-green-500 rounded-md"
              title="Save"
            >
              <Check className="h-4 w-4 text-green-500" />
            </button>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-destructive/20 rounded transition-colors border border-destructive rounded-md"
              title="Cancel"
            >
              <X className="h-4 w-4 text-destructive" />
            </button>
          </div>
        ) : (
          <span>{currentKey}</span>
        )}
      </td>
      
      <td className="border border-table-border p-2">
        {editingTarget === 'value' ? (
          <div className="flex items-center gap-2">
            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value;
                setType(newType);
                setValue(JSON.stringify(getDefaultValue(newType)));
                if (newType === 'boolean') setBoolValue(false);
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
                className="flex-1 px-2 py-1 text-sm font-mono bg-background border border-input rounded"
                autoFocus
              />
            ) : (
              <span className="text-xs text-muted-foreground">null</span>
            )}
            
            <button
              onClick={handleSave}
              className="p-1 hover:bg-primary/20 rounded transition-colors border border-green-500 rounded-md"
              title="Save"
            >
              <Check className="h-4 w-4 text-green-500" />
            </button>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-destructive/20 rounded transition-colors border border-destructive rounded-md"
              title="Cancel"
            >
              <X className="h-4 w-4 text-destructive" />
            </button>
          </div>
        ) : (
          <span className="text-muted-foreground">Not editing value</span>
        )}
      </td>
    </tr>
  );
};
