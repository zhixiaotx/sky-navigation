/** 设计提醒：数字档案盒站点只保留一个可检索主页与明确的兜底路由。 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Router as WouterRouter, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

/**
 * 设计提醒：数字档案盒站点以单页导航为核心；GitHub Pages 项目站需把
 * /sky-navigation 当作路由根路径，避免完整 URL 被误判为 NotFound。
 */
function getRouterBase() {
  if (typeof window === "undefined") return "";

  const isGitHubProjectPage =
    window.location.hostname.endsWith(".github.io") &&
    (window.location.pathname === "/sky-navigation" ||
      window.location.pathname.startsWith("/sky-navigation/"));

  return isGitHubProjectPage ? "/sky-navigation" : "";
}

function Router() {
  const base = getRouterBase();

  return (
    <WouterRouter base={base}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
