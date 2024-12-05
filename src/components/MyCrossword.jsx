import React from 'react';
import Crossword, { ThemeProvider, CrosswordProvider, CrosswordGrid } from '@jaredreisinger/react-crossword';

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
    8: {
      clue: '',
      answer: 'O',
      row: 1,
      col: 1,
    },
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

export default function MyCrossword() {

  const crosswordRef = React.useRef();

  const onCrosswordComplete = () => {
    // Now we can check if the crossword is correct using the ref
    if (crosswordRef.current.isCrosswordCorrect()) {
      console.log('Crossword correct!');
    } else {
      console.log('Crossword incorrect!');
    }
  };

  const onAnswerCorrect = (direction, number, answer) => {
    console.log(`Correct ${direction} ${number} ${answer}`);
  };
  const onAnswerIncorrect = (direction, number, answer) => {
    console.log(`Incorrect ${direction} ${number} ${answer}`);
  };

  return (
  <div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
   }}>
  <ThemeProvider
    theme={{
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
    }}
  >
    
    <CrosswordProvider 
      data={data} 
      onCrosswordComplete={onCrosswordComplete} 
      ref={crosswordRef} 
      onAnswerCorrect={onAnswerCorrect} 
      onAnswerIncorrect={onAnswerIncorrect} 
    >
      <CrosswordGrid />
    </CrosswordProvider>
  </ThemeProvider>
    </div>
  );
}