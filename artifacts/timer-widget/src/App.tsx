import { useEffect, useState, type ComponentType } from "react";
import { Switch, Route, Router as WouterRouter, useParams } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/Home";

type PreviewModule = Record<string, unknown>;
type PreviewLoader = () => Promise<PreviewModule>;

const previewModules = import.meta.glob<PreviewModule>([
  "./pages/*.tsx",
  "./components/*.tsx",
]);

const queryClient = new QueryClient();

function normalizePreviewName(name: string): string {
  return name.replace(/\.tsx$/, "").trim();
}

function resolvePreviewComponent(
  mod: PreviewModule,
  componentName: string,
): ComponentType | null {
  const named = mod[componentName];

  if (typeof named === "function") {
    return named as ComponentType;
  }

  if (typeof mod.default === "function") {
    return mod.default as ComponentType;
  }

  const fallback = Object.values(mod).find((value) => typeof value === "function");

  return (fallback as ComponentType | undefined) ?? null;
}

function findPreviewLoader(componentName: string): PreviewLoader | undefined {
  const normalizedName = normalizePreviewName(componentName);
  const candidates = [
    `./pages/${normalizedName}.tsx`,
    `./components/${normalizedName}.tsx`,
  ];

  return candidates
    .map((candidate) => previewModules[candidate])
    .find((loader): loader is PreviewLoader => typeof loader === "function");
}

function PreviewPage() {
  const { componentName = "" } = useParams<{ componentName: string }>();
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setComponent(null);
    setError(null);

    const loader = findPreviewLoader(componentName);

    if (!loader) {
      setError(`Preview component "${componentName}" was not found.`);
      return;
    }

    async function loadPreview(): Promise<void> {
      try {
        const mod = await loader!();

        if (cancelled) {
          return;
        }

        const resolvedComponent = resolvePreviewComponent(mod, componentName);

        if (!resolvedComponent) {
          setError(
            `Preview component "${componentName}" does not export a React component.`,
          );
          return;
        }

        setComponent(() => resolvedComponent);
      } catch (previewError) {
        if (cancelled) {
          return;
        }

        const message =
          previewError instanceof Error ? previewError.message : String(previewError);

        setError(`Failed to load preview "${componentName}".\n${message}`);
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [componentName]);

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-6">
        <pre className="max-w-2xl whitespace-pre-wrap rounded-xl border border-border bg-card p-4 text-sm">
          {error}
        </pre>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-muted-foreground">
        Loading preview...
      </div>
    );
  }

  return <Component />;
}

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground text-sm">
          Visit the home page or use <code>/preview/ComponentName</code> for previews.
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/preview/:componentName" component={PreviewPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={routerBase}>
        <AppRoutes />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
