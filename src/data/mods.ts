export interface SystemReq {
  gpu: string;
  ram: string;
  cpu: string;
}

export interface ChangelogItem {
  type: 'NEW' | 'FIX' | 'IMP' | 'REM';
  description: LocalizedText;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  isMajor?: boolean;
  changes: ChangelogItem[];
}

export type LocalizedText = { [key: string]: string };
export type LocalizedArray = { [key: string]: string[] };

export interface Mod {
  id: string;
  title: LocalizedText;
  version: string;
  author: string;
  authorAvatar: string;
  downloads: number;
  rating: number;
  size: number;
  category: LocalizedText;
  updated: string;
  tags: LocalizedArray;
  description: LocalizedText;
  features: LocalizedArray;
  mainImage: string;
  screenshots: string[];
  videoThumbnail?: string;
  requirements?: {
    minimum: SystemReq;
    recommended: SystemReq;
  };
  changelog?: ChangelogEntry[];
  // Технические поля для Базы Данных и Установщика
  downloadUrl?: string;       // URL источника файла
  fileHash?: string;          // SHA256 для проверки целостности
  installType?: 'rpf' | 'folder' | 'oiv' | 'script'; // Логика установки
  dependencies?: string[];    // ID зависимостей (например, ['scripthook-v'])
  compatibleVersions?: string[]; // Версии игры (Build ID), с которыми мод совместим
  supportedEditions?: ('enhanced' | 'legacy')[]; // Версии издания игры
  status?: 'working' | 'outdated' | 'broken'; // Статус работоспособности
  moderationStatus?: 'pending' | 'approved' | 'rejected'; // Статус модерации
  rejectReason?: string;      // Причина отказа
  ownerId?: string;           // ID владельца
}

export function getLocalized(obj: LocalizedText | undefined, lang: string): string;
export function getLocalized(obj: LocalizedArray | undefined, lang: string): string[];
export function getLocalized(obj: LocalizedText | LocalizedArray | undefined, lang: string): string | string[] {
  if (!obj) return "";
  // Fallback to 'en' if lang not found, or first key
  if (obj[lang]) return obj[lang];
  if (obj['en']) return obj['en'];
  const keys = Object.keys(obj);
  if (keys.length > 0) return obj[keys[0]];
  return "";
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDownloads(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
  return num.toString();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}