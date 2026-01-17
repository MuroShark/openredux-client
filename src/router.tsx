import React, { Suspense, useEffect } from "react";
import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import { useAuthStore } from "./store/useAuthStore";
import WindowTitleBar from "./components/WindowTitleBar";

// --- Lazy Imports ---
const Library = React.lazy(() => import("./pages/Library"));
const Configurator = React.lazy(() => import("./pages/Configurator"));
const ModDetails = React.lazy(() => import("./pages/ModDetails"));
const SubmitMod = React.lazy(() => import("./pages/SubmitMod"));
const AuthCallback = React.lazy(() => import("./pages/AuthCallback"));
const MySubmissions = React.lazy(() => import("./pages/MySubmissions"));

// Lazy load named exports via adapter pattern
const Installed = React.lazy(() => 
  import("./pages/Placeholders").then(module => ({ default: module.Installed })));
const Settings = React.lazy(() => import("./pages/Settings"));

// --- Root Component (Handles Theme & Global Layout) ---
const RootComponent = () => {
  const { loginWithToken } = useAuthStore();
  const isWindows = navigator.userAgent.includes('Windows');

  useEffect(() => {
    // Инициализация слушателя Deep Links
    const initDeepLink = async () => {
      const unlisten = await onOpenUrl((urls) => {
        for (const urlStr of urls) {
          try {
            const url = new URL(urlStr);
            // Проверяем наличие токена
            const refreshToken = url.searchParams.get('refresh_token');
            
            // Гибкая проверка: поддерживаем и hostname 'discord', и путь '/discord/callback'
            const isSourceDiscord = url.hostname === 'discord' || url.pathname.includes('/discord/');
            const isCallback = url.pathname.includes('callback');

            if (isSourceDiscord && isCallback && refreshToken) {
              loginWithToken(refreshToken);
            }
          } catch (e) {
            console.error(e);
          }
        }
      });
      return unlisten;
    };

    let unlistenFn: (() => void) | undefined;
    initDeepLink().then((fn) => (unlistenFn = fn));

    return () => {
      if (unlistenFn) unlistenFn();
    };
  }, [loginWithToken]);

  return (
    <ThemeProvider>
      <div 
        className="flex flex-col h-screen overflow-hidden bg-app-light dark:bg-app-bg text-gray-800 dark:text-gray-200 font-sans selection:bg-app-accent selection:text-black"
        style={{ '--titlebar-height': isWindows ? '32px' : '0px' } as React.CSSProperties}
      >
        {isWindows && <WindowTitleBar />}
        
        <div className="flex-1 relative overflow-hidden pt-[var(--titlebar-height)]">
          <Outlet />
        </div>
      </div>
    </ThemeProvider>
  );
};

// --- Loader Helper ---
const PageLoader = () => (
  <div className="flex h-full items-center justify-center p-10">
    <i className="ph-bold ph-spinner animate-spin text-4xl text-app-accent"></i>
  </div>
);

// --- Routes Definition ---

// 1. Root Route
const rootRoute = createRootRoute({
  component: RootComponent,
});

// 2. Dashboard Layout Route (Sidebar + TopBar)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard",
  component: App, // App теперь выступает как Layout
});

// 3. Child Routes for Dashboard
const libraryRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: () => <Suspense fallback={<PageLoader />}><Library /></Suspense>,
});

const installedRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/installed",
  component: () => <Suspense fallback={<PageLoader />}><Installed /></Suspense>,
});

const configuratorRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/configurator",
  component: () => <Suspense fallback={<PageLoader />}><Configurator /></Suspense>,
});

const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/settings",
  component: () => <Suspense fallback={<PageLoader />}><Settings /></Suspense>,
});

const mySubmissionsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/my-submissions",
  component: () => <Suspense fallback={<PageLoader />}><MySubmissions /></Suspense>,
});

// 4. Fullscreen Route (Mod Details) - Outside of Dashboard Layout
const modDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mod/$modId",
  component: () => <Suspense fallback={<PageLoader />}><ModDetails /></Suspense>,
});

// 5. Submit Mod Route - Outside Dashboard Layout (Standalone Page)
const submitModRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/submit",
  component: () => <Suspense fallback={<PageLoader />}><SubmitMod /></Suspense>,
});

// 6. Auth Callback Route (Discord Redirect)
const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/discord/callback",
  component: () => <Suspense fallback={<PageLoader />}><AuthCallback /></Suspense>,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute.addChildren([libraryRoute, installedRoute, configuratorRoute, settingsRoute, mySubmissionsRoute]),
  modDetailsRoute, submitModRoute, authCallbackRoute
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}