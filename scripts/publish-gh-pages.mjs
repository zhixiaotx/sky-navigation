/**
 * 一键发布：只触发唯一的 gh-pages 工作流，且不会提交本地改动。
 * 先提交并推送本地更改，再运行 `npm run publish:gh-pages`。
 */
import { spawnSync } from "node:child_process";

const mode = process.argv[2] ?? "status";

if (!new Set(["publish", "status"]).has(mode)) {
  console.error("用法：node scripts/publish-gh-pages.mjs <publish|status>");
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: options.quiet ? "pipe" : "inherit",
  });

  if (result.error)
    throw new Error(`无法运行 ${command}：${result.error.message}`);
  if (result.status !== 0)
    throw new Error(`${command} 执行失败，退出码：${result.status}`);
  return (result.stdout ?? "").trim();
}

function ensureCleanWorkingTree() {
  const status = run("git", ["status", "--porcelain"], { quiet: true });
  if (status) {
    throw new Error(
      "检测到未提交改动。请先 git add / git commit / git push，避免发布远程旧版本。"
    );
  }
}

function getCurrentBranch() {
  const branch = run("git", ["branch", "--show-current"], { quiet: true });
  if (!branch)
    throw new Error("当前不在常规 Git 分支上。请切换到 main 后再发布。");
  return branch;
}

try {
  const workflow = "deploy-gh-pages.yml";

  if (mode === "status") {
    console.log("\n唯一 gh-pages 发布工作流：");
    run("gh", ["run", "list", "--workflow", workflow, "--limit", "5"]);
    console.log("\n站点地址：https://zhixiaotx.github.io/sky-navigation/");
    process.exit(0);
  }

  ensureCleanWorkingTree();
  const branch = process.env.PUBLISH_REF || getCurrentBranch();
  console.log("\n正在本地执行发布前检查…");
  run("npm", ["run", "check"]);
  run("npm", ["run", "build:static"]);
  run("gh", ["workflow", "run", workflow, "--ref", branch]);

  console.log(`\n已触发 gh-pages 发布工作流（分支：${branch}）。`);
  console.log("使用 npm run publish:status 查看运行结果。");
} catch (error) {
  console.error(
    `\n发布未触发：${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
}
