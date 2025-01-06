// app.tsx
import { useState, useEffect } from 'react';
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
} from "kbar";
import { staticActions } from "../../config/kbarActions";

function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) => {
        // Handle section items
        if (typeof item === "string") {
          return (
            <div className="px-4 py-2 text-sm font-bold text-primary bg-base-300">
              {item}
            </div>
          );
        }

        // Render action items
        return (
          <div
            className={`px-4 py-2 flex items-center justify-between cursor-pointer ${
              active ? "bg-primary text-primary-content" : "text-base-content"
            }`}
          >
            <div className="flex items-center gap-2">
              {item.icon && (
                <span className="text-lg w-8 text-center">{item.icon}</span>
              )}
              <div>
                <div className="font-medium">{item.name}</div>
                {item.subtitle && (
                  <span className={`text-sm ${active ? 'text-accent-content/70' : 'text-base-content/70'}`}>
                    {item.subtitle}
                  </span>
                )}
              </div>
            </div>
            {item.shortcut?.length ? (
              <div className="flex items-center gap-1">
                {item.shortcut.map((sc: string) => (
                  <kbd
                    key={sc}
                    className={`px-2 py-1 text-xs rounded ${
                      active ? 'bg-accent text-accent-content' : 'bg-base-200 text-base-content'
                    }`}
                  >
                    {sc}
                  </kbd>
                ))}
              </div>
            ) : null}
          </div>
        );
      }}
    />
  );
}

export function KbarApp({ children }: { children: React.ReactNode }) {
  const [actions, setActions] = useState(staticActions);

  useEffect(() => {
    // Add dynamic actions based on current route
    const path = window.location.pathname;
    const dynamicActions = [];

    // Game-specific actions
    if (path.startsWith('/games/')) {
      dynamicActions.push({
        id: "restart-game",
        name: "Restart Game",
        icon: "🔄",
        section: "Game Controls",
        shortcut: ["r"],
        perform: () => window.location.reload()
      });
    }

    // Session-specific actions
    if (path.startsWith('/sessions/')) {
      dynamicActions.push({
        id: "add-to-calendar",
        name: "Add to Calendar",
        icon: "📅",
        section: "Session Actions",
        shortcut: ["c"],
        perform: () => console.log("Add to calendar")
      });
    }

    // Update actions with dynamic ones
    setActions([...staticActions, ...dynamicActions]);
  }, []);

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 bg-black/60 z-50">
          <KBarAnimator className="w-full max-w-xl bg-base-100 rounded-lg overflow-hidden shadow-lg">
            <KBarSearch 
              className="w-full px-4 py-3 text-lg bg-transparent border-b border-gray-700 text-white placeholder-gray-400 focus:outline-none"
              placeholder="Type a command or search..."
            />
            <div className="max-h-[500px] overflow-y-auto">
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
}