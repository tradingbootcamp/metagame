import React from 'react';
import Crossword, { ThemeProvider, CrosswordProvider, CrosswordContext, CrosswordGrid, Cell, CrosswordSizeContext, Clue } from '@jaredreisinger/react-crossword';

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
    },
    // 8: {
    //   clue: '',
    //   answer: 'O',
    //   row: 1,
    //   col: 1,
    // },
    9: {
      clue: '',
      answer: 'N',
      row: 1,
      col: 2,
    },
    10: {
      clue: '',
      answer: 'S',
      row: 1,
      col: 3,
    },
    11: {
      clue: '',
      answer: 'O',
      row: 1,
      col: 4,
    },
    12: {
      clue: '',
      answer: 'L',
      row: 1,
      col: 5,
    },
    13: {
      clue: '',
      answer: 'E',
      row: 1,
      col: 6,
    },
    15: {
      clue: '',
      answer: 'U',
      row: 2,
      col: 1,
    },
    16: {
      clue: '',
      answer: 'T',
      row: 2,
      col: 2,
    },
    17: {
      clue: '',
      answer: 'P',
      row: 2,
      col: 3,
    },
    18: {
      clue: '',
      answer: 'O',
      row: 2,
      col: 4,
    },
    19: {
      clue: '',
      answer: 'S',
      row: 2,
      col: 5,
    },
    20: {
      clue: '',
      answer: 'T',
      row: 2,
      col: 6,
    },
    22: {
      clue: '',
      answer: 'R',
      row: 3,
      col: 1,
    },
    23: {
      clue: '',
      answer: 'E',
      row: 3,
      col: 2,
    },
    24: {
      clue: '',
      answer: 'S',
      row: 3,
      col: 3,
    },
    25: {
      clue: '',
      answer: 'S',
      row: 3,
      col: 4,
    },
    26: {
      clue: '',
      answer: 'E',
      row: 3,
      col: 5,
    },
    27: {
      clue: '',
      answer: 'S',
      row: 3,
      col: 6,
    },
    29: {
      clue: '',
      answer: 'S',
      row: 4,
      col: 1,
    },
    30: {
      clue: '',
      answer: 'R',
      row: 4,
      col: 2,
    },
  },
};

const OverlaysContainer = ({ gridRef }) => {
  const [showOverlays, setShowOverlays] = React.useState(false);
  const [dimensions, setDimensions] = React.useState(null);
  const crosswordContext = React.useContext(CrosswordContext);
  console.log('CrosswordContext:', crosswordContext);
  const crosswordSizeContext = React.useContext(CrosswordSizeContext);
  console.log('CrosswordSizeContext:', crosswordSizeContext);

  const calculateDimensions = React.useCallback(() => {
    if (!gridRef.current) {
      console.log('No grid ref yet');
      return;
    }

    const gridElement = gridRef.current;
    const gridRect = gridElement.getBoundingClientRect();
    console.log('Grid rect:', gridRect);

    if (gridRect.width === 0) {
      console.log('Grid has no width yet');
      return;
    }

    const gridSize = Math.min(gridRect.width, gridRect.height);
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
  console.log('CellOverlay rendering:', { row, col, style, cellSize });
  
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
          r={cellHalf - 1}
          fill="none"
          stroke="black"
          strokeWidth="1"
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
          color: 'red',
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
            style={{
              position: 'relative',
              width: '500px',
              maxWidth: '100%',
              aspectRatio: '1',
            }}
          >
            <CrosswordGrid />
            <OverlaysContainer gridRef={gridRef} />
          </div>
        </CrosswordProvider>
      </ThemeProvider>
    </div>
  );
}