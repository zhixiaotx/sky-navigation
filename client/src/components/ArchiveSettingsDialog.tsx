/**
 * 设计提醒：数字档案盒的设置面板采用“管理抽屉”而非后台仪表盘。
 * 清晰区分分类、书签、数据工具，让高密度编辑仍然可被初学者逐步理解。
 */
import { type ChangeEvent, type FormEvent, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArchiveRestore,
  Download,
  FileUp,
  FolderPlus,
  PencilLine,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createArchiveId,
  createDefaultArchive,
  createEmptyArchive,
  downloadArchiveBackup,
  loadLocalBackup,
  readArchiveBackup,
  saveLocalBackup,
  touchArchive,
  type ArchiveCategory,
  type ArchiveResource,
  type ArchiveStore,
} from "@/lib/archive-store";
import type { ResourceStatus } from "@/data/resources";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archive: ArchiveStore;
  onArchiveChange: (archive: ArchiveStore) => void;
};

type BookmarkForm = { id?: string; title: string; url: string; category: string; section: string; status: ResourceStatus };
const blankBookmark = (category = ""): BookmarkForm => ({ title: "", url: "", category, section: "", status: "收藏" });

const statusOptions: ResourceStatus[] = ["可用", "收藏", "待核验"];

export default function ArchiveSettingsDialog({ open, onOpenChange, archive, onArchiveChange }: Props) {
  const [notice, setNotice] = useState("所有编辑仅保存在当前浏览器。");
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [bookmarkSearch, setBookmarkSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bookmarkForm, setBookmarkForm] = useState<BookmarkForm>(() => blankBookmark(archive.categories[0]?.id ?? ""));
  const importInputRef = useRef<HTMLInputElement>(null);

  const categoryCounts = useMemo(() => new Map(archive.categories.map((category) => [category.id, archive.resources.filter((resource) => resource.category === category.id).length])), [archive]);
  const visibleBookmarks = useMemo(() => {
    const query = bookmarkSearch.trim().toLowerCase();
    if (!query) return archive.resources.slice(0, 120);
    return archive.resources.filter((resource) => `${resource.title} ${resource.url} ${resource.section}`.toLowerCase().includes(query)).slice(0, 120);
  }, [archive.resources, bookmarkSearch]);

  const commit = (next: Omit<ArchiveStore, "updatedAt"> | ArchiveStore, message: string) => {
    onArchiveChange(touchArchive(next));
    setNotice(message);
  };

  const moveInList = <T,>(items: T[], index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return items;
    const next = [...items];
    [next[index], next[destination]] = [next[destination], next[index]];
    return next;
  };

  const addCategory = (event: FormEvent) => {
    event.preventDefault();
    const label = newCategory.trim();
    if (!label) return setNotice("请输入分类名称。");
    if (archive.categories.some((category) => category.label === label)) return setNotice("已有相同名称的分类，请换一个名称。");
    const category: ArchiveCategory = { id: createArchiveId("category"), label, createdAt: new Date().toISOString(), isCustom: true };
    commit({ ...archive, categories: [...archive.categories, category] }, `已新建“${label}”分类。`);
    setNewCategory("");
  };

  const saveCategoryName = (category: ArchiveCategory) => {
    const label = categoryDraft.trim();
    if (!label) return setNotice("分类名称不能为空。");
    if (archive.categories.some((item) => item.id !== category.id && item.label === label)) return setNotice("已有相同名称的分类，请换一个名称。");
    commit({ ...archive, categories: archive.categories.map((item) => item.id === category.id ? { ...item, label } : item) }, `已将分类重命名为“${label}”。`);
    setEditingCategory(null);
  };

  const moveCategory = (index: number, direction: -1 | 1) => {
    commit({ ...archive, categories: moveInList(archive.categories, index, direction) }, "已更新分类排序。");
  };

  const deleteCategory = (category: ArchiveCategory) => {
    const resourcesInCategory = archive.resources.filter((resource) => resource.category === category.id);
    const message = resourcesInCategory.length ? `删除“${category.label}”后，其中 ${resourcesInCategory.length} 条书签将转入“未分类”。是否继续？` : `确认删除“${category.label}”？`;
    if (!window.confirm(message)) return;
    let fallback = archive.categories.find((item) => item.id === "uncategorized");
    let categories = archive.categories.filter((item) => item.id !== category.id);
    if (resourcesInCategory.length && !fallback) {
      fallback = { id: "uncategorized", label: "未分类", createdAt: new Date().toISOString(), isCustom: true };
      categories = [...categories, fallback];
    }
    commit({ ...archive, categories, resources: archive.resources.map((resource) => resource.category === category.id ? { ...resource, category: fallback?.id ?? resource.category } : resource) }, "分类已删除，关联书签已安全处理。");
  };

  const submitBookmark = (event: FormEvent) => {
    event.preventDefault();
    const title = bookmarkForm.title.trim();
    const url = bookmarkForm.url.trim();
    if (!title || !url || !bookmarkForm.category) return setNotice("请完成书签名称、链接和所属分类。");
    try { new URL(url); } catch { return setNotice("链接格式不正确，请输入完整的 http(s) 地址。"); }
    const payload = { title, url, category: bookmarkForm.category, section: bookmarkForm.section.trim() || "自定义书签", status: bookmarkForm.status };
    if (bookmarkForm.id) {
      commit({ ...archive, resources: archive.resources.map((resource) => resource.id === bookmarkForm.id ? { ...resource, ...payload } : resource) }, `已更新“${title}”。`);
    } else {
      const resource: ArchiveResource = { id: createArchiveId("bookmark"), ...payload, createdAt: new Date().toISOString(), isCustom: true };
      commit({ ...archive, resources: [...archive.resources, resource] }, `已添加“${title}”。`);
    }
    setBookmarkForm(blankBookmark(archive.categories[0]?.id ?? ""));
  };

  const editBookmark = (resource: ArchiveResource) => {
    setBookmarkForm({ id: resource.id, title: resource.title, url: resource.url, category: resource.category, section: resource.section, status: resource.status });
    setNotice(`正在编辑“${resource.title}”。`);
  };

  const deleteBookmark = (id: string) => {
    const resource = archive.resources.find((item) => item.id === id);
    if (!resource || !window.confirm(`确认删除书签“${resource.title}”？`)) return;
    commit({ ...archive, resources: archive.resources.filter((item) => item.id !== id) }, "书签已删除。");
    setSelectedIds((ids) => ids.filter((item) => item !== id));
  };

  const toggleBookmark = (id: string) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const selectVisible = () => setSelectedIds(selectedIds.length === visibleBookmarks.length ? [] : visibleBookmarks.map((resource) => resource.id));

  const moveBookmark = (resource: ArchiveResource, direction: -1 | 1) => {
    const peers = archive.resources.filter((item) => item.category === resource.category);
    const peerIndex = peers.findIndex((item) => item.id === resource.id);
    const reorderedPeers = moveInList(peers, peerIndex, direction);
    if (peers === reorderedPeers) return;
    let nextPeerIndex = 0;
    const resources = archive.resources.map((item) => item.category === resource.category ? reorderedPeers[nextPeerIndex++] : item);
    commit({ ...archive, resources }, "已调整该分类内的书签排序。");
  };

  const applyBulkMove = () => {
    if (!selectedIds.length) return setNotice("请先勾选需要处理的书签。");
    if (!bulkCategory) return setNotice("请选择目标分类。");
    commit({ ...archive, resources: archive.resources.map((resource) => selectedIds.includes(resource.id) ? { ...resource, category: bulkCategory } : resource) }, `已移动 ${selectedIds.length} 条书签到目标分类。`);
    setSelectedIds([]);
  };

  const applyBulkDelete = () => {
    if (!selectedIds.length) return setNotice("请先勾选需要处理的书签。");
    if (!window.confirm(`确认批量删除选中的 ${selectedIds.length} 条书签？此操作可通过备份恢复。`)) return;
    commit({ ...archive, resources: archive.resources.filter((resource) => !selectedIds.includes(resource.id)) }, `已删除 ${selectedIds.length} 条书签。`);
    setSelectedIds([]);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const backup = await readArchiveBackup(file);
      if (!window.confirm(`确认以备份中的 ${backup.categories.length} 个分类和 ${backup.resources.length} 条书签覆盖当前数据？`)) return;
      onArchiveChange(backup);
      setNotice("文件备份已恢复。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "无法读取该备份文件。");
    } finally {
      event.target.value = "";
    }
  };

  const restoreLocalBackup = () => {
    const backup = loadLocalBackup();
    if (!backup) return setNotice("尚未找到本地备份；请先使用“本地备份”。");
    if (!window.confirm(`确认还原 ${new Date(backup.updatedAt).toLocaleString("zh-CN")} 保存的本地备份？`)) return;
    onArchiveChange(backup);
    setNotice("本地备份已还原。");
  };

  const clearArchive = () => {
    if (!window.confirm("确认清除当前所有分类与书签？建议先执行“一键备份”。")) return;
    onArchiveChange(createEmptyArchive());
    setSelectedIds([]);
    setBookmarkForm(blankBookmark());
    setNotice("当前数据已清除；可随时恢复本地备份或恢复出厂值。");
  };

  const factoryReset = () => {
    if (!window.confirm("确认恢复出厂值？这会用项目内置的原始资源覆盖当前内容。")) return;
    onArchiveChange(createDefaultArchive());
    setSelectedIds([]);
    setBookmarkForm(blankBookmark());
    setNotice("已恢复项目内置的原始资源数据。");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="archive-settings-dialog" showCloseButton={false}>
        <DialogHeader className="settings-header">
          <div>
            <p className="eyebrow"><span /> ARCHIVE CONTROL ROOM</p>
            <DialogTitle>整理这间储物间</DialogTitle>
            <DialogDescription>分类、书签与数据工具都只作用于当前浏览器；导出 JSON 后可跨设备恢复。</DialogDescription>
          </div>
          <button type="button" className="settings-close" onClick={() => onOpenChange(false)}>完成</button>
        </DialogHeader>

        <Tabs defaultValue="categories" className="settings-tabs">
          <TabsList className="settings-tabs-list">
            <TabsTrigger value="categories">分类管理</TabsTrigger>
            <TabsTrigger value="bookmarks">书签管理</TabsTrigger>
            <TabsTrigger value="data">数据工具</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="settings-panel">
            <div className="settings-section-title">
              <div><h3>分类书脊</h3><p>新增、重命名、删除或调整分类顺序；删除时会将书签放入“未分类”。</p></div>
              <span>{archive.categories.length} 个分类</span>
            </div>
            <form className="inline-create" onSubmit={addCategory}>
              <FolderPlus size={18} />
              <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="输入新分类名称，例如：设计灵感" />
              <button type="submit"><Plus size={15} /> 新增分类</button>
            </form>
            <div className="manager-list category-manager-list">
              {archive.categories.length ? archive.categories.map((category, index) => (
                <div className="manager-row" key={category.id}>
                  <span className="drag-index">{String(index + 1).padStart(2, "0")}</span>
                  {editingCategory === category.id ? (
                    <input className="rename-input" autoFocus value={categoryDraft} onChange={(event) => setCategoryDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveCategoryName(category); if (event.key === "Escape") setEditingCategory(null); }} />
                  ) : <span className="manager-title">{category.label}</span>}
                  <span className="manager-count">{categoryCounts.get(category.id) ?? 0} 条</span>
                  <div className="row-actions">
                    {editingCategory === category.id ? <button type="button" onClick={() => saveCategoryName(category)} title="保存分类名称"><Save size={15} /></button> : <button type="button" onClick={() => { setEditingCategory(category.id); setCategoryDraft(category.label); }} title="重命名"><PencilLine size={15} /></button>}
                    <button type="button" onClick={() => moveCategory(index, -1)} disabled={!index} title="上移"><ArrowUp size={15} /></button>
                    <button type="button" onClick={() => moveCategory(index, 1)} disabled={index === archive.categories.length - 1} title="下移"><ArrowDown size={15} /></button>
                    <button type="button" className="danger-icon" onClick={() => deleteCategory(category)} title="删除"><Trash2 size={15} /></button>
                  </div>
                </div>
              )) : <div className="manager-empty">当前没有分类。可以先新增分类，或在“数据工具”中恢复出厂值。</div>}
            </div>
          </TabsContent>

          <TabsContent value="bookmarks" className="settings-panel">
            <div className="settings-section-title">
              <div><h3>{bookmarkForm.id ? "编辑书签" : "添加书签"}</h3><p>可创建新书签，也可编辑、移动、排序和批量处理已有条目。</p></div>
              <span>{archive.resources.length.toLocaleString()} 条书签</span>
            </div>
            <form className="bookmark-editor" onSubmit={submitBookmark}>
              <input value={bookmarkForm.title} onChange={(event) => setBookmarkForm({ ...bookmarkForm, title: event.target.value })} placeholder="书签名称" aria-label="书签名称" />
              <input value={bookmarkForm.url} onChange={(event) => setBookmarkForm({ ...bookmarkForm, url: event.target.value })} placeholder="https://example.com" aria-label="书签链接" />
              <select value={bookmarkForm.category} onChange={(event) => setBookmarkForm({ ...bookmarkForm, category: event.target.value })} aria-label="所属分类">
                <option value="">选择分类</option>
                {archive.categories.map((category) => <option value={category.id} key={category.id}>{category.label}</option>)}
              </select>
              <input value={bookmarkForm.section} onChange={(event) => setBookmarkForm({ ...bookmarkForm, section: event.target.value })} placeholder="小分组（可选）" aria-label="小分组" />
              <select value={bookmarkForm.status} onChange={(event) => setBookmarkForm({ ...bookmarkForm, status: event.target.value as ResourceStatus })} aria-label="资源状态">
                {statusOptions.map((status) => <option value={status} key={status}>{status}</option>)}
              </select>
              <button type="submit"><Save size={15} /> {bookmarkForm.id ? "保存书签" : "添加书签"}</button>
              {bookmarkForm.id && <button type="button" className="ghost-action" onClick={() => setBookmarkForm(blankBookmark(archive.categories[0]?.id ?? ""))}>取消</button>}
            </form>
            <div className="bookmark-toolbar">
              <label className="compact-search"><Search size={15} /><input value={bookmarkSearch} onChange={(event) => setBookmarkSearch(event.target.value)} placeholder="搜索书签名称、网址或分组" /></label>
              <div className="bulk-actions">
                <button type="button" onClick={selectVisible}>{selectedIds.length === visibleBookmarks.length && visibleBookmarks.length ? "取消全选" : "选择当前结果"}</button>
                <select value={bulkCategory} onChange={(event) => setBulkCategory(event.target.value)} aria-label="批量移动目标分类"><option value="">移动至…</option>{archive.categories.map((category) => <option value={category.id} key={category.id}>{category.label}</option>)}</select>
                <button type="button" onClick={applyBulkMove}>批量移动</button>
                <button type="button" className="danger-text" onClick={applyBulkDelete}>批量删除</button>
              </div>
            </div>
            <div className="manager-list bookmark-manager-list">
              {visibleBookmarks.map((resource) => {
                const category = archive.categories.find((item) => item.id === resource.category);
                return <div className="bookmark-row" key={resource.id}>
                  <input type="checkbox" checked={selectedIds.includes(resource.id)} onChange={() => toggleBookmark(resource.id)} aria-label={`选择 ${resource.title}`} />
                  <span className="bookmark-main"><strong>{resource.title}</strong><small>{category?.label ?? "未分类"} · {resource.section} · {resource.status}</small></span>
                  <div className="row-actions">
                    <button type="button" onClick={() => editBookmark(resource)} title="编辑"><PencilLine size={15} /></button>
                    <button type="button" onClick={() => moveBookmark(resource, -1)} title="分类内上移"><ArrowUp size={15} /></button>
                    <button type="button" onClick={() => moveBookmark(resource, 1)} title="分类内下移"><ArrowDown size={15} /></button>
                    <button type="button" className="danger-icon" onClick={() => deleteBookmark(resource.id)} title="删除"><Trash2 size={15} /></button>
                  </div>
                </div>;
              })}
              {visibleBookmarks.length === 0 && <div className="manager-empty">没有匹配书签。请修改搜索词，或先新增一条书签。</div>}
            </div>
            {archive.resources.length > visibleBookmarks.length && <p className="settings-footnote">为保证管理面板流畅，单次显示前 120 条匹配书签；请用搜索缩小范围。</p>}
          </TabsContent>

          <TabsContent value="data" className="settings-panel">
            <div className="settings-section-title"><div><h3>数据工具</h3><p>原始资源、当前编辑和备份文件彼此独立；执行清除或恢复前，建议先导出 JSON。</p></div><span>本地模式</span></div>
            <div className="data-tool-grid">
              <section className="data-tool-card"><Download size={20} /><h4>一键备份</h4><p>导出当前全部分类与书签为 JSON 文件，可保存至任意位置。</p><button type="button" onClick={() => { downloadArchiveBackup(archive); setNotice("备份 JSON 已下载。"); }}>导出 JSON</button></section>
              <section className="data-tool-card"><Save size={20} /><h4>本地备份</h4><p>在当前浏览器另存一份快照，适合进行编辑前的快速保护。</p><button type="button" onClick={() => setNotice(`已在当前浏览器保存本地备份：${new Date(saveLocalBackup(archive)).toLocaleString("zh-CN")}。`)}>保存快照</button></section>
              <section className="data-tool-card"><ArchiveRestore size={20} /><h4>一键还原</h4><p>从当前浏览器最近一次保存的本地备份恢复数据。</p><button type="button" onClick={restoreLocalBackup}>还原快照</button></section>
              <section className="data-tool-card"><FileUp size={20} /><h4>文件恢复</h4><p>选择此前导出的 JSON 备份文件，覆盖恢复到该备份状态。</p><button type="button" onClick={() => importInputRef.current?.click()}>导入 JSON</button><input ref={importInputRef} className="sr-only" type="file" accept="application/json,.json" onChange={handleImport} /></section>
              <section className="data-tool-card danger-card"><Trash2 size={20} /><h4>一键清除</h4><p>清空当前浏览器中的分类和书签，不影响导出的备份文件。</p><button type="button" onClick={clearArchive}>清除当前数据</button></section>
              <section className="data-tool-card danger-card"><RotateCcw size={20} /><h4>恢复出厂值</h4><p>以项目内置的原始分类和资源覆盖当前所有本地编辑。</p><button type="button" onClick={factoryReset}>恢复原始数据</button></section>
            </div>
            <div className="data-summary"><span>当前数据</span><strong>{archive.categories.length} 个分类 · {archive.resources.length.toLocaleString()} 条书签</strong><span>最近变更：{new Date(archive.updatedAt).toLocaleString("zh-CN")}</span></div>
          </TabsContent>
        </Tabs>
        <p className="settings-notice" role="status">{notice}</p>
      </DialogContent>
    </Dialog>
  );
}
