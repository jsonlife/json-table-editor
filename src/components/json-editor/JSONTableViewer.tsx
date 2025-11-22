import { JSONTable } from "./table/JSONTable";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";

interface JSONTableViewerProps {
  data: any;
  onChange: (data: any) => void;
  isValid: boolean;
}

export const JSONTableViewer = ({ data, onChange, isValid }: JSONTableViewerProps) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const handleSaveAsPDF = async () => {
    if (!tableRef.current) return;
    try {
      const scrollContainer = tableRef.current.parentElement;
      if (!scrollContainer) return;

      // Store original styles and scroll position
      const originalScrollTop = scrollContainer.scrollTop;
      const originalScrollLeft = scrollContainer.scrollLeft;
      const originalOverflow = scrollContainer.style.overflow;
      const originalHeight = scrollContainer.style.height;
      const originalWidth = scrollContainer.style.width;
      
      // Temporarily remove overflow and constraints to show full content
      scrollContainer.style.overflow = 'visible';
      scrollContainer.style.height = 'auto';
      scrollContainer.style.width = 'auto';
      scrollContainer.scrollTop = 0;
      scrollContainer.scrollLeft = 0;
      
      // Wait for layout to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(tableRef.current, { 
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        width: tableRef.current.scrollWidth,
        height: tableRef.current.scrollHeight,
        windowWidth: tableRef.current.scrollWidth,
        windowHeight: tableRef.current.scrollHeight
      });
      
      // Restore original styles and scroll position
      scrollContainer.style.overflow = originalOverflow;
      scrollContainer.style.height = originalHeight;
      scrollContainer.style.width = originalWidth;
      scrollContainer.scrollTop = originalScrollTop;
      scrollContainer.scrollLeft = originalScrollLeft;
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      
      // Add footer with link
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.textWithLink("jsonlife.github.io", pageWidth / 2 - 30, pageHeight - 10, { url: "https://jsonlife.github.io" });
      
      pdf.save("json-table.pdf");
      toast({ title: "Success", description: "Table saved as PDF" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save as PDF", variant: "destructive" });
    }
  };

  if (!isValid || typeof data !== 'object' || data === null) {
    return (
      <div className="h-full bg-table-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">
            {!isValid ? "Invalid JSON" : "Invalid data structure"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-table-bg flex flex-col">
      <div className="h-10 border-b border-border bg-card px-4 flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Table View</span>
        {/* <button
          onClick={handleSaveAsPDF}
          className="px-3 py-1.5 text-sm hover:bg-muted rounded transition-colors"
        >
          Save as PDF
        </button> */}
      </div>
      
      <div ref={tableRef} className="flex-1 overflow-auto p-4">
        <JSONTable data={data} onChange={onChange} path={[]} />
      </div>
    </div>
  );
};
