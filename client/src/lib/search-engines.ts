/**
 * 设计提醒：搜索引擎作为导航页的“外部检索出口”。
 * 不请求第三方 API，只在用户提交搜索时以新标签打开对应搜索地址。
 */
export type SearchEngine = {
  id: string;
  label: string;
  region: "国内" | "国际";
  queryUrl: string;
};

export const DEFAULT_SEARCH_ENGINE = "bing";

export const searchEngines: SearchEngine[] = [
  { id: "bing", label: "必应 Bing", region: "国际", queryUrl: "https://www.bing.com/search?q=" },
  { id: "google", label: "Google", region: "国际", queryUrl: "https://www.google.com/search?q=" },
  { id: "duckduckgo", label: "DuckDuckGo", region: "国际", queryUrl: "https://duckduckgo.com/?q=" },
  { id: "yahoo", label: "Yahoo", region: "国际", queryUrl: "https://search.yahoo.com/search?p=" },
  { id: "brave", label: "Brave Search", region: "国际", queryUrl: "https://search.brave.com/search?q=" },
  { id: "startpage", label: "Startpage", region: "国际", queryUrl: "https://www.startpage.com/do/dsearch?query=" },
  { id: "ecosia", label: "Ecosia", region: "国际", queryUrl: "https://www.ecosia.org/search?q=" },
  { id: "yandex", label: "Yandex", region: "国际", queryUrl: "https://yandex.com/search/?text=" },
  { id: "baidu", label: "百度", region: "国内", queryUrl: "https://www.baidu.com/s?wd=" },
  { id: "sogou", label: "搜狗", region: "国内", queryUrl: "https://www.sogou.com/web?query=" },
  { id: "so", label: "360 搜索", region: "国内", queryUrl: "https://www.so.com/s?q=" },
  { id: "shenma", label: "神马搜索", region: "国内", queryUrl: "https://m.sm.cn/s?q=" },
  { id: "wechat", label: "微信搜一搜", region: "国内", queryUrl: "https://weixin.sogou.com/weixin?type=2&query=" },
  { id: "zhihu", label: "知乎", region: "国内", queryUrl: "https://www.zhihu.com/search?type=content&q=" },
  { id: "bilibili", label: "哔哩哔哩", region: "国内", queryUrl: "https://search.bilibili.com/all?keyword=" },
  { id: "xiaohongshu", label: "小红书", region: "国内", queryUrl: "https://www.xiaohongshu.com/search_result?keyword=" },
  { id: "jike", label: "即刻", region: "国内", queryUrl: "https://web.okjike.com/search?keyword=" },
  { id: "taobao", label: "淘宝", region: "国内", queryUrl: "https://s.taobao.com/search?q=" },
  { id: "jd", label: "京东", region: "国内", queryUrl: "https://search.jd.com/Search?keyword=" },
  { id: "github", label: "GitHub", region: "国际", queryUrl: "https://github.com/search?q=" },
];
