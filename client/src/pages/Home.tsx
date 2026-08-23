/**
 * 设计提醒：数字档案盒——以目录书脊、档案编号与温暖纸张肌理组织高密度资源；
 * 交互优先服务于检索和直达，避免将链接集合做成无层级的卡片墙。
 */
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowUpRight,
  BookOpenText,
  Check,
  ChevronRight,
  CircleHelp,
  FileSearch,
  FolderOpen,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { categories, resources, type ResourceStatus } from "@/data/resources";

const HERO_IMAGE = "/manus-storage/xiaoshuai-archive-hero_de3ff727.png";
const SHELF_IMAGE = "/manus-storage/xiaoshuai-archive-shelf_884bd474.png";
const LOGO_IMAGE = "/manus-storage/xiaoshuai-archive-logo_6a69d405.png";

const statusOrder: ResourceStatus[] = ["可用", "收藏", "待核验"];

const statusClass: Record<ResourceStatus, string> = {
  可用: "is-live",
  收藏: "is-saved",
  待核验: "is-check",
};

const cleanCategoryName = (name: string) => name.replace(/^\d{2}\s*/, "").replace(/🔥/g, "").trim();

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("01 爆火 AI🔥");
  const [selectedStatus, setSelectedStatus] = useState<ResourceStatus | "全部">("全部");
  const [isDark, setIsDark] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
      const matchesStatus = selectedStatus === "全部" || resource.status === selectedStatus;
      const haystack = `${resource.title} ${resource.category} ${resource.section}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesStatus && matchesQuery;
    });
  }, [query, selectedCategory, selectedStatus]);

  const groupedResources = useMemo(() => {
    const grouped = new Map<string, typeof filteredResources>();
    for (const resource of filteredResources) {
      const groupName = query.trim() ? resource.category : resource.section;
      const items = grouped.get(groupName) ?? [];
      items.push(resource);
      grouped.set(groupName, items);
    }
    return Array.from(grouped, ([name, items]) => ({ name, items }));
  }, [filteredResources, query]);

  const displayedGroups = useMemo(() => {
    if (!query.trim()) return groupedResources;
    let remaining = 180;
    return groupedResources
      .map((group) => {
        const items = group.items.slice(0, Math.max(0, remaining));
        remaining -= items.length;
        return { ...group, items };
      })
      .filter((group) => group.items.length);
  }, [groupedResources, query]);

  const activeCategory = categories.find((category) => category.id === selectedCategory);
  const totalShown = displayedGroups.reduce((total, group) => total + group.items.length, 0);

  const chooseCategory = (id: string) => {
    setSelectedCategory(id);
    setIsDrawerOpen(false);
  };

  return (
    <div className="archive-shell">
      <header className="archive-topbar">
        <a className="brand-lockup" href="#top" aria-label="返回页面顶部">
          <img className="brand-mark" src={LOGO_IMAGE} alt="" />
          <span className="brand-name">
            <span>小帅同学的</span>
            <strong>储物间</strong>
          </span>
        </a>

        <div className="topbar-actions">
          <span className="edition-stamp">PERSONAL INDEX · 2026</span>
          <button
            type="button"
            className="icon-control"
            onClick={() => setIsDark((value) => !value)}
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
        <section className="archive-hero" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
          <div className="hero-copy">
            <p className="eyebrow"><span /> RESOURCE SHELF / 资源索引册</p>
            <h1>把常用资源<br />收进一页索引。</h1>
            <p className="hero-summary">
              从学习资料到软件工具，已将原单页中的 <strong>{resources.length.toLocaleString()}</strong> 条外链按分类与用途重新归档。
            </p>

            <label className="hero-search" htmlFor="resource-search">
              <Search size={20} aria-hidden="true" />
              <input
                id="resource-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="输入关键词，直接定位到那条链接"
                autoComplete="off"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="清空搜索">
                  <X size={17} />
                </button>
              )}
            </label>

            <div className="hero-metrics" aria-label="资源统计">
              <div><strong>{categories.length - 1}</strong><span>个主题目录</span></div>
              <div><strong>{resources.length.toLocaleString()}</strong><span>条已收录链接</span></div>
              <div><strong>⌘ K</strong><span>聚焦搜索框</span></div>
            </div>
          </div>
          <div className="hero-index-card" aria-hidden="true">
            <div className="index-card-tab">ARCHIVE / 001</div>
            <Archive size={28} strokeWidth={1.4} />
            <span>常用资源<br />随取随用</span>
          </div>
        </section>

        <div className="archive-body">
          <aside className={`archive-sidebar ${isDrawerOpen ? "is-open" : ""}`} aria-label="资源分类">
            <div className="sidebar-inner">
              <div className="sidebar-heading">
                <div>
                  <p className="eyebrow"><span /> FOLDER INDEX</p>
                  <h2>目录书脊</h2>
                </div>
                <button type="button" className="drawer-close" onClick={() => setIsDrawerOpen(false)} aria-label="关闭分类目录">
                  <X size={18} />
                </button>
              </div>

              <nav className="category-nav">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`category-link ${selectedCategory === category.id ? "is-active" : ""}`}
                    onClick={() => chooseCategory(category.id)}
                  >
                    <span className="category-icon"><FolderOpen size={15} /></span>
                    <span className="category-label">{category.id === "all" ? category.label : cleanCategoryName(category.label)}</span>
                    <span className="category-count">{category.count}</span>
                  </button>
                ))}
              </nav>

              <div className="sidebar-note">
                <BookOpenText size={18} />
                <p>外链源自原始储物间，访问前请自行判断资源的时效与适用性。</p>
              </div>
            </div>
          </aside>

          {isDrawerOpen && <button type="button" className="drawer-scrim" onClick={() => setIsDrawerOpen(false)} aria-label="关闭目录遮罩" />}

          <section className="resource-ledger" aria-label="资源列表">
            <div className="ledger-topline">
              <div>
                <p className="eyebrow"><span /> CURRENT FILE</p>
                <h2>{activeCategory?.id === "all" ? "全部资源索引" : activeCategory?.label || "资源索引"}</h2>
              </div>
              <div className="result-counter">
                <FileSearch size={17} />
                <span>{query ? `找到 ${filteredResources.length.toLocaleString()} 条` : `本册 ${filteredResources.length.toLocaleString()} 条`}</span>
              </div>
            </div>

            <div className="filter-strip" aria-label="资源状态筛选">
              <span className="filter-caption">状态筛选</span>
              <div className="status-filters">
                <button
                  type="button"
                  className={selectedStatus === "全部" ? "is-selected" : ""}
                  onClick={() => setSelectedStatus("全部")}
                >全部</button>
                {statusOrder.map((status) => (
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

            {displayedGroups.length ? (
              <div className="resource-groups">
                {displayedGroups.map((group, groupIndex) => (
                  <section className="resource-group" key={`${group.name}-${groupIndex}`}>
                    <div className="group-header">
                      <div className="group-title"><span>{String(groupIndex + 1).padStart(2, "0")}</span><h3>{group.name}</h3></div>
                      <span>{group.items.length} 条记录</span>
                    </div>
                    <div className="resource-list">
                      {group.items.map((resource, itemIndex) => (
                        <a
                          className="resource-row"
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className={`resource-status ${statusClass[resource.status]}`} aria-label={resource.status} />
                          <span className="resource-order">{String(itemIndex + 1).padStart(2, "0")}</span>
                          <span className="resource-title">{resource.title}</span>
                          <span className="resource-meta">
                            <span className="status-word">{resource.status}</span>
                            <ArrowUpRight size={15} aria-hidden="true" />
                          </span>
                        </a>
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
                <button type="button" onClick={() => { setQuery(""); setSelectedStatus("全部"); }}>重置筛选 <ChevronRight size={16} /></button>
              </div>
            )}

            {query && filteredResources.length > totalShown && (
              <p className="results-limit">为保持阅读顺畅，当前仅展示前 {totalShown} 条匹配记录；请进一步缩小关键词。</p>
            )}
          </section>

          <aside className="ledger-aside" aria-label="页面提示">
            <div className="aside-image" style={{ backgroundImage: `url(${SHELF_IMAGE})` }} />
            <div className="aside-copy">
              <p className="eyebrow"><span /> HOW TO USE</p>
              <h3>先检索，再取用。</h3>
              <ol>
                <li><span>01</span> 左栏切换主题目录</li>
                <li><span>02</span> 搜索名称或资源用途</li>
                <li><span>03</span> 点击记录，在新标签打开</li>
              </ol>
            </div>
          </aside>
        </div>
      </main>

      <footer className="archive-footer">
        <p>小帅同学的储物间 · 已将原始单页内容整理为可检索资源索引</p>
        <a href="#top">返回索引顶部 <ChevronRight size={14} /></a>
      </footer>
    </div>
  );
}
