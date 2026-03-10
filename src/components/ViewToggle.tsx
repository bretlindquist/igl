import { LayoutGrid, Table } from "lucide-react";

interface ViewToggleProps {
  view: "cards" | "table";
  onChange: (view: "cards" | "table") => void;
}

const ViewToggle = ({ view, onChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-1 bg-card rounded-lg p-0.5 border border-border/50">
      <button
        onClick={() => onChange("cards")}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-display font-medium transition-colors ${
          view === "cards"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Cards
      </button>
      <button
        onClick={() => onChange("table")}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-display font-medium transition-colors ${
          view === "table"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Table className="w-3.5 h-3.5" />
        Table
      </button>
    </div>
  );
};

export default ViewToggle;
