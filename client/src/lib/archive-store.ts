/**
 * 设计提醒：数字档案盒的数据层。
 * 所有管理动作仅写入浏览器 localStorage；初始资源数据永远保留在 resources.ts，
 * 因此“恢复出厂值”不依赖网络，也不会修改项目源码。
 */
import { categories as initialCategories, resources as initialResources, type ResourceStatus } from "@/data/resources";

export type ArchiveCategory = {
  id: string;
  label: string;
  createdAt: string;
  isCustom?: boolean;
};

export type ArchiveResource = {
  id: string;
  title: string;
  url: string;
  status: ResourceStatus;
  category: string;
  section: string;
  createdAt?: string;
  isCustom?: boolean;
};

export type ArchiveStore = {
  version: 1;
  updatedAt: string;
  categories: ArchiveCategory[];
  resources: ArchiveResource[];
};

const STORAGE_KEY = "sky-archive-state-v1";
const BACKUP_KEY = "sky-archive-backup-v1";
const LEGACY_STORAGE_KEY = "xiaoshuai-archive-state-v1";
const LEGACY_BACKUP_KEY = "xiaoshuai-archive-backup-v1";
const now = () => new Date().toISOString();
const normalizeBrand = (value: string) => value.replace(/小帅同学/g, "Sky").replace(/小帅/g, "Sky");

export function createArchiveId(prefix: "category" | "bookmark") {
  const unique = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${unique}`;
}

export function createDefaultArchive(): ArchiveStore {
  const stamp = now();
  return {
    version: 1,
    updatedAt: stamp,
    categories: initialCategories
      .filter((category) => category.id !== "all")
      .map((category) => ({ id: normalizeBrand(category.id), label: normalizeBrand(category.label), createdAt: stamp })),
    resources: initialResources.map((resource) => ({
      ...resource,
      title: normalizeBrand(resource.title),
      category: normalizeBrand(resource.category),
      section: normalizeBrand(resource.section),
    })),
  };
}

export function createEmptyArchive(): ArchiveStore {
  return { version: 1, updatedAt: now(), categories: [], resources: [] };
}

export function touchArchive(archive: Omit<ArchiveStore, "updatedAt"> | ArchiveStore): ArchiveStore {
  return { ...archive, version: 1, updatedAt: now() };
}

function isStatus(value: unknown): value is ResourceStatus {
  return value === "可用" || value === "收藏" || value === "待核验";
}

export function isArchiveStore(value: unknown): value is ArchiveStore {
  if (!value || typeof value !== "object") return false;
  const archive = value as Partial<ArchiveStore>;
  if (!Array.isArray(archive.categories) || !Array.isArray(archive.resources)) return false;
  return archive.categories.every((category) => category && typeof category.id === "string" && typeof category.label === "string")
    && archive.resources.every((resource) => resource
      && typeof resource.id === "string"
      && typeof resource.title === "string"
      && typeof resource.url === "string"
      && typeof resource.category === "string"
      && typeof resource.section === "string"
      && isStatus(resource.status));
}

export function normalizeArchiveStore(value: ArchiveStore): ArchiveStore {
  const brandedCategories = value.categories.map((category) => ({ ...category, id: normalizeBrand(category.id), label: normalizeBrand(category.label) }));
  const brandedResources = value.resources.map((resource) => ({
    ...resource,
    title: normalizeBrand(resource.title),
    category: normalizeBrand(resource.category),
    section: normalizeBrand(resource.section),
  }));
  const categoryIds = new Set(brandedCategories.map((category) => category.id));
  const hasOrphans = brandedResources.some((resource) => !categoryIds.has(resource.category));
  const categories = hasOrphans && !categoryIds.has("uncategorized")
    ? [...brandedCategories, { id: "uncategorized", label: "未分类", createdAt: now(), isCustom: true }]
    : brandedCategories;
  const resolvedCategoryIds = new Set(categories.map((category) => category.id));
  return touchArchive({
    ...value,
    categories,
    resources: brandedResources.map((resource) => ({
      ...resource,
      category: resolvedCategoryIds.has(resource.category) ? resource.category : "uncategorized",
    })),
  });
}

export function loadArchiveStore(): ArchiveStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return createDefaultArchive();
    const parsed = JSON.parse(raw);
    return isArchiveStore(parsed) ? normalizeArchiveStore(parsed) : createDefaultArchive();
  } catch {
    return createDefaultArchive();
  }
}

export function saveArchiveStore(archive: ArchiveStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(archive));
}

export function saveLocalBackup(archive: ArchiveStore) {
  const snapshot = { ...archive, updatedAt: now() };
  localStorage.setItem(BACKUP_KEY, JSON.stringify(snapshot));
  return snapshot.updatedAt;
}

export function loadLocalBackup(): ArchiveStore | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY) ?? localStorage.getItem(LEGACY_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isArchiveStore(parsed) ? normalizeArchiveStore(parsed) : null;
  } catch {
    return null;
  }
}

export function downloadArchiveBackup(archive: ArchiveStore) {
  const file = new Blob([JSON.stringify({ ...archive, exportedAt: now() }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sky-archive-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function readArchiveBackup(file: File): Promise<ArchiveStore> {
  const parsed = JSON.parse(await file.text());
  if (!isArchiveStore(parsed)) throw new Error("文件结构不正确，请选择从本项目导出的 JSON 备份。");
  return normalizeArchiveStore(parsed);
}
