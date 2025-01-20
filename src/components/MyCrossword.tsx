
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ThemeProvider,
  CrosswordProvider,
  CrosswordContext,
  CrosswordGrid,
  CrosswordSizeContext,
  type CrosswordProviderImperative,
} from "@jaredreisinger/react-crossword";
import { RotateCcw } from "lucide-react";
import type { Direction } from "@jaredreisinger/react-crossword/dist/types";

const themeContext = {
  allowNonSquare: true,
  columnBreakpoint: "black",
  gridBackground: "black",
  cellBackground: "#ffe",
  cellBorder: "black",
  textColor: "black",
  numberColor: "black",
  focusBackground: "darkgrey",
  highlightBackground: "lightgrey",
  // columnBreakpoint: '768px',
};

/** Defines an overlay for a grid cell that either displays a circle or a number */
type CellOverlay = {
  type: "number" | "circle";
  value?: string;
};
// Cell overlays for this specific grid
const cellOverlays: Record<string, CellOverlay[]> = {
  "1-1": [{ type: "number", value: "8" }],
  "1-2": [{ type: "number", value: "9" }],
  "1-3": [{ type: "number", value: "10" }],
  "1-4": [{ type: "number", value: "11" }],
  "1-5": [{ type: "number", value: "12" }, { type: "circle" }],
  "1-6": [{ type: "number", value: "13" }, { type: "circle" }],
  "2-0": [{ type: "circle" }],
  "2-1": [{ type: "number", value: "15" }],
  "2-2": [{ type: "number", value: "16" }],
  "2-3": [{ type: "number", value: "17" }],
  "2-4": [{ type: "number", value: "18" }],
  "2-5": [{ type: "number", value: "19" }],
  "2-6": [{ type: "number", value: "20" }],
  "3-1": [{ type: "number", value: "22" }],
  "3-2": [{ type: "number", value: "23" }],
  "3-3": [{ type: "number", value: "24" }],
  "3-4": [{ type: "number", value: "25" }],
  "3-5": [{ type: "number", value: "26" }],
  "3-6": [{ type: "number", value: "27" }],
  "4-1": [{ type: "number", value: "29" }],
  "4-2": [{ type: "number", value: "30" }],
};

const data = {
  across: {
    1: {
      clue: "Better environment?",
      answer: "CASINO",
      row: 0,
      col: 1,
    },
    7: {
      clue: "Places to play Skee Ball",
      answer: "ARCADES",
      row: 1,
      col: 0,
    },
    14: {
      clue: "High fashion",
      answer: "COUTURE",
      row: 2,
      col: 0,
    },
    21: {
      clue: "Plans",
      answer: "INTENDS",
      row: 3,
      col: 0,
    },
    28: {
      clue: "Go blue",
      answer: "DYE",
      row: 4,
      col: 0,
    },
  },
  down: {
    1: {
      clue: "Side kick",
      answer: "CRONY",
      row: 0,
      col: 1,
    },
    2: {
      clue: "6 degrees, maybe",
      answer: "ACUTE",
      row: 0,
      col: 2,
    },
    3: {
      clue: "Satisfy fully",
      answer: "SATE",
      row: 0,
      col: 3,
    },
    4: {
      clue: "Norse goddess of spring",
      answer: "IDUN",
      row: 0,
      col: 4,
    },
    5: {
      clue: "Self description for a gamer, maybe",
      answer: "NERD",
      row: 0,
      col: 5,
    },
    6: {
      clue: "Sweet suffixes",
      answer: "OSES",
      row: 0,
      col: 6,
    },
    7: {
      clue: "Something taken for a trip",
      answer: "ACID",
      row: 1,
      col: 0,
    },
  },
};

interface Dimensions {
  gridSize: number;
  cellSize: number;
  cellPadding: number;
  cellInner: number;
  cellHalf: number;
  offsetTop: number;
  offsetLeft: number;
}

interface OverlaysContainerProps {
  gridRef: React.RefObject<HTMLDivElement>;
}

const OverlaysContainer = ({ gridRef }: OverlaysContainerProps) => {
  const [showOverlays, setShowOverlays] = useState(false);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const crosswordContext = useContext(CrosswordContext);
  const crosswordSizeContext = useContext(CrosswordSizeContext);

  const calculateDimensions = useCallback(() => {
    if (!gridRef.current) {
      console.log("No grid ref yet");
      return;
    }

    // Get the SVG element that contains the grid
    const gridElement = gridRef.current.querySelector(".crossword.grid svg");
    const gridRect = gridElement?.getBoundingClientRect();
    const parentRect = gridRef.current.getBoundingClientRect();

    if (!gridElement || !gridRect || gridRect.width === 0) {
      console.log("Grid element not found or has no width");
      return;
    }

    // The viewBox is "0 0 70 50" from the SVG
    const viewBoxWidth = 70;
    const viewBoxHeight = 50;
    const cellWidth = 9.75; // From the rect width in the SVG

    // Calculate the actual size of cells based on the rendered grid size
    const gridSize = gridRect.width;
    const cellSize = gridSize * (cellWidth / viewBoxWidth);
    const cellPadding = 0;
    const cellInner = cellSize - 2 * cellPadding;
    const cellHalf = cellInner / 2;

    // Calculate offset from the grid position
    const offsetTop = gridRect.top - parentRect.top;
    const offsetLeft = gridRect.left - parentRect.left;

    console.log("New dimensions:", {
      gridSize,
      cellSize,
      cellPadding,
      cellInner,
      cellHalf,
      offsetTop,
      offsetLeft,
    });

    setDimensions({
      gridSize,
      cellSize,
      cellPadding,
      cellInner,
      cellHalf,
      offsetTop,
      offsetLeft,
    });
    setShowOverlays(true);
  }, [gridRef]);

  useEffect(() => {
    // Add a small delay to ensure the grid is rendered
    const timer = setTimeout(() => {
      calculateDimensions();
    }, 100);

    // Add resize observer
    const observer = new ResizeObserver(() => {
      calculateDimensions();
    });

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (gridRef.current) {
        observer.unobserve(gridRef.current);
      }
    };
  }, [calculateDimensions]);

  if (!showOverlays || !dimensions) {
    console.log("Not showing overlays:", {
      showOverlays,
      hasDimensions: !!dimensions,
    });
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: dimensions?.offsetTop || 0,
        left: dimensions?.offsetLeft || 0,
        width: dimensions?.gridSize, // Explicitly set width
        height: dimensions?.gridSize, // Explicitly set height
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {Object.entries(cellOverlays).map(([pos, overlays]) => {
        const [row, col] = pos.split("-").map(Number);
        return overlays.map((overlay, index) => (
          <CellOverlay
            key={`${pos}-${index}`}
            row={row}
            col={col}
            overlay={overlay}
            {...dimensions}
          />
        ));
      })}
    </div>
  );
};

interface CellOverlayProps {
  row: number;
  col: number;
  overlay: CellOverlay;
  gridSize: number;
  cellSize: number;
  cellInner: number;
  cellPadding: number;
  cellHalf: number;
}

const CellOverlay = ({
  row,
  col,
  overlay,
  gridSize,
  cellSize,
  cellInner,
  cellPadding,
  cellHalf,
}: CellOverlayProps) => {
  // Calculate position
  const left = (col * gridSize) / 7;
  const top = (row * gridSize) / 7;

  if (overlay.type === "circle") {
    return (
      <svg
        style={{
          position: "absolute",
          left: left + cellPadding,
          top: top + cellPadding,
          width: cellInner,
          height: cellInner,
          pointerEvents: "none",
        }}
      >
        <circle
          cx={cellHalf}
          cy={cellHalf}
          r={cellHalf - 2}
          fill="none"
          stroke="red"
          strokeWidth="3"
        />
      </svg>
    );
  }

  if (overlay.type === "number") {
    return (
      <div
        style={{
          position: "absolute",
          left: left + cellPadding,
          top: top + cellPadding,
          width: cellInner,
          height: cellInner,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          fontSize: `${cellInner * 0.34}px`,
          color: "black",
          pointerEvents: "none",
          lineHeight: "1",
          paddingTop: "1px",
          paddingLeft: "4px",
        }}
      >
        {" "}
        {overlay.value}
      </div>
    );
  }

  return null;
};

const CurrentClue = () => {
  const { selectedDirection, selectedNumber, clues } =
    useContext(CrosswordContext);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Add click event listener to detect real user interaction
  useEffect(() => {
    const handleClick = (event: Event) => {
      if (event.target instanceof Element) {
        const isCell = event.target.closest(".clue-cell") !== null;
        if (isCell) {
          setHasInteracted(true);
        }
      }
    };

    const gridContainer = document.querySelector(
      '[data-testid="grid-container"]'
    );
    console.log("Grid container found:", !!gridContainer);

    if (gridContainer) {
      gridContainer.addEventListener("click", handleClick);
    }

    // Cleanup
    return () => {
      if (gridContainer) {
        gridContainer.removeEventListener("click", handleClick);
      }
    };
  }, []);

  // Return empty message if user hasn't clicked yet
  if (!hasInteracted) {
    console.log("Not showing clue yet. Has interacted:", hasInteracted);
    return <div className="text-center p-4"></div>;
  }

  const getCurrentClue = () => {
    // Get all clues for the selected direction (across/down)
    const cluesForDirection = clues?.[selectedDirection];
    console.log("Selected direction:", selectedDirection);
    console.log("Clues for direction:", cluesForDirection);

    if (!cluesForDirection) {
      return null;
    }

    // Convert clues object into array of [number, clueData] pairs
    const clueEntries = Object.entries(cluesForDirection);
    console.log("Clue entries:", clueEntries);

    // Find the entry where the clue number matches our selected number
    const matchingClueEntry = clueEntries.find((entry) => {
      const clueNumber = entry[1].number; // This is the number (as string)
      console.log("Clue number:", clueNumber);
      return clueNumber === selectedNumber.toString();
    });

    // Return the clue data (second element of the pair) if found, otherwise null
    return matchingClueEntry ? matchingClueEntry[1] : null;
  };

  const currentClue = getCurrentClue();

  if (!currentClue) {
    return <div className="text-center p-4">No clue found</div>;
  }

  console.log("Current clue:", currentClue);

  return (
    <div>
      <div className="text-center p-4">
        {hasInteracted ? (
          <>
            <span className="font-bold">
              {selectedNumber} {selectedDirection}:{" "}
            </span>
            {currentClue?.clue}
          </>
        ) : (
          ""
        )}
      </div>
      {hasInteracted && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Crossword calendar concept courtesy of <a href="https://crosswordcal.com/products/2025-crossword-calendar" className="hover:underline">Adam Aaronson</a>
        </div>
      )}
    </div>
  );
};

const DayLabels = () => {
  const days = ["S", "M", "T", "W", "Th", "F", "S"];
  return (
    <div className="flex w-full mb-2">
      {days.map((day, index) => (
        <div key={index} className="text-center font-bold flex-1">
          {day}
        </div>
      ))}
    </div>
  );
};

export default function MyCrossword() {
  const crosswordRef = useRef<CrosswordProviderImperative>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [escapeHoldCompleted, setEscapeHoldCompleted] = useState(false);
  const escapeStartTime = useRef<number | null>(null);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(isCompleted && isCorrect)) return;
      if (e.key === "Escape") {
        timeoutId = setTimeout(() => {
          setEscapeHoldCompleted(true);
        }, 2000);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape" && timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isCompleted, isCorrect]);

  const onCrosswordComplete = (correct: boolean) => {
    setIsCompleted(true);
    setIsCorrect(correct);
  };

  const onAnswerCorrect = (
    direction: Direction,
    number: string,
    answer: string
  ) => {
    // console.log("Correct answer:", direction, number, answer);
  };

  const onAnswerIncorrect = (
    direction: Direction,
    number: string,
    answer: string
  ) => {
    // console.log("Incorrect answer:", direction, number, answer);
  };

  const onCellChange = (row: number, col: number, char: string) => {
    setShowReset(true);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="text-center text-5xl p-4">September 2025</div>
      <ThemeProvider theme={themeContext}>
        <CrosswordProvider
          data={data}
          onCrosswordComplete={onCrosswordComplete}
          onCellChange={onCellChange}
          ref={crosswordRef}
          onAnswerCorrect={onAnswerCorrect}
          onAnswerIncorrect={onAnswerIncorrect}
          autoJumpFromClueEnd
        >
          <div
            ref={gridRef}
            data-testid="grid-container"
            style={{
              position: "relative",
              width: "500px",
              maxWidth: "100%",
            }}
          >
            <DayLabels />
            <div className="relative">
              <CrosswordGrid />
              {showReset && (
                <button
                  className="absolute right-1 bottom-1 "
                  onClick={() => {
                    crosswordRef.current?.reset();
                    setShowReset(false);
                  }}
                >
                  <RotateCcw className="size-4 text-foreground" />
                </button>
              )}
            </div>
            <OverlaysContainer gridRef={gridRef} />
          </div>
          <CurrentClue />
          {isCompleted && isCorrect && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg text-center">
              🔑 You hold the key to unlocking countless rewards... at least for
              a few seconds
            </div>
          )}
          {escapeHoldCompleted && (
            <div className="mt-2 p-4 bg-blue-100 text-blue-800 rounded-lg text-center">
              Congratulations! Use coupon code "ESCAPEKEY" for $50 off your
              ticket price! 🎉
            </div>
          )}
        </CrosswordProvider>
      </ThemeProvider>
    </div>
  );
}
