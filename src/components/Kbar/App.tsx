// app.tsx
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
  NO_GROUP
} from "kbar";
import { actions } from "../../config/kbarActions";

function RenderResults() {
  const { results } = useMatches();
    
    return (
      <KBarResults
      items={results}
      onRender={({ item, active }) =>
      typeof item === "string" ? (
        <div>{item}</div>
        ) : (
          <div
          style={{
            background: active ? "#eee" : "transparent",
          }}
          >
          {item.name}
          </div>
          )
        }
      />
    );
}

export function KbarApp({ children }: { children: React.ReactNode }) {
  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner>
          <KBarAnimator>
            <KBarSearch />
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
}