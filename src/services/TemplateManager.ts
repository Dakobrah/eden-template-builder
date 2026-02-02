import type { Template } from '@/types';

/** Handles template CRUD operations, persistence, import/export, and share codes. */
export class TemplateManager {
  /** Generate a unique ID for templates. */
  static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /** Save a template to the list, updating if it already exists. */
  static saveTemplate(templates: Template[], template: Template, name?: string): Template[] {
    const tpl = { ...template };
    if (name) tpl.name = name;
    const idx = templates.findIndex(p => p.id === tpl.id);
    if (idx >= 0) {
      const copy = [...templates];
      copy[idx] = tpl;
      return copy;
    }
    return [...templates, tpl];
  }

  /** Remove a template by ID. */
  static deleteTemplate(templates: Template[], id: string): Template[] {
    return templates.filter(t => t.id !== id);
  }

  /** Export templates list as a downloadable JSON blob. */
  static exportAsJson(templates: Template[]): void {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /** Import templates from a JSON file, merging with existing by ID. */
  static async importFromJson(existing: Template[], file: File): Promise<Template[]> {
    const text = await file.text();
    const parsed = JSON.parse(text) as Template[];
    const map = new Map(existing.map(t => [t.id, t]));
    parsed.forEach(p => map.set(p.id || `tpl_${Math.random().toString(36).slice(2, 8)}`, p));
    return Array.from(map.values());
  }

  /** Encode a template to a URL-safe Base64 share code. */
  static encodeShareCode(template: Template): string {
    try {
      const json = JSON.stringify(template);
      const utf = encodeURIComponent(json);
      const b64 = btoa(utf);
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch {
      return '';
    }
  }

  /** Decode a share code back to a Template. */
  static decodeShareCode(code: string): Template | null {
    try {
      const pad = code.length % 4 ? '='.repeat(4 - (code.length % 4)) : '';
      const b64 = code.replace(/-/g, '+').replace(/_/g, '/') + pad;
      const utf = atob(b64);
      const json = decodeURIComponent(utf);
      return JSON.parse(json) as Template;
    } catch {
      return null;
    }
  }

  /** Load a value from localStorage with a fallback. */
  static loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  /** Persist a value to localStorage. */
  static saveToStorage(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch { /* ignored */ }
  }
}
