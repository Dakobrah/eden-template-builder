import type { Template } from '@/types';

interface TemplatePanelProps {
  template: Template;
  templates: Template[];
  onSave: (name?: string) => void;
  onDelete: (id: string) => void;
  onLoad: (t: Template) => void;
  onExportJson: () => void;
  onImportJson: (files: FileList | null) => void;
  onShareCode: () => void;
  onCopyShareCode: (t: Template) => void;
  onExportZenkraft: () => void;
  onImportZenkraft: (files: FileList | null) => void;
  onSetTemplate: (t: Template | ((prev: Template) => Template)) => void;
}

export function TemplatePanel({
  template, templates,
  onSave, onDelete, onLoad,
  onExportJson, onImportJson,
  onShareCode, onCopyShareCode,
  onExportZenkraft, onImportZenkraft,
  onSetTemplate,
}: TemplatePanelProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Saved Templates</h3>
      <div className="flex gap-2 mb-2 flex-wrap">
        <button className="px-2 py-1 bg-blue-600 rounded text-xs" onClick={() => {
          const name = window.prompt('Template name', template.name) || template.name;
          onSetTemplate((t: Template) => ({ ...t, name }));
          onSave(name);
        }}>Save Current</button>
        <button className="px-2 py-1 bg-yellow-600 rounded text-xs" onClick={onExportJson}>Export</button>
        <label className="text-xs text-gray-300 px-2 py-1 rounded bg-gray-700 cursor-pointer">
          Import
          <input type="file" accept="application/json" onChange={e => onImportJson(e.target.files)} className="hidden" />
        </label>
        <button className="px-2 py-1 bg-indigo-600 rounded text-xs" onClick={onShareCode}>Share Code</button>
        <button className="px-2 py-1 bg-purple-600 rounded text-xs" onClick={onExportZenkraft}>Export ZC</button>
        <label className="text-xs text-gray-300 px-2 py-1 rounded bg-purple-700 cursor-pointer">
          Import ZC
          <input type="file" accept=".txt,text/plain" onChange={e => onImportZenkraft(e.target.files)} className="hidden" />
        </label>
      </div>
      <div className="max-h-40 overflow-auto">
        {templates.length === 0 && <div className="text-xs text-gray-400">No templates saved</div>}
        {templates.map(t => (
          <div key={t.id} className="p-2 bg-gray-900 rounded my-1 flex items-center justify-between">
            <div className="text-xs truncate flex-1">{t.name}</div>
            <div className="flex gap-1">
              <button className="px-2 py-0.5 bg-green-600 text-xs rounded" onClick={() => onLoad(t)}>Load</button>
              <button className="px-2 py-0.5 bg-indigo-600 text-xs rounded" onClick={() => onCopyShareCode(t)}>Share</button>
              <button className="px-2 py-0.5 bg-red-600 text-xs rounded" onClick={() => onDelete(t.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
