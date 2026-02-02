import { useMemo, useCallback } from 'react';
import type { Template, Item, SlotId } from '@/types';
import { calculateStats, generateTemplateReport } from '@/lib/statsCalculator';
import { parseZenkraftTemplate, exportZenkraftTemplate } from '@/lib/zenkcraft';
import { EquipmentManager, TemplateManager } from '@/services';
import { useLocalStorage } from './useLocalStorage';

/** Hook that manages template state and all template-related operations. */
export function useTemplate() {
  const [template, setTemplate] = useLocalStorage<Template>('currentTemplate', EquipmentManager.createEmptyTemplate());
  const [templates, setTemplates] = useLocalStorage<Template[]>('templates', []);

  const calculated = useMemo(() => calculateStats(template), [template]);

  const equipItem = useCallback((slotId: SlotId, item: Item | null) => {
    setTemplate(prev => EquipmentManager.equipItem(prev, slotId, item));
  }, [setTemplate]);

  const unequipSlot = useCallback((slotId: SlotId) => {
    setTemplate(prev => EquipmentManager.unequipSlot(prev, slotId));
  }, [setTemplate]);

  const newTemplate = useCallback(() => {
    setTemplate(EquipmentManager.createEmptyTemplate());
  }, [setTemplate]);

  const copyReport = useCallback(() => {
    navigator.clipboard.writeText(generateTemplateReport(template, calculated));
  }, [template, calculated]);

  const saveCurrentTemplate = useCallback((name?: string) => {
    const tpl = { ...template };
    if (name) tpl.name = name;
    setTemplates(prev => TemplateManager.saveTemplate(prev, tpl, name));
  }, [template, setTemplates]);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => TemplateManager.deleteTemplate(prev, id));
  }, [setTemplates]);

  const exportTemplatesJson = useCallback(() => {
    TemplateManager.exportAsJson(templates);
  }, [templates]);

  const importTemplatesJson = useCallback(async (files: FileList | null) => {
    if (!files || !files[0]) return;
    try {
      const result = await TemplateManager.importFromJson(templates, files[0]);
      setTemplates(result);
    } catch (e) {
      console.error('Failed importing templates', e);
    }
  }, [templates, setTemplates]);

  const encodeShareCode = useCallback((tpl: Template) => {
    return TemplateManager.encodeShareCode(tpl);
  }, []);

  const copyShareCode = useCallback(async (tpl: Template) => {
    const code = TemplateManager.encodeShareCode(tpl);
    if (!code) return;
    await navigator.clipboard.writeText(code);
    alert('Share code copied to clipboard');
  }, []);

  const importFromShareCodePrompt = useCallback(async () => {
    const code = window.prompt('Paste share code:');
    if (!code) return;
    const tpl = TemplateManager.decodeShareCode(code.trim());
    if (tpl) setTemplate(tpl);
    else alert('Invalid share code');
  }, [setTemplate]);

  const importZenkraftFile = useCallback(async (files: FileList | null) => {
    if (!files || !files[0]) return;
    try {
      const text = await files[0].text();
      const result = parseZenkraftTemplate(text);
      if (!result) {
        alert('Failed to parse Zenkraft template');
        return;
      }
      setTemplate(prev => ({
        ...prev,
        name: result.name,
        characterClass: result.characterClass as Template['characterClass'],
        realm: (result.realm as Template['realm']) || prev.realm,
        level: result.level,
        slots: { ...result.items },
        updatedAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.error('Failed importing Zenkraft template', e);
      alert('Failed to parse Zenkraft template file');
    }
  }, [setTemplate]);

  const exportZenkraftFile = useCallback(() => {
    const text = exportZenkraftTemplate(template, calculated);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}_zenkraft.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [template, calculated]);

  return {
    template, setTemplate,
    templates,
    calculated,
    equipItem, unequipSlot, newTemplate,
    copyReport,
    saveCurrentTemplate, deleteTemplate,
    exportTemplatesJson, importTemplatesJson,
    encodeShareCode, copyShareCode, importFromShareCodePrompt,
    importZenkraftFile, exportZenkraftFile,
  };
}
