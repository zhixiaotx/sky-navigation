/**
 * 设计提醒：左侧目录将“顶层分类 → 资源小分组”映射为可展开树，
 * 用独立图标替代重复文件夹符号，让用户能通过形状快速识别资源主题。
 */
import type { LucideIcon } from "lucide-react";
import {
  Album,
  BookMarked,
  Bot,
  BriefcaseBusiness,
  Clapperboard,
  Code2,
  Compass,
  FileText,
  FolderOpen,
  Gamepad2,
  GraduationCap,
  Lightbulb,
  MonitorCog,
  Music2,
  PackageOpen,
  PenLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { ArchiveCategory, ArchiveResource } from "@/lib/archive-store";

export type CategoryTreeNode = {
  id: string;
  label: string;
  level: 1 | 2;
  count: number;
  icon: LucideIcon;
  children?: CategoryTreeNode[];
};

const iconMatchers: Array<[RegExp, LucideIcon]> = [
  [/AI|人工智能|大模型|Agent|提示词/i, Bot],
  [/电脑|软件|脚本|浏览器|下载/i, MonitorCog],
  [/手机|Android|安卓|iOS/i, Smartphone],
  [/网站|网页|搜索|工具/i, Compass],
  [/影音|音乐|视频|电影|动漫/i, Clapperboard],
  [/游戏/i, Gamepad2],
  [/学习|课程|考研|考试|英语|教育/i, GraduationCap],
  [/随笔|文章|阅读|写作/i, PenLine],
  [/资源|网盘|合集|收藏/i, PackageOpen],
  [/加密|安全|隐私/i, ShieldCheck],
  [/设计|图片|P图/i, Sparkles],
  [/办公|文档|PDF|WPS/i, BriefcaseBusiness],
  [/代码|编程|开发/i, Code2],
  [/灵感|技巧|指南/i, Lightbulb],
  [/电子书|漫画/i, BookMarked],
  [/音乐/i, Music2],
];

export function iconForCategory(label: string): LucideIcon {
  return iconMatchers.find(([pattern]) => pattern.test(label))?.[1] ?? FolderOpen;
}

export function buildCategoryTree(categories: ArchiveCategory[], resources: ArchiveResource[]): CategoryTreeNode[] {
  return categories.map((category) => {
    const entries = resources.filter((resource) => resource.category === category.id);
    const sectionCounts = new Map<string, number>();
    for (const resource of entries) {
      const section = resource.section || "未分组";
      sectionCounts.set(section, (sectionCounts.get(section) ?? 0) + 1);
    }
    const children = Array.from(sectionCounts, ([label, count]) => ({
      id: `${category.id}::${label}`,
      label,
      level: 2 as const,
      count,
      icon: iconForCategory(label),
    }));
    return {
      id: category.id,
      label: category.label,
      level: 1 as const,
      count: entries.length,
      icon: iconForCategory(category.label),
      children,
    };
  });
}

export const allResourcesIcon = Album;
export const sectionFallbackIcon = FileText;
