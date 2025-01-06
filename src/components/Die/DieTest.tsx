import { useEffect, useState } from "react";
import { CustomDie } from "./CustomDie";
import type { Face } from "./DicePipPaths";

export function DieTest() {
  const [isAutoCycle, setIsAutoCycle] = useState(true);
  const [colors, setColors] = useState({
    fill: "#ff0000",
    stroke: "#0000ff",
  });
  const [currentNumbers, setCurrentNumbers] = useState<Record<Face, number>>({
    left: 1,
    top: 1,
    right: 1,
  });

  useEffect(() => {
    if (!isAutoCycle) return;

    const interval = setInterval(() => {
      setCurrentNumbers((prev) => ({
        left: prev.left >= 6 ? 1 : prev.left + 1,
        top: prev.top >= 6 ? 1 : prev.top + 1,
        right: prev.right >= 6 ? 1 : prev.right + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoCycle]);

  const handleNumberChange = (face: Face, value: string) => {
    const numValue = parseInt(value);
    if (numValue >= 0 && numValue <= 6) {
      setCurrentNumbers((prev) => ({
        ...prev,
        [face]: numValue,
      }));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <CustomDie
        dieIdentifier={currentNumbers}
        size={200}
        fill={colors.fill}
        stroke={colors.stroke}
      />

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <label>
          <input
            type="checkbox"
            checked={isAutoCycle}
            onChange={(e) => setIsAutoCycle(e.target.checked)}
          />
          Auto Cycle
        </label>

        <label>
          Fill:
          <input
            type="color"
            value={colors.fill}
            onChange={(e) =>
              setColors((prev) => ({ ...prev, fill: e.target.value }))
            }
            style={{ marginLeft: "0.5rem" }}
          />
        </label>

        <label>
          Stroke:
          <input
            type="color"
            value={colors.stroke}
            onChange={(e) =>
              setColors((prev) => ({ ...prev, stroke: e.target.value }))
            }
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {(["left", "top", "right"] as const).map((face) => (
          <label key={face}>
            {face}:
            <input
              type="number"
              min={0}
              max={6}
              value={currentNumbers[face]}
              onChange={(e) => handleNumberChange(face, e.target.value)}
              disabled={isAutoCycle}
              style={{ width: "60px", marginLeft: "0.5rem" }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
