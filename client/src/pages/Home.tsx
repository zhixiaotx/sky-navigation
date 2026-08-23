/**
 * 设计提醒：数字档案盒——以独立的目录书脊与可滚动资源卷宗承载高密度链接；
 * 设置入口收纳本地管理动作，让站点既可浏览也可由用户自行整理。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowUpRight,
  BookOpenText,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileSearch,
  Globe2,
  LayoutGrid,
  List,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  Sun,
  X,
} from "lucide-react";
import ArchiveSettingsDialog from "@/components/ArchiveSettingsDialog";
import {
  loadArchiveStore,
  saveArchiveStore,
  type ArchiveStore,
} from "@/lib/archive-store";
import { allResourcesIcon, buildCategoryTree } from "@/lib/category-tree";
import { DEFAULT_SEARCH_ENGINE, searchEngines } from "@/lib/search-engines";
import type { ResourceStatus } from "@/data/resources";

const HERO_IMAGE = "/manus-storage/xiaoshuai-archive-hero_de3ff727.png";
const SHELF_IMAGE = "/manus-storage/xiaoshuai-archive-shelf_884bd474.png";
const FLOWER_LOGO_URL =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663851357957/VCOcinrGrvlVYrKy.jpg";
const LOGO_IMAGE = FLOWER_LOGO_URL;

const statusOrder: ResourceStatus[] = ["可用", "收藏", "待核验"];
type ResourceView = "compact" | "cards";

const statusClass: Record<ResourceStatus, string> = {
  可用: "is-live",
  收藏: "is-saved",
  待核验: "is-check",
};

const cleanCategoryName = (name: string) =>
  name
    .replace(/^\d{2}\s*/, "")
    .replace(/🔥/g, "")
    .trim();
const categoryAnchorId = (id: string) =>
  `resource-category-${encodeURIComponent(id)}`;
const sectionAnchorId = (categoryId: string, section: string) =>
  `resource-section-${encodeURIComponent(categoryId)}-${encodeURIComponent(section)}`;
const formatResourceUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    const label = `${parsed.hostname.replace(/^www\./, "")}${path}`;
    return label.length > 52 ? `${label.slice(0, 49)}…` : label;
  } catch {
    return url;
  }
};

export default function Home() {
  const [archive, setArchive] = useState<ArchiveStore>(() =>
    loadArchiveStore()
  );
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ResourceStatus | "全部">(
    "全部"
  );
  const [isDark, setIsDark] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<"internal" | "external">(
    "internal"
  );
  const [searchEngineId, setSearchEngineId] = useState(() => {
    try {
      return (
        localStorage.getItem("xiaoshuai-search-engine") || DEFAULT_SEARCH_ENGINE
      );
    } catch {
      return DEFAULT_SEARCH_ENGINE;
    }
  });
  const [resourceView, setResourceView] = useState<ResourceView>(() => {
    try {
      return localStorage.getItem("sky-resource-view") === "cards"
        ? "cards"
        : "compact";
    } catch {
      return "compact";
    }
  });
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    () => new Set(["01 爆火 AI🔥"])
  );
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    saveArchiveStore(archive);
  }, [archive]);

  useEffect(() => {
    localStorage.setItem("xiaoshuai-search-engine", searchEngineId);
  }, [searchEngineId]);

  useEffect(() => {
    localStorage.setItem("sky-resource-view", resourceView);
  }, [resourceView]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (
      selectedCategory !== "all" &&
      !archive.categories.some(category => category.id === selectedCategory)
    ) {
      setSelectedCategory("all");
      setSelectedSection(null);
    }
  }, [archive.categories, selectedCategory]);

  const categoryTree = useMemo(
    () => buildCategoryTree(archive.categories, archive.resources),
    [archive]
  );

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return archive.resources.filter(resource => {
      const matchesStatus =
        selectedStatus === "全部" || resource.status === selectedStatus;
      const haystack =
        `${resource.title} ${resource.category} ${resource.section}`.toLowerCase();
      return (
        matchesStatus &&
        (!normalizedQuery || haystack.includes(normalizedQuery))
      );
    });
  }, [archive.resources, query, selectedStatus]);

  const groupedResources = useMemo(() => {
    const grouped = new Map<
      string,
      {
        id: string;
        label: string;
        groups: Map<string, typeof filteredResources>;
      }
    >();
    for (const resource of filteredResources) {
      const categoryName =
        archive.categories.find(category => category.id === resource.category)
          ?.label ?? "未分类";
      const category = grouped.get(resource.category) ?? {
        id: resource.category,
        label: categoryName,
        groups: new Map(),
      };
      const groupName = resource.section || "未分组";
      const items = category.groups.get(groupName) ?? [];
      items.push(resource);
      category.groups.set(groupName, items);
      grouped.set(resource.category, category);
    }
    return Array.from(grouped.values()).map(category => ({
      ...category,
      groups: Array.from(category.groups, ([name, items]) => ({ name, items })),
    }));
  }, [archive.categories, filteredResources]);

  const displayedCategories = useMemo(() => {
    if (!query.trim()) return groupedResources;
    let remaining = 180;
    return groupedResources
      .map(category => {
        const groups = category.groups
          .map(group => {
            const items = group.items.slice(0, Math.max(0, remaining));
            remaining -= items.length;
            return { ...group, items };
          })
          .filter(group => group.items.length);
        return { ...category, groups };
      })
      .filter(category => category.groups.length);
  }, [groupedResources, query]);

  const totalShown = displayedCategories.reduce(
    (total, category) =>
      total +
      category.groups.reduce(
        (groupTotal, group) => groupTotal + group.items.length,
        0
      ),
    0
  );
  const selectedSearchEngine =
    searchEngines.find(engine => engine.id === searchEngineId) ??
    searchEngines[0];

  const chooseCategory = (
    id: string,
    section: string | null = null,
    toggleBranch = false
  ) => {
    setSelectedCategory(id);
    setSelectedSection(section);
    if (id !== "all")
      setExpandedCategoryIds(ids => {
        const next = new Set(ids);
        if (toggleBranch) next.has(id) ? next.delete(id) : next.add(id);
        else next.add(id);
        return next;
      });
    setIsDrawerOpen(false);
    const targetId =
      id === "all"
        ? "resource-ledger-start"
        : section
          ? sectionAnchorId(id, section)
          : categoryAnchorId(id);
    requestAnimationFrame(() =>
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = query.trim();
    if (searchMode === "external" && keyword) {
      window.open(
        `${selectedSearchEngine.queryUrl}${encodeURIComponent(keyword)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <div className="archive-shell">
      <header className="archive-topbar">
        <a className="brand-lockup" href="#top" aria-label="返回页面顶部">
          <img className="brand-mark" src={LOGO_IMAGE} alt="" />
          <span className="brand-name">
            <span>SKY PERSONAL / 01</span>
            <strong>储物间</strong>
            <em>RESOURCE ARCHIVE</em>
          </span>
        </a>

        <div className="topbar-actions">
          <span className="edition-stamp">PERSONAL INDEX · LOCAL EDITION</span>
          <button
            type="button"
            className="settings-control"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="打开资料管理设置"
          >
            <Settings2 size={17} />
            <span>管理</span>
          </button>
          <button
            type="button"
            className="icon-control"
            onClick={() => setIsDark(value => !value)}
            aria-label={isDark ? "切换为浅色主题" : "切换为深色主题"}
            title={isDark ? "切换为浅色主题" : "切换为深色主题"}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            type="button"
            className="menu-control"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="打开分类目录"
          >
            <Menu size={18} />
            <span>目录</span>
          </button>
        </div>
      </header>

      <main id="top">
        <section
          className="archive-hero"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        >
          <div className="hero-copy">
            <p className="eyebrow">
              <span /> RESOURCE SHELF / 资源索引册
            </p>
            <h1>
              把常用资源
              <br />
              收进一页索引。
            </h1>
            <p className="hero-summary">
              从学习资料到软件工具，这间储物间现在支持分类整理、书签维护与本地备份。已收录{" "}
              <strong>{archive.resources.length.toLocaleString()}</strong>{" "}
              条外链。
            </p>
            <form className="search-suite" onSubmit={submitSearch}>
              <div className="search-mode-switch" aria-label="选择搜索范围">
                <button
                  type="button"
                  className={searchMode === "internal" ? "is-active" : ""}
                  onClick={() => setSearchMode("internal")}
                >
                  <Search size={14} /> 站内搜
                </button>
                <button
                  type="button"
                  className={searchMode === "external" ? "is-active" : ""}
                  onClick={() => setSearchMode("external")}
                >
                  <Globe2 size={14} /> 站外搜
                </button>
              </div>
              <div className="hero-search">
                <Search size={20} aria-hidden="true" />
                <input
                  ref={searchRef}
                  id="resource-search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={
                    searchMode === "internal"
                      ? "输入关键词，直接定位到那条链接"
                      : `使用 ${selectedSearchEngine.label} 搜索全网`
                  }
                  autoComplete="off"
                />
                {searchMode === "external" && (
                  <select
                    value={searchEngineId}
                    onChange={event => setSearchEngineId(event.target.value)}
                    aria-label="选择站外搜索引擎"
                  >
                    {(["国内", "国际"] as const).map(region => (
                      <optgroup key={region} label={`${region}搜索引擎`}>
                        {searchEngines
                          .filter(engine => engine.region === region)
                          .map(engine => (
                            <option key={engine.id} value={engine.id}>
                              {engine.label}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                )}
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="清空搜索"
                  >
                    <X size={17} />
                  </button>
                )}
                {searchMode === "external" && (
                  <button
                    type="submit"
                    className="external-submit"
                    aria-label={`使用 ${selectedSearchEngine.label} 搜索`}
                  >
                    <Globe2 size={17} />
                  </button>
                )}
              </div>
              <p className="search-helper">
                {searchMode === "internal"
                  ? "站内搜：实时筛选当前储物间的资源记录。"
                  : `站外搜：将以 ${selectedSearchEngine.label} 在新标签页打开搜索结果。`}
              </p>
            </form>
            <div className="hero-metrics" aria-label="资源统计">
              <div>
                <strong>{archive.categories.length}</strong>
                <span>个主题目录</span>
              </div>
              <div>
                <strong>{archive.resources.length.toLocaleString()}</strong>
                <span>条已收录链接</span>
              </div>
              <div>
                <strong>⌘ K</strong>
                <span>聚焦搜索框</span>
              </div>
            </div>
          </div>
          <div className="hero-index-card" aria-hidden="true">
            <div className="index-card-tab">ARCHIVE / LOCAL</div>
            <Archive size={28} strokeWidth={1.4} />
            <span>
              常用资源
              <br />
              随取随用
            </span>
          </div>
        </section>

        <div
          className={`archive-body ${isSidebarCollapsed ? "is-sidebar-collapsed" : ""}`}
        >
          <aside
            className={`archive-sidebar ${isDrawerOpen ? "is-open" : ""}`}
            aria-label="资源分类"
          >
            <div className="sidebar-inner">
              <div className="sidebar-heading">
                <div>
                  <p className="eyebrow">
                    <span /> FOLDER INDEX
                  </p>
                  <h2>目录书脊</h2>
                </div>
                <div className="sidebar-heading-actions">
                  <button
                    type="button"
                    className="sidebar-collapse-control"
                    onClick={() => setIsSidebarCollapsed(value => !value)}
                    aria-label={
                      isSidebarCollapsed ? "展开左侧分类栏" : "折叠左侧分类栏"
                    }
                    title={isSidebarCollapsed ? "展开分类栏" : "折叠分类栏"}
                  >
                    {isSidebarCollapsed ? (
                      <PanelLeftOpen size={17} />
                    ) : (
                      <PanelLeftClose size={17} />
                    )}
                  </button>
                  <button
                    type="button"
                    className="drawer-close"
                    onClick={() => setIsDrawerOpen(false)}
                    aria-label="关闭分类目录"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <nav
                className="category-nav category-tree"
                aria-label="多级资源分类"
              >
                <button
                  type="button"
                  className={`category-link category-link--all ${selectedCategory === "all" ? "is-active" : ""}`}
                  onClick={() => chooseCategory("all")}
                >
                  <span className="category-icon">
                    {(() => {
                      const Icon = allResourcesIcon;
                      return <Icon size={15} />;
                    })()}
                  </span>
                  <span className="category-label">全部索引</span>
                  <span className="category-count">
                    {archive.resources.length}
                  </span>
                </button>
                {categoryTree.map(category => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategoryIds.has(category.id);
                  return (
                    <div
                      className={`category-branch ${isExpanded ? "is-expanded" : ""}`}
                      key={category.id}
                    >
                      <div className="category-branch-row">
                        <button
                          type="button"
                          className={`category-link category-link--root ${selectedCategory === category.id && !selectedSection ? "is-active" : ""}`}
                          onClick={() =>
                            chooseCategory(
                              category.id,
                              null,
                              Boolean(category.children?.length)
                            )
                          }
                          title={`${isExpanded ? "点击收起" : "点击展开"} ${cleanCategoryName(category.label)}`}
                          aria-expanded={
                            category.children?.length ? isExpanded : undefined
                          }
                        >
                          <span className="category-icon">
                            <Icon size={15} />
                          </span>
                          <span className="category-label">
                            {cleanCategoryName(category.label)}
                          </span>
                          <span className="category-count">
                            {category.count}
                          </span>
                          {category.children?.length ? (
                            <ChevronDown
                              className="category-disclosure"
                              size={14}
                              aria-hidden="true"
                            />
                          ) : null}
                        </button>
                      </div>
                      {isExpanded && category.children?.length ? (
                        <div className="category-children">
                          {category.children.map(child => {
                            const ChildIcon = child.icon;
                            return (
                              <button
                                type="button"
                                key={child.id}
                                className={`category-link category-link--child ${selectedCategory === category.id && selectedSection === child.label ? "is-active" : ""}`}
                                onClick={() =>
                                  chooseCategory(category.id, child.label)
                                }
                                title={child.label}
                              >
                                <span className="category-icon">
                                  <ChildIcon size={14} />
                                </span>
                                <span className="category-label">
                                  {child.label}
                                </span>
                                <span className="category-count">
                                  {child.count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </nav>
              <button
                type="button"
                className="sidebar-manage"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsSettingsOpen(true);
                }}
                aria-label="管理分类与书签"
              >
                <Settings2 size={16} /> <span>管理分类与书签</span>
              </button>
              <div className="sidebar-note">
                <BookOpenText size={18} />
                <p>
                  Sky
                  的目录与资源清单独立滚动。外链由你本地管理，可随时备份或恢复。
                </p>
              </div>
            </div>
          </aside>
          {isDrawerOpen && (
            <button
              type="button"
              className="drawer-scrim"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="关闭目录遮罩"
            />
          )}

          <section
            className="resource-ledger"
            id="resource-ledger-start"
            aria-label="资源列表"
            tabIndex={-1}
          >
            <div className="ledger-topline">
              <div>
                <p className="eyebrow">
                  <span /> CURRENT FILE
                </p>
                <h2>全部资源索引</h2>
              </div>
              <div className="ledger-actions">
                <div className="result-counter">
                  <FileSearch size={17} />
                  <span>
                    {query
                      ? `找到 ${filteredResources.length.toLocaleString()} 条`
                      : `本册 ${filteredResources.length.toLocaleString()} 条`}
                  </span>
                </div>
                <div
                  className="resource-view-toggle"
                  role="group"
                  aria-label="切换资源浏览视图"
                >
                  <button
                    type="button"
                    className={resourceView === "compact" ? "is-active" : ""}
                    onClick={() => setResourceView("compact")}
                    aria-pressed={resourceView === "compact"}
                    title="紧凑视图"
                  >
                    <List size={15} />
                    <span>紧凑</span>
                  </button>
                  <button
                    type="button"
                    className={resourceView === "cards" ? "is-active" : ""}
                    onClick={() => setResourceView("cards")}
                    aria-pressed={resourceView === "cards"}
                    title="卡片视图"
                  >
                    <LayoutGrid size={15} />
                    <span>卡片</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="filter-strip" aria-label="资源状态筛选">
              <span className="filter-caption">状态筛选</span>
              <div className="status-filters">
                <button
                  type="button"
                  className={selectedStatus === "全部" ? "is-selected" : ""}
                  onClick={() => setSelectedStatus("全部")}
                >
                  全部
                </button>
                {statusOrder.map(status => (
                  <button
                    key={status}
                    type="button"
                    className={selectedStatus === status ? "is-selected" : ""}
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status === "可用" && <Check size={13} />} {status}
                  </button>
                ))}
              </div>
            </div>
            {displayedCategories.length ? (
              <div className="resource-category-groups">
                {displayedCategories.map((category, categoryIndex) => (
                  <section
                    className="resource-category-group"
                    id={categoryAnchorId(category.id)}
                    key={category.id}
                  >
                    <div className="category-ledger-heading">
                      <div>
                        <span>
                          {String(categoryIndex + 1).padStart(2, "0")}
                        </span>
                        <h3>{cleanCategoryName(category.label)}</h3>
                      </div>
                      <p>
                        {category.groups.reduce(
                          (total, group) => total + group.items.length,
                          0
                        )}{" "}
                        条网址模块
                      </p>
                    </div>
                    <div className="resource-groups">
                      {category.groups.map((group, groupIndex) => (
                        <section
                          className="resource-group"
                          id={sectionAnchorId(category.id, group.name)}
                          key={`${category.id}-${group.name}`}
                        >
                          <div className="group-header">
                            <div className="group-title">
                              <span>
                                {String(groupIndex + 1).padStart(2, "0")}
                              </span>
                              <h3>{group.name}</h3>
                            </div>
                            <span>{group.items.length} 条记录</span>
                          </div>
                          <div
                            className={`resource-list ${resourceView === "cards" ? "resource-list--cards" : "resource-list--compact"}`}
                          >
                            {group.items.map((resource, itemIndex) => (
                              <a
                                className="resource-row"
                                key={resource.id}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span
                                  className={`resource-status ${statusClass[resource.status]}`}
                                  aria-label={resource.status}
                                />
                                <span className="resource-order">
                                  {String(itemIndex + 1).padStart(2, "0")}
                                </span>
                                <span className="resource-title">
                                  {resource.title}
                                </span>
                                <span className="resource-details">
                                  <span className="resource-category-tag">
                                    {cleanCategoryName(resource.category)}
                                  </span>
                                  <span className="resource-section-tag">
                                    {resource.section}
                                  </span>
                                  <span
                                    className="resource-url"
                                    title={resource.url}
                                  >
                                    {formatResourceUrl(resource.url)}
                                  </span>
                                </span>
                                <span className="resource-meta">
                                  <span className="status-word">
                                    {resource.status}
                                  </span>
                                  <ArrowUpRight size={15} aria-hidden="true" />
                                </span>
                              </a>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="empty-ledger">
                <CircleHelp size={28} />
                <h3>这本档案里暂时没有匹配项</h3>
                <p>可以换一个关键词，或清除状态筛选后再试一次。</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedStatus("全部");
                  }}
                >
                  重置筛选 <ChevronRight size={16} />
                </button>
              </div>
            )}
            {query && filteredResources.length > totalShown && (
              <p className="results-limit">
                为保持阅读顺畅，当前仅展示前 {totalShown}{" "}
                条匹配记录；请进一步缩小关键词。
              </p>
            )}
          </section>

          <aside className="ledger-aside" aria-label="页面提示">
            <div
              className="aside-image"
              style={{ backgroundImage: `url(${SHELF_IMAGE})` }}
            />
            <div className="aside-copy">
              <p className="eyebrow">
                <span /> HOW TO USE
              </p>
              <h3>先检索，再取用。</h3>
              <ol>
                <li>
                  <span>01</span> 左栏切换主题目录
                </li>
                <li>
                  <span>02</span> 搜索名称或资源用途
                </li>
                <li>
                  <span>03</span> 点击管理，整理与备份
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </main>

      <footer className="archive-footer">
        <p>Sky 的储物间 · 可检索、可整理、可备份的个人资源索引</p>
        <a href="#top">
          返回索引顶部 <ChevronRight size={14} />
        </a>
      </footer>
      <ArchiveSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        archive={archive}
        onArchiveChange={setArchive}
      />
    </div>
  );
}
