import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { JSONTableRow, HoverContext } from "./JSONTableRow";
import { AddRowForm } from "./AddRowForm";

interface JSONTableProps {
  data: any;
  onChange: (newData: any) => void;
  path: string[];
  isNested?: boolean;
}

export const JSONTable = ({ data, onChange, path, isNested = false }: JSONTableProps) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [addingRowBetween, setAddingRowBetween] = useState<string | null>(null);
  const [addingAtTop, setAddingAtTop] = useState(false);
  const [keyColumnWidth, setKeyColumnWidth] = useState<number | 'auto'>('auto');
  const [hoveredPath, setHoveredPath] = useState<string[]>([]);
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);

  if (typeof data !== 'object' || data === null) {
    return <span className="text-muted-foreground">{String(data)}</span>;
  }

  const isArray = Array.isArray(data);
  const entries = isArray ? data.map((v, i) => [String(i), v]) : Object.entries(data);
  const collapseKey = path.join('.');
  const isCollapsed = collapsed[collapseKey];

  const updateValue = (key: string, newValue: any) => {
    if (isArray) {
      const newArray = [...data];
      newArray[parseInt(key)] = newValue;
      onChange(newArray);
    } else {
      onChange({ ...data, [key]: newValue });
    }
  };

  const deleteKey = (key: string) => {
    if (isArray) {
      const newArray = data.filter((_: any, i: number) => String(i) !== key);
      onChange(newArray);
    } else {
      const newData = { ...data };
      delete newData[key];
      onChange(newData);
    }
  };

  const renameKey = (oldKey: string, newKey: string, newValue?: any) => {
    if (isArray || oldKey === newKey) {
      // If only value changed (not key), update the value
      if (newValue !== undefined) {
        updateValue(oldKey, newValue);
      }
      return;
    }
    
    const newData: any = {};
    Object.keys(data).forEach(k => {
      if (k === oldKey) {
        newData[newKey] = newValue !== undefined ? newValue : data[k];
      } else {
        newData[k] = data[k];
      }
    });
    onChange(newData);
  };

  const addRow = (afterKey: string, key: string, type: string, value: any) => {
    if (isArray) {
      const newArray = [...data];
      const index = parseInt(afterKey) + 1;
      newArray.splice(index, 0, value);
      onChange(newArray);
    } else {
      const keys = Object.keys(data);
      const newData: any = {};
      
      let inserted = false;
      keys.forEach(k => {
        newData[k] = data[k];
        if (afterKey === k && !inserted) {
          newData[key] = value;
          inserted = true;
        }
      });
      
      if (!inserted) {
        newData[key] = value;
      }
      
      onChange(newData);
    }
    setAddingRowBetween(null);
  };

  const addRowAtTop = (key: string, type: string, value: any) => {
    if (isArray) {
      onChange([value, ...data]);
    } else {
      onChange({ [key]: value, ...data });
    }
    setAddingAtTop(false);
  };
  
  const toggleCollapse = () => {
    setCollapsed(prev => ({ ...prev, [collapseKey]: !prev[collapseKey] }));
  };

  const getTypeDisplay = (val: any): string => {
    if (val === null) return "null";
    if (Array.isArray(val)) return `array[${val.length}]`;
    if (typeof val === "object") return `object{${Object.keys(val).length}}`;
    return typeof val;
  };

  const isEmpty = entries.length === 0;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = keyColumnWidth === 'auto' ? 150 : keyColumnWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      setKeyColumnWidth(Math.max(80, Math.min(400, startWidth + diff)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <HoverContext.Provider value={{ hoveredPath, setHoveredPath }}>
      <table className={`border-collapse w-auto"}`}>
        <thead>
          <tr>
            <th 
              className="border border-table-border p-2 text-left text-sm font-medium text-white relative group"
              colSpan={2}
              style={{
                backgroundColor: isArray ? '#A162A1' : '#A18262'
              }}
              onMouseEnter={() => setIsHoveringHeader(true)}
              onMouseLeave={() => setIsHoveringHeader(false)}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleCollapse}
                  className="hover:text-white transition-colors"
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <span className="font-mono font-bold">{getTypeDisplay(data)}</span>
                {isHoveringHeader && (
                  <button
                    onClick={() => setAddingAtTop(true)}
                    className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all"
                    title="Add row at top"
                  >
                    <Plus className="h-3 w-3 text-white" />
                  </button>
                )}
              </div>
            </th>
          </tr>
        </thead>

        {(!isCollapsed || isNested) && (
          <tbody>
          {isNested && addingAtTop && (
            <AddRowForm
              isArray={isArray}
              onAdd={(key, type, value) => addRowAtTop(key, type, value)}
              onCancel={() => setAddingAtTop(false)}
              isInline={false}
            />
          )}
          
          {!isNested && addingAtTop && (
            <AddRowForm
              isArray={isArray}
              onAdd={(key, type, value) => addRowAtTop(key, type, value)}
              onCancel={() => setAddingAtTop(false)}
              isInline={false}
            />
          )}
          
          {!isCollapsed && entries.map(([key, value], index) => {
            const showAddBetween = addingRowBetween === key;
            
            return (
              <>
                <JSONTableRow
                  key={`${path.join('.')}.${key}`}
                  itemKey={key}
                  value={value}
                  isArray={isArray}
                  collapsed={collapsed}
                  onToggleCollapse={(k) => setCollapsed(prev => ({ ...prev, [k]: !prev[k] }))}
                  onUpdateValue={updateValue}
                  onDeleteKey={deleteKey}
                  onRenameKey={renameKey}
                  path={[...path, key]}
                  showAddBetween={true}
                  onAddBetween={() => setAddingRowBetween(key)}
                  keyColumnWidth={keyColumnWidth}
                  onResizeColumn={handleMouseDown}
                />
                {showAddBetween && (
                  <AddRowForm
                    isArray={isArray}
                    onAdd={(key, type, value) => addRow(addingRowBetween!, key, type, value)}
                    onCancel={() => setAddingRowBetween(null)}
                    isInline={false}
                  />
                )}
              </>
            );
          })}
          
          {addingRowBetween === 'empty' && (
            <AddRowForm
              isArray={isArray}
              onAdd={(key, type, value) => {
                if (isArray) {
                  onChange([value]);
                } else {
                  onChange({ [key]: value });
                }
                setAddingRowBetween(null);
              }}
              onCancel={() => setAddingRowBetween(null)}
              isInline={false}
            />
          )}
          </tbody>
        )}
      </table>
    </HoverContext.Provider>
  );
};
