# Sky 的储物间 · 导航版

> **这是一份可以浏览、搜索、整理、备份和恢复的个人资源导航站。** 它以 React、TypeScript 与 Vite 构建，所有分类、书签和备份操作默认只写入当前浏览器，不需要服务器或数据库。

## 先看效果与适用范围

“Sky 的储物间”将原始单页中大量的资源外链整理为一个具有目录、搜索、状态筛选和本地管理能力的静态网站。桌面端的左侧分类栏和右侧资源清单是**两个独立的滚动容器**：滚动资源时不会带动分类栏，便于在长列表中保持分类定位。移动端则把分类栏收进可唤起的目录抽屉，避免挤压资源阅读空间。

| 能力 | 用途 | 数据保存位置 |
| --- | --- | --- |
| 资源浏览、关键词搜索、状态筛选 | 快速定位原始外链 | 项目内置资源文件与浏览器内存 |
| 分类管理 | 新增、重命名、删除、排序分类 | 浏览器 `localStorage` |
| 书签管理 | 新增、编辑、删除、移动、分类内排序、批量移动和批量删除 | 浏览器 `localStorage` |
| 数据工具 | JSON 导入导出、本地快照、一键还原、清除和恢复出厂值 | 浏览器 `localStorage` 与用户下载的 JSON 文件 |
| 双模式搜索 | 站内实时筛选，或使用可切换的搜索引擎在新标签检索全网 | 不上传站内书签数据 |
| 列表视图切换 | 在“紧凑”与“卡片”之间切换资源呈现方式 | 浏览器 `localStorage`（记住上次选择） |
| 多平台部署 | GitHub Pages、Cloudflare Pages、Vercel、Netlify | 静态构建产物 `dist/public` |

> **重要说明：** 本项目是纯静态前端。不同浏览器、不同设备或清理浏览器数据后，分类和书签编辑不会自动同步。请在重要编辑前使用“管理 → 数据工具 → 导出 JSON”保存一份可迁移备份。

## 最快开始：只需四步

开始前请安装 **Node.js 22 或更高版本** 与 npm。项目已包含 `.npmrc`，会自动兼容模板中已有的依赖约束，因此初学者直接执行 npm 命令即可。

```bash
# 1. 克隆或下载项目后，进入项目目录
cd sky-navigation

# 2. 安装依赖
npm install

# 3. 启动本地开发服务器
npm run dev

# 4. 终端显示本地地址后，在浏览器打开它
```

| 命令 | 何时使用 | 结果 |
| --- | --- | --- |
| `npm run dev` | 日常修改页面时 | 启动带热更新的本地开发服务 |
| `npm run check` | 修改 TypeScript 后 | 检查类型错误，不生成文件 |
| `npm run build:static` | 部署静态站前 | 仅构建前端到 `dist/public`，并使用相对资源路径 |
| `npm run build` | 需要项目完整生产构建时 | 构建前端并同时打包兼容服务器入口 |
| `npm run preview -- --host` | 本地验收静态产物时 | 预览 Vite 的构建结果 |

## 如何使用页面内的管理功能

页面右上角的 **“管理”** 按钮会打开设置模态窗口。它分为“分类管理”“书签管理”和“数据工具”三个区域。所有危险操作都会先要求确认，避免误删。

| 面板 | 可以做什么 | 适合的使用场景 |
| --- | --- | --- |
| 分类管理 | 新建、重命名、上移、下移、删除分类 | 新建“设计”“常用工具”等自定义目录，或调整最常用分类的位置 |
| 书签管理 | 新增、编辑、删除、移动、分类内排序、勾选后批量移动/删除 | 收录自己的网址、修正失效链接、把多个资源归档到新分类 |
| 数据工具 | 导出 JSON、本地备份、还原快照、导入 JSON、清除、恢复出厂值 | 跨电脑迁移、进行大量编辑前留档、误删后的恢复 |

### 搜索：站内筛选与站外检索

搜索条上方有两个模式。**“站内搜”** 是默认模式：输入文字后，会立即筛选当前储物间中的书签标题、分类和小分组，不会打开新页面。**“站外搜”** 会保留同一个关键词，但在点击右侧搜索按钮或按 Enter 后，将查询发送到选定的公开搜索引擎，并在新标签页显示结果。

默认站外搜索引擎是 **必应 Bing**。下拉列表预置 20 个常用的国内外搜索入口，包括 Google、DuckDuckGo、Brave Search、Startpage、Yahoo、Yandex、百度、搜狗、360 搜索、微信搜一搜、知乎、哔哩哔哩、小红书、淘宝、京东和 GitHub 等。你最近一次选择的搜索引擎会记在当前浏览器中，下次打开页面会自动沿用。

### 浏览资源：紧凑视图与卡片视图

资源账本标题右侧提供 **“紧凑”** 与 **“卡片”** 两个按钮。紧凑视图适合一次浏览很多标题，单行信息密度更高；卡片视图将每个资源拆成独立卡片，同时显示所属分类、小分组、状态与跳转入口，更适合逐项挑选或在大屏上阅读。切换结果会保存在当前浏览器的 `sky-resource-view` 中，刷新或下次打开页面时会自动恢复，不会影响其他设备上的设置。

### Sky 多级分类栏与独立 SVG 图标

左侧栏现在按“**顶层分类 → 资源小分组**”展示为可展开的两级目录。点击顶层分类会查看其全部资源；点击左侧展开箭头后，再点击子分组可只查看该分组中的资源。顶层主题和子分组会根据名称自动使用不同的内置 SVG 图标，例如 AI 使用机器人、学习使用学位帽、影音使用场记板、游戏使用手柄、手机软件使用手机图标。图标由 `client/src/lib/category-tree.ts` 集中配置，因此新增特殊分类时可在该文件中补充匹配规则。

### 推荐的安全操作顺序

如果你要调整很多书签，建议先在“数据工具”中点击 **“导出 JSON”**，将下载的文件保存到云盘或本地文件夹；随后点击 **“保存快照”** 生成浏览器内的快速恢复点。完成调整后，重新导出一份 JSON，即可同时拥有“修改前”和“修改后”两份备份。

当某个分类被删除时，关联书签不会立即丢失，而是会自动转入“未分类”。若要清空全部本地编辑，请使用“一键清除”；若希望完全回到项目原始资源清单，请选择“恢复出厂值”。

## 项目结构：每个重要文件做什么

下面的表格优先解释**需要修改或理解的项目文件**。`components/ui/` 中的其余文件是模板自带的通用控件库，通常不需要初学者逐个修改。

| 路径 | 功能与作用 | 新手何时需要改它 |
| --- | --- | --- |
| `client/index.html` | 浏览器入口；定义中文语言、网页标题、描述、站点图标和根节点。 | 修改网页标题、SEO 描述或 favicon 时。 |
| `client/src/main.tsx` | React 应用的启动文件，将整个应用挂载到 `index.html` 的根节点。 | 一般无需修改。 |
| `client/src/App.tsx` | 路由总入口；当前将 `/` 指向首页，并保留 404 兜底。 | 新增独立页面或路由时。 |
| `client/src/pages/Home.tsx` | 页面主体；处理搜索、筛选、紧凑/卡片视图切换、主题切换、独立滚动目录、移动端抽屉和“管理”窗口开关。 | 修改首页布局、标题、筛选规则、资源呈现方式或页面交互时。 |
| `client/src/components/ArchiveSettingsDialog.tsx` | 设置模态窗口；包含分类管理、书签管理、批量操作和数据工具。 | 增加新的管理动作，例如“标签”“收藏夹”“失效检测”时。 |
| `client/src/components/ui/dialog.tsx` | 模板提供的可访问对话框基础组件，负责焦点、遮罩和 Esc 行为。 | 一般不改；只在需要改变所有对话框通用行为时改。 |
| `client/src/components/ui/tabs.tsx` | 模板提供的无障碍标签页组件。 | 一般不改；新增设置面板标签时在 `ArchiveSettingsDialog.tsx` 中使用。 |
| `client/src/data/resources.ts` | 原始资源数据源，包含初始分类和书签。 | 要直接维护默认资源清单时；日常管理请优先使用页面中的“管理”。 |
| `client/src/lib/archive-store.ts` | 本地数据层；读取、校验、保存、导入和导出浏览器数据。 | 修改备份格式、加入同步服务或改变恢复规则时。 |
| `client/src/lib/search-engines.ts` | 站外搜索引擎目录；定义默认必应和 20 个站外搜索地址。 | 想增加、删除或更换搜索引擎时。 |
| `client/src/lib/category-tree.ts` | 多级目录构建器；将顶层分类和资源小分组整理为可展开树，并为节点匹配不同的 SVG 图标。 | 要修改树形层级规则、展开行为或分类图标时。 |
| `client/src/index.css` | 全站视觉与响应式样式，包括独立滚动容器、设置窗口和各设备断点。 | 调整颜色、字体、宽度、移动端布局时。 |
| `client/src/contexts/ThemeContext.tsx` | 模板提供的主题上下文。 | 通常无需修改；页面目前在 `Home.tsx` 中控制浅深色状态。 |
| `client/src/components/ErrorBoundary.tsx` | 前端运行异常的兜底显示，避免白屏。 | 一般无需修改。 |
| `scripts/extract-resources.mjs` | 一次性迁移脚本：从原始 HTML 提取分类与 HTTP(S) 链接，生成 `resources.ts`。 | 替换原始单页、需要重新导入大批资源时。 |
| `client/public/.nojekyll` | 禁用 GitHub Pages 的 Jekyll 处理，避免下划线目录等静态文件被忽略。 | 不要删除；GitHub Pages 部署时需要它。 |
| `vite.config.ts` | Vite 开发与构建配置；`base: "./"` 让构建后的 CSS、JS 等资源采用相对路径。 | 变更构建目录、域名子路径、开发端口或别名时。 |
| `package.json` | 项目名称、依赖版本与 npm 命令脚本。 | 新增 npm 命令或依赖时。 |
| `package-lock.json` | npm 的精确依赖锁定文件，保证本地和云端安装到一致版本。 | 由 npm 自动生成；应提交 Git，不要手工编辑。 |
| `.npmrc` | npm 兼容配置，处理模板中既有的宽松插件依赖关系。 | 通常不要删除，否则首次安装可能遇到依赖解析冲突。 |
| `.github/workflows/deploy-gh-pages.yml` | GitHub Actions 工作流；检查代码、构建静态站并推送到 `gh-page` 分支。 | 更改分支名、Node 版本或部署逻辑时。 |
| `vercel.json` | Vercel 部署设置，指定静态构建命令、输出目录与 SPA 回退。 | 部署 Vercel 或新增重写规则时。 |
| `netlify.toml` | Netlify 构建与重定向设置。 | 部署 Netlify 或修改重定向/头部规则时。 |
| `server/index.ts` | 模板兼容服务器入口，用于完整 `npm run build` 与托管环境。 | 本项目只做静态站时通常无需修改。 |
| `shared/` | 模板预留的共享类型目录。 | 前后端共用类型时使用；静态站默认不需要。 |
| `ideas.md` | 当前站点的设计原则与视觉决策记录。 | 做较大视觉改版前阅读，避免风格失控。 |
| `todo.md` | 本次增强任务的工作清单。 | 跟踪后续功能迭代时。 |

### 先理解目录，再决定从哪里改

如果你第一次接触 React，可以把项目理解成“入口文件启动页面，页面组合组件，组件读写数据，样式文件负责外观”。下面的目录视图用更通俗的方式说明哪些文件是一组、改动它们通常会产生什么效果。

| 目录或文件组 | 用通俗的话解释 | 新手最常见的改动 |
| --- | --- | --- |
| `client/` | 网站在浏览器中运行的全部前端代码。 | 改页面、图标、颜色、交互和静态配置时，优先在这里找文件。 |
| `client/src/pages/` | 每一个“完整页面”的放置处。当前只有首页 `Home.tsx`。 | 增加“关于页”“使用帮助页”时，在这里新建页面。 |
| `client/src/components/` | 可被页面重复使用的界面零件。 | 要把管理弹窗、分类树、资源卡片拆得更清楚时，在这里新建组件。 |
| `client/src/components/ui/` | 模板自带的通用、无障碍组件库。 | 一般只使用、不修改；例如弹窗使用 `dialog.tsx`，标签页使用 `tabs.tsx`。 |
| `client/src/lib/` | 不直接显示在网页上，但负责数据、规则和工具函数的代码。 | 修改本地备份格式、搜索引擎、图标匹配规则时。 |
| `client/src/data/` | 网站第一次打开时使用的“出厂资源清单”。 | 批量更换默认链接或重新导入原始 HTML 后。 |
| `client/src/index.css` | 所有颜色、间距、卡片、列表和设备断点的视觉规则。 | 想改成另一套配色、卡片圆角或移动端排列时。 |
| `client/public/` | 直接原样复制到最终网站根目录的小型静态配置文件。 | 保留 `.nojekyll`；若完全外部部署，可放 favicon、robots.txt 等小文件。 |
| `scripts/` | 只在开发机运行的一次性辅助脚本，不会被部署到网站。 | 使用 `extract-resources.mjs` 从原 HTML 重新生成初始资源。 |
| `.github/` | GitHub 自动化配置目录。 | 修改 Pages 发布分支、Node 版本或部署动作时。 |
| 根目录配置 | 包含 `package.json`、`vite.config.ts`、`vercel.json`、`netlify.toml` 等。 | 安装依赖、调整构建、选择托管平台时。 |

### 常见需求应该改哪个文件

| 你的目标 | 优先修改的位置 | 是否需要运行构建检查 |
| --- | --- | --- |
| 改首页标题、提示语、按钮文案 | `client/src/pages/Home.tsx` | 是，执行 `npm run check`。 |
| 修改颜色、宽度、卡片样式、手机排版 | `client/src/index.css` | 是，至少检查 375px 与桌面宽度。 |
| 增加或删除一个外部搜索引擎 | `client/src/lib/search-engines.ts` | 是。 |
| 为某类资源换一个 SVG 图标 | `client/src/lib/category-tree.ts` | 是。 |
| 修改页面中“恢复出厂值”的默认书签 | `client/src/data/resources.ts` | 是，并在浏览器中点击“恢复出厂值”确认结果。 |
| 新增一个设置面板功能 | `client/src/components/ArchiveSettingsDialog.tsx`，必要时同步修改 `archive-store.ts` | 是，并手动测试新增操作。 |
| 修复线上部署后的路由或资源路径 | `vite.config.ts`、对应平台配置文件 | 是，执行 `npm run build:static`。 |

## 数据从哪里来，为什么刷新后还在

项目第一次打开时，会用 `client/src/data/resources.ts` 中的初始资源建立一份本地工作副本。之后每次在设置窗口中修改分类或书签，都会保存到浏览器的 `localStorage`。因此，刷新页面不会丢失编辑；但切换浏览器、无痕模式、清除站点数据或换电脑时，编辑也不会自动出现。

```text
原始资源文件 resources.ts
        ↓ 首次打开 / 恢复出厂值
浏览器 localStorage（当前设备、当前浏览器）
        ↓ 页面“数据工具”
JSON 备份文件（可下载、可跨设备导入）

浏览器偏好：搜索引擎、资源视图（紧凑 / 卡片）
```

如果需要把当前资源直接改成新的“出厂默认值”，应先运行 `scripts/extract-resources.mjs` 或直接修改 `resources.ts`，然后打开页面中的“恢复出厂值”。如果只想给自己补充几个网址，不建议修改 `resources.ts`，直接在“书签管理”里添加即可。

## 相对路径与外部静态部署

项目的 Vite 配置已使用 `base: "./"`，并且 `npm run build:static` 会以相对路径生成 CSS、JavaScript 等构建资源。这种方式适合 GitHub Pages 的仓库子路径，也适合多数静态托管平台。

视觉图片目前来自项目的托管资源地址。若要把代码脱离当前托管环境部署到 GitHub Pages、Cloudflare、Vercel 或 Netlify，建议将这几张图片下载后放进 `client/public/assets/`，再将 `Home.tsx` 顶部的 `HERO_IMAGE`、`SHELF_IMAGE`、`LOGO_IMAGE` 改成相对地址，例如：

```ts
const HERO_IMAGE = "./assets/archive-hero.png";
const SHELF_IMAGE = "./assets/archive-shelf.png";
const LOGO_IMAGE = "./assets/archive-logo.png";
```

同时把 `client/index.html` 中 favicon 改为 `./assets/archive-logo.png`。这样构建产物在任何静态托管平台都不会依赖原来的资源代理。

## 部署到 GitHub Pages：构建后推送 `gh-page` 分支

本项目已内置 `.github/workflows/deploy-gh-pages.yml`。每当 `main` 或 `master` 分支有推送时，工作流会依次安装 npm 依赖、执行类型检查、运行 `npm run build:static`，然后将 `dist/public` 的内容写入 **`gh-page`** 分支。GitHub Pages 可以从任意分支的根目录或 `/docs` 目录发布；本项目按你的要求选择 `gh-page` 的根目录。[1]

### 第一次发布的具体操作

| 步骤 | 在哪里做 | 需要做什么 |
| --- | --- | --- |
| 1 | 本地终端 | 执行 `git add .`、`git commit -m "Initial site"`、`git push -u origin main`。 |
| 2 | GitHub 仓库 | 在 **Settings → Actions → General** 确认允许工作流读写仓库内容。 |
| 3 | GitHub 个人设置 | 创建一个可写入该仓库内容的细粒度个人访问令牌，并把它保存为仓库 Secret：`PAGES_DEPLOY_TOKEN`。 |
| 4 | GitHub 仓库 | 在 **Settings → Pages**，将 **Source** 选为 **Deploy from a branch**，分支选 **`gh-page`**，目录选 **`/(root)`**，然后保存。 |
| 5 | GitHub 仓库 | 打开 **Actions**，查看 “Build and publish GitHub Pages branch” 成功完成；稍后 Pages 会提供访问地址。 |

> GitHub 官方说明指出，使用 `GITHUB_TOKEN` 推送到发布分支不会触发 GitHub Pages 构建。因此工作流专门使用名为 `PAGES_DEPLOY_TOKEN` 的个人访问令牌，把构建产物推送到 `gh-page` 分支。[1]

## 部署到 Cloudflare Pages

Cloudflare Pages 支持连接 Git 仓库并在每次推送后自动重新构建。对于这个项目，请在 **Workers & Pages → Create application → Pages → Import an existing Git repository** 中选择仓库；构建命令填写 `npm run build:static`，构建输出目录填写 `dist/public`。Cloudflare 官方 Vite 指南使用“连接仓库、设置构建命令和输出目录、保存并部署”的流程，并在每次推送后自动构建。[2]

由于本项目是前端静态导航站，不需要环境变量。完成首次部署后，Cloudflare 会提供 `*.pages.dev` 地址；后续向主分支推送，即可触发新的部署。

## 部署到 Vercel

将仓库导入 Vercel 后，项目根目录已有 `vercel.json`，其中已经指定 `npm run build:static`、`dist/public` 及单页应用的回退规则。Vercel 的 Vite 文档说明：使用 SPA 深链接时，需要把所有路径重写到 `index.html`；本项目已预先完成此配置。[3]

首次部署时，只需要在 Vercel 控制台点击 **Add New → Project**，导入 Git 仓库并确认根目录是项目根目录。Vercel 会按 `vercel.json` 执行构建。网站没有必填环境变量，保持默认即可。

## 部署到 Netlify

项目根目录的 `netlify.toml` 已经指定构建命令和发布目录，并加入 `/* → /index.html` 的 SPA 重定向规则。导入仓库时，在 Netlify 选择该仓库并确认构建命令为 `npm run build:static`、发布目录为 `dist/public`；配置文件会自动覆盖面板设置。Netlify 的官方 Vite 文档也说明，Vite 项目通常会被自动识别，并建议使用构建命令和 `dist` 作为发布目录；对 SPA 需要添加回退到 `index.html` 的规则以避免深链接 404。[4]

若不使用 Git 自动部署，也可以在本地运行：

```bash
npm run build:static
```

然后把生成的 `dist/public` 文件夹拖入 Netlify 的手动部署区域。

## 手机、平板和桌面端如何适配

当前样式主要有三个布局层级：桌面宽屏时保留独立固定目录和独立资源滚动；中等宽度下维持左栏与资源账本的双列结构；手机宽度下目录变为侧滑抽屉、设置窗口改为接近全屏的滚动卷宗。搜索框、筛选项、视图切换和书签编辑表单会随着可用宽度从多列自动折叠为两列或一列。

| 设备范围 | 主要行为 | 验收重点 |
| --- | --- | --- |
| 宽屏桌面（≥ 1160px） | 左目录与扩展后的资源账本并排；目录与账本独立滚动。 | 资源滚动时目录仍固定在视口内；卡片视图保持双列。 |
| 笔记本/平板横屏（821–1159px） | 左目录与资源账本双列；卡片视图会保持两列或自动收缩。 | 书签编辑表单保持两列以上，不横向溢出。 |
| 平板竖屏/手机（≤ 820px） | 目录改为抽屉，资源列表按页面自然滚动。 | 点击“目录”可打开并关闭抽屉，点击“管理”可打开设置。 |
| 窄手机（≤ 540px） | 设置面板接近全屏，管理表单单列显示。 | 搜索、筛选、批量操作和数据工具按钮均无需横向滚动。 |

在桌面端，目录标题右侧的图标可将左侧分类栏收起为紧凑图标轨道，再次点击即可展开。此时右侧资源账本会获得更多宽度；分类按钮仍保留图标与可访问名称。手机端始终使用完整的抽屉目录，不显示折叠按钮，避免因窄屏而隐藏分类文字。

每次改动 CSS 后，建议至少使用浏览器设备模拟器检查 375px、768px、1024px 与 1280px 四种宽度。重点观察标题是否断行过多、表单是否溢出、模态窗口能否在小屏正常滚动，以及菜单按钮是否易于点击。

## 常见问题

### 为什么我的新增书签在另一台电脑上看不到？

因为数据默认保存于当前浏览器。请在原设备使用“数据工具 → 导出 JSON”，再在新设备通过“文件恢复 → 导入 JSON”恢复。

### 为什么执行 `npm install` 时提示依赖版本兼容问题？

项目已提供 `.npmrc` 来处理模板中旧插件和较新 Vite 版本之间的依赖声明差异。请确认没有删除 `.npmrc`，然后重新执行 `npm install`。不要混用 pnpm 和 npm，也不要提交 `pnpm-lock.yaml`。

### 为什么 GitHub Pages 工作流没有发布？

请检查仓库 Secrets 中是否存在 `PAGES_DEPLOY_TOKEN`，并确认 Pages 设置的发布分支是 **`gh-page`**、目录是 **`/(root)`**。然后打开 Actions 日志，优先查看“Publish dist/public to gh-page”步骤。

### 为什么外部部署后图像没有显示？

请按“相对路径与外部静态部署”章节将项目托管图片复制到 `client/public/assets/`，然后在 `Home.tsx` 和 `client/index.html` 中替换为 `./assets/...` 相对路径后重新构建。

## 参考资料

[1] [GitHub Docs：配置 GitHub Pages 发布源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

[2] [Cloudflare Docs：部署 Vite 项目到 Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/)

[3] [Vercel Docs：Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)

[4] [Netlify Docs：Vite on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
