import React from 'react';
import Crossword, { ThemeProvider, CrosswordProvider, CrosswordContext, CrosswordGrid, CrosswordSizeContext, DirectionClues } from '@jaredreisinger/react-crossword';

const themeContext = {
  allowNonSquare: true,
  columnBreakpoint: 'black',
  gridBackground: 'black',
  cellBackground: '#ffe',
  cellBorder: 'black',
  textColor: 'black',
  numberColor: 'black',
  focusBackground: '#f00',
  highlightBackground: '#f99',
  // columnBreakpoint: '768px',
}

// Add cell overlays if not defined
const cellOverlays = {
  '0-5': { type: 'circle' },
  '0-6': { type: 'circle' },
  '1-0': { type: 'circle' },
  '1-1': { type: 'number', value: '8' },
  '1-2': { type: 'number', value: '9' },
  '1-3': { type: 'number', value: '10' },
  '1-4': { type: 'number', value: '11' },
  '1-5': { type: 'number', value: '12' },
  '1-6': { type: 'number', value: '13' },
  '2-1': { type: 'number', value: '15' },
  '2-2': { type: 'number', value: '16' },
  '2-3': { type: 'number', value: '17' },
  '2-4': { type: 'number', value: '18' },
  '2-5': { type: 'number', value: '19' },
  '2-6': { type: 'number', value: '20' },
  '3-1': { type: 'number', value: '22' },
  '3-2': { type: 'number', value: '23' },
  '3-3': { type: 'number', value: '24' },
  '3-4': { type: 'number', value: '25' },
  '3-5': { type: 'number', value: '26' },
  '3-6': { type: 'number', value: '27' },
  '4-1': { type: 'number', value: '29' },
  '4-2': { type: 'number', value: '30' },
};

const data = {
  across: {
    1: {
      clue: 'seizes',
      answer: 'SEIZES',
      row: 0,
      col: 1,
    },
    7: {
      clue: 'console',
      answer: 'CONSOLE',
      row: 1,
      col: 0,
    },
    14: {
      clue: 'outpost',
      answer: 'OUTPOST',
      row: 2,
      col: 0,
    },
    21: {
      clue: 'presses',
      answer: 'PRESSES',
      row: 3,
      col: 0,
    },
    28: {
      clue: 'ESR',
      answer: 'ESR',
      row: 4,
      col: 0,
    },
  },
  down: {
    1: {
      clue: 'SOURS',
      answer: 'SOURS',
      row: 0,
      col: 1,
    },
    2: {
      clue: 'ENTER',
      answer: 'ENTER',
      row: 0,
      col: 2,
    },
    3: {
      clue: 'isps',
      answer: 'ISPS',
      row: 0,
      col: 3,
    },
    4: {
      clue: 'ZOOS',
      answer: 'ZOOS',
      row: 0,
      col: 4,
    },
    5: {
      clue: 'ELSE',
      answer: 'ELSE',
      row: 0,
      col: 5,
    },
    6: {
      clue: 'sets',
      answer: 'SETS',
      row: 0,
      col: 6,
    },
    7: {
      clue: 'cope',
      answer: 'COPE',
      row: 1,
      col: 0,
    }
  }
};

const OverlaysContainer = ({ gridRef }) => {
  const [showOverlays, setShowOverlays] = React.useState(false);
  const [dimensions, setDimensions] = React.useState(null);
  const crosswordContext = React.useContext(CrosswordContext);
  const crosswordSizeContext = React.useContext(CrosswordSizeContext);

  const calculateDimensions = React.useCallback(() => {
    if (!gridRef.current) {
      console.log('No grid ref yet');
      return;
    }

    const gridElement = gridRef.current;
    const gridRect = gridElement.getBoundingClientRect();

    if (gridRect.width === 0) {
      console.log('Grid has no width yet');
      return;
    }

    const gridSize = Math.max(gridRect.width, gridRect.height);
    const cellSize = gridSize / 7; // Assuming 7x7 grid, adjust if needed
    const cellPadding = 0;// cellSize * 0.1;
    const cellInner = cellSize - (2 * cellPadding);
    const cellHalf = cellInner / 2;

    console.log('New dimensions:', {
      gridSize,
      cellSize,
      cellPadding,
      cellInner,
      cellHalf
    });

    setDimensions({
      cellSize,
      cellPadding,
      cellInner,
      cellHalf
    });
    setShowOverlays(true);
  }, [gridRef]);

  React.useEffect(() => {
    // Initial calculation
    calculateDimensions();

    // Add resize observer
    const observer = new ResizeObserver(() => {
      calculateDimensions();
    });

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    // Cleanup
    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current);
      }
    };
  }, [calculateDimensions]);

  if (!showOverlays || !dimensions) {
    console.log('Not showing overlays:', { showOverlays, hasDimensions: !!dimensions });
    return null;
  }

  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {Object.entries(cellOverlays).map(([pos, style]) => {
        const [row, col] = pos.split('-').map(Number);
        return (
          <CellOverlay
            key={pos}
            row={row}
            col={col}
            style={style}
            {...dimensions}
          />
        );
      })}
    </div>
  );
};

const CellOverlay = ({ row, col, style, cellSize, cellInner, cellPadding, cellHalf }) => {
  
  // Calculate position
  const left = col * cellSize;
  const top = row * cellSize;

  if (style.type === 'circle') {
    return (
      <svg
        style={{
          position: 'absolute',
          left: left + cellPadding,
          top: top + cellPadding,
          width: cellInner,
          height: cellInner,
          pointerEvents: 'none',
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

  if (style.type === 'number') {
    return (
      <div
        style={{
          position: 'absolute',
          left: left + cellPadding,
          top: top + cellPadding,
          width: cellInner,
          height: cellInner,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          fontSize: `${cellInner * 0.34}px`,
          color: 'black',
          pointerEvents: 'none',
          lineHeight: '1',
          paddingTop: '1px',
          paddingLeft: '4px',
        }}
      > {style.value}
      </div>
    );
  }

  return null;
};

const CurrentClue = () => {
  const { selectedDirection, selectedNumber, clues } = React.useContext(CrosswordContext);
  const [hasInteracted, setHasInteracted] = React.useState(false);

  // Add click event listener to detect real user interaction
  React.useEffect(() => {
    const handleClick = (event) => {
      // Check if the clicked element or its parent is a cell
      const isCell = event.target.closest('.clue-cell') !== null;
      
      // Only set interaction if it's a valid cell
      if (isCell) {
        console.log('Valid cell click detected!');
        setHasInteracted(true);
      }
    };

    const gridContainer = document.querySelector('[data-testid="grid-container"]');
    console.log('Grid container found:', !!gridContainer);
    
    if (gridContainer) {
      gridContainer.addEventListener('click', handleClick);
    }

    // Cleanup
    return () => {
      if (gridContainer) {
        gridContainer.removeEventListener('click', handleClick);
      }
    };
  }, []);

  // Return empty message if user hasn't clicked yet
  if (!hasInteracted) {
    console.log('Not showing clue yet. Has interacted:', hasInteracted);
    return <div className="text-center p-4"></div>;
  }

  const getCurrentClue = () => {
    // Get all clues for the selected direction (across/down)
    const cluesForDirection = clues[selectedDirection];
    console.log('Selected direction:', selectedDirection);
    console.log('Clues for direction:', cluesForDirection);
    
    if (!cluesForDirection) {
      return null;
    }

    // Convert clues object into array of [number, clueData] pairs
    const clueEntries = Object.entries(cluesForDirection);
    console.log('Clue entries:', clueEntries);

    // Find the entry where the clue number matches our selected number
    const matchingClueEntry = clueEntries.find((entry) => {
      const clueNumber = entry[1].number;  // This is the number (as string)
      console.log('Clue number:', clueNumber);
      return clueNumber === selectedNumber.toString();
    });

    // Return the clue data (second element of the pair) if found, otherwise null
    return matchingClueEntry ? matchingClueEntry[1] : null;
  };

  const currentClue = getCurrentClue();
  
  if (!currentClue) {
    return <div className="text-center p-4">No clue found</div>;
  }

  console.log('Current clue:', currentClue);

  return (
    <div className="text-center p-4">
      <span className="font-bold">{selectedNumber} {selectedDirection}: </span>
      {currentClue.clue}
    </div>
  );
};

export default function MyCrossword() {
  const crosswordRef = React.useRef();
  const gridRef = React.useRef();
  
  const onCrosswordComplete = (data) => {
    console.log('Crossword completed!', data);
  };

  const onAnswerCorrect = (direction, number, answer) => {
    console.log('Correct answer:', direction, number, answer);
  };

  const onAnswerIncorrect = (direction, number, answer) => {
    console.log('Incorrect answer:', direction, number, answer);
  };
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
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
              position: 'relative',
              width: '500px',
              maxWidth: '100%',
            }}
          >
            <CrosswordGrid />
            <OverlaysContainer gridRef={gridRef} />
          </div>
          <CurrentClue />
        </CrosswordProvider>
      </ThemeProvider>
    </div>
  );
}