import { useState, useEffect, useContext, createContext } from "react";
import { ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react";
import { JSONTable } from "./JSONTable";
import { EditRowForm } from "./EditRowForm";

export const HoverContext = createContext<{
  hoveredPath: string[];
  setHoveredPath: (path: string[]) => void;
}>({
  hoveredPath: [],
  setHoveredPath: () => {}
});

interface JSONTableRowProps {
  itemKey: string;
  value: any;
  isArray: boolean;
  collapsed: Record<string, boolean>;
  onToggleCollapse: (key: string) => void;
  onUpdateValue: (key: string, newValue: any) => void;
  onDeleteKey: (key: string) => void;
  onRenameKey: (oldKey: string, newKey: string, newValue?: any) => void;
  path: string[];
  showAddBetween: boolean;
  onAddBetween: () => void;
  keyColumnWidth?: number | 'auto';
  onResizeColumn?: (e: React.MouseEvent) => void;
}

export const JSONTableRow = ({
  itemKey,
  value,
  isArray,
  collapsed,
  onToggleCollapse,
  onUpdateValue,
  onDeleteKey,
  onRenameKey,
  path,
  showAddBetween,
  onAddBetween,
  keyColumnWidth,
  onResizeColumn,
}: JSONTableRowProps) => {
  const [isHoveringKey, setIsHoveringKey] = useState(false);
  const [isHoveringValue, setIsHoveringValue] = useState(false);
  const [isHoveringSectionTitle, setIsHoveringSectionTitle] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTarget, setEditingTarget] = useState<'key' | 'value' | null>(null);
  const { hoveredPath, setHoveredPath } = useContext(HoverContext);

  const isExpandable = typeof value === 'object' && value !== null;
  const isCollapsed = collapsed[itemKey];
  const isValueArray = Array.isArray(value);

  useEffect(() => {
    if (isEditing) setIsHoveringKey(false);
  }, [isEditing]);

  const getTypeDisplay = (val: any): string => {
    if (val === null) return "null";
    if (Array.isArray(val)) return `array[${val.length}]`;
    if (typeof val === "object") return `object{${Object.keys(val).length}}`;
    return typeof val;
  };

  const getValueType = (val: any): string => {
    if (val === null) return "null";
    if (Array.isArray(val)) return "array";
    if (typeof val === "object") return "object";
    return typeof val;
  };

  const handleClickKey = () => {
    if (!isArray) {
      setIsEditing(true);
      setEditingTarget('key');
    }
  };

  const handleClickValue = () => {
    setIsEditing(true);
    setEditingTarget('value');
  };

  const handleSaveEdit = (newKey: string, newType: string, newValue: any) => {
    // Use renameKey which now handles both key rename and value update
    onRenameKey(itemKey, newKey, newValue);
    setIsEditing(false);
    setEditingTarget(null);
  };

  const handleDelete = () => {
    onDeleteKey(itemKey);
  };

  if (isEditing) {
    return (
      <EditRowForm
        currentKey={itemKey}
        currentValue={value}
        isArray={isArray}
        editingTarget={editingTarget}
        onSave={handleSaveEdit}
        onCancel={() => {
          setIsEditing(false);
          setEditingTarget(null);
        }}
      />
    );
  }

  const pathString = path.join('.');
  const isPathHovered = hoveredPath.some((hp, idx) => path[idx] === hp) && hoveredPath.length >= path.length;

  return (
    <>
      <tr 
        className="group transition-colors relative"
      >
        <td
          className="border border-table-border p-2 align-top font-mono text-sm bg-table-key relative cursor-pointer group/key"
          style={keyColumnWidth && keyColumnWidth !== 'auto' ? { width: keyColumnWidth } : undefined}
          onMouseEnter={() => setIsHoveringKey(true)}
          onMouseLeave={() => setIsHoveringKey(false)}
          onClick={handleClickKey}
        >
          <div className="flex items-center justify-between gap-2 min-h-[24px]">
            <span className="font-semibold">{isArray ? `[${itemKey}]` : itemKey}</span>
            <div className="flex items-center gap-1 justify-end">
              {showAddBetween && isHoveringKey && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddBetween();
                  }}
                  className="w-6 h-6 rounded-full bg-primary/20 hover:bg-primary/40 flex items-center justify-center transition-all"
                  title="Add row below"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
              {isHoveringKey && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="p-1 hover:bg-destructive/20 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              )}
            </div>
          </div>
          {onResizeColumn && (
            <div
              className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors"
              onMouseDown={onResizeColumn}
            />
          )}
        </td>
        
        <td
          className="border border-table-border p-2 align-top font-mono text-sm relative cursor-pointer"
          onClick={handleClickValue}
          onMouseEnter={() => {
            setIsHoveringValue(true);
            setHoveredPath(path);
          }}
          onMouseLeave={() => {
            setIsHoveringValue(false);
            setHoveredPath([]);
          }}
          style={{
            backgroundColor: isPathHovered && isHoveringValue ? 'hsl(var(--accent) / 0.3)' : undefined
          }}
        >
          {isExpandable ? (
            isCollapsed ? (
              <div className="flex items-center gap-2 min-h-[24px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse(path.join('.'));
                  }}
                  className="hover:text-primary transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="text-muted-foreground text-xs">{getTypeDisplay(value)}</span>
              </div>
            ) : (
              <div className="w-auto" onClick={(e) => e.stopPropagation()}>
                <JSONTable
                  data={value}
                  onChange={(newValue) => onUpdateValue(itemKey, newValue)}
                  path={path}
                  isNested={true}
                />
              </div>
            )
          ) : (
            <div className="flex items-center min-h-[24px]">
              <span className={
                `font-semibold ${
                  getValueType(value) === "string" ? "text-json-string" :
                  getValueType(value) === "number" ? "text-json-number" :
                  getValueType(value) === "boolean" ? "text-json-boolean" :
                  getValueType(value) === "null" ? "text-json-null" :
                  "text-foreground"
                }`
              }>
                {getValueType(value) === "string" ? `"${value}"` : String(value)}
              </span>
            </div>
          )}
        </td>
      </tr>
    </>
  );
};
