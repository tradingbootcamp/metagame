import React from "react";
import {
  ThemeProvider,
  CrosswordProvider,
  CrosswordContext,
  CrosswordGrid,
  CrosswordSizeContext,
} from "@jaredreisinger/react-crossword";

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

// Add cell overlays if not defined
const cellOverlays = {
  "1-1": { types: [{ type: "number", value: "8" }] },
  "1-2": { types: [{ type: "number", value: "9" }] },
  "1-3": { types: [{ type: "number", value: "10" }] },
  "1-4": { types: [{ type: "number", value: "11" }] },
  "1-5": { types: [{ type: "number", value: "12" }, { type: "circle" }] },
  "1-6": { types: [{ type: "number", value: "13" }, { type: "circle" }] },
  "2-0": { types: [{ type: "circle" }] },
  "2-1": { types: [{ type: "number", value: "15" }] },
  "2-2": { types: [{ type: "number", value: "16" }] },
  "2-3": { types: [{ type: "number", value: "17" }] },
  "2-4": { types: [{ type: "number", value: "18" }] },
  "2-5": { types: [{ type: "number", value: "19" }] },
  "2-6": { types: [{ type: "number", value: "20" }] },
  "3-1": { types: [{ type: "number", value: "22" }] },
  "3-2": { types: [{ type: "number", value: "23" }] },
  "3-3": { types: [{ type: "number", value: "24" }] },
  "3-4": { types: [{ type: "number", value: "25" }] },
  "3-5": { types: [{ type: "number", value: "26" }] },
  "3-6": { types: [{ type: "number", value: "27" }] },
  "4-1": { types: [{ type: "number", value: "29" }] },
  "4-2": { types: [{ type: "number", value: "30" }] },
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

const OverlaysContainer = ({ gridRef }) => {
  const [showOverlays, setShowOverlays] = React.useState(false);
  const [dimensions, setDimensions] = React.useState(null);
  const crosswordContext = React.useContext(CrosswordContext);
  const crosswordSizeContext = React.useContext(CrosswordSizeContext);

  const calculateDimensions = React.useCallback(() => {
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

  React.useEffect(() => {
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
      {Object.entries(cellOverlays).map(([pos, cell]) => {
        const [row, col] = pos.split("-").map(Number);
        return cell.types.map((style, index) => (
          <CellOverlay
            key={`${pos}-${index}`}
            row={row}
            col={col}
            style={style}
            {...dimensions}
          />
        ));
      })}
    </div>
  );
};

const CellOverlay = ({
  row,
  col,
  style,
  gridSize,
  cellSize,
  cellInner,
  cellPadding,
  cellHalf,
}) => {
  // Calculate position
  const left = (col * gridSize) / 7;
  const top = (row * gridSize) / 7;

  if (style.type === "circle") {
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

  if (style.type === "number") {
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
        {style.value}
      </div>
    );
  }

  return null;
};

const CurrentClue = () => {
  const { selectedDirection, selectedNumber, clues } =
    React.useContext(CrosswordContext);
  const [hasInteracted, setHasInteracted] = React.useState(false);

  // Add click event listener to detect real user interaction
  React.useEffect(() => {
    const handleClick = (event) => {
      // Check if the clicked element or its parent is a cell
      const isCell = event.target.closest(".clue-cell") !== null;

      // Only set interaction if it's a valid cell
      if (isCell) {
        console.log("Valid cell click detected!");
        setHasInteracted(true);
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
    const cluesForDirection = clues[selectedDirection];
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
    <div className="text-center p-4">
      <span className="font-bold">
        {selectedNumber} {selectedDirection}:{" "}
      </span>
      {currentClue.clue}
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
  const crosswordRef = React.useRef();
  const gridRef = React.useRef();
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [escapeHoldCompleted, setEscapeHoldCompleted] = React.useState(false);
  const escapeStartTime = React.useRef(null);

  React.useEffect(() => {
    let currentCheckDuration = null; // Store interval reference in parent scope

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !escapeStartTime.current) {
        escapeStartTime.current = Date.now();

        // Start checking duration while key is held
        currentCheckDuration = setInterval(() => {
          const holdDuration = Date.now() - escapeStartTime.current;
          if (holdDuration >= 2000) {
            // 2 seconds
            setEscapeHoldCompleted(true);
            clearInterval(currentCheckDuration);
          }
        }, 100); // Check every 100ms

        // Clean up interval when Escape key is released
        const cleanup = (e) => {
          if (e.key === "Escape") {
            clearInterval(currentCheckDuration);
            escapeStartTime.current = null;
            window.removeEventListener("keyup", cleanup);
          }
        };
        window.addEventListener("keyup", cleanup);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(currentCheckDuration); // Clean up any running interval
      // Note: we don't need to explicitly remove the keyup listener here
      // because it removes itself when triggered
    };
  }, []);

  const onCrosswordComplete = (data) => {
    // console.log("Crossword completed!", data);
    setIsCompleted(true);
  };

  const onAnswerCorrect = (direction, number, answer) => {
    // console.log("Correct answer:", direction, number, answer);
  };

  const onAnswerIncorrect = (direction, number, answer) => {
    // console.log("Incorrect answer:", direction, number, answer);
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
          ref={crosswordRef}
          onAnswerCorrect={onAnswerCorrect}
          onAnswerIncorrect={onAnswerIncorrect}
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
            <CrosswordGrid />
            <OverlaysContainer gridRef={gridRef} />
          </div>
          <CurrentClue />
          {isCompleted && (
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
