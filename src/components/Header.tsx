interface HeaderProps {
  onNewTemplate: () => void;
  onCopyReport: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function Header({ onNewTemplate, onCopyReport, searchTerm, onSearchChange }: HeaderProps) {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">DAoC Template Builder (Prototype)</h1>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onNewTemplate} className="px-3 py-1 bg-blue-600 rounded">New Template</button>
        <button onClick={onCopyReport} className="px-3 py-1 bg-green-600 rounded">Copy Report</button>
        <input
          className="ml-auto px-2 py-1 bg-gray-800 border rounded w-64"
          placeholder="Search items..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
    </>
  );
}
