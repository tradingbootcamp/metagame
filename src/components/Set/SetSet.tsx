import { SET_PROPERTIES, type SetCard } from "./SetCard";

// Helper to check if three cards form a valid set
function isSet(card1: SetCard, card2: SetCard, card3: SetCard): boolean {
  const properties: (keyof SetCard)[] = ["shape", "color", "fill", "number"];
  return properties.every((prop) => {
    const values = new Set([card1[prop], card2[prop], card3[prop]]);
    return values.size === 1 || values.size === 3;
  });
}

type SetBoardMode = "random" | "exactlyOne" | "atLeastOne";

/**
 * Generates a board of 12 Set cards
 * @param mode - How to generate the board: "random" (default), "exactlyOne", or "atLeastOne"
 * @returns An array of 12 Set cards
 */
export function generateSetBoard(mode: SetBoardMode = "random"): SetCard[] {
  function generateRandomCard(): SetCard {
    return {
      shape:
        SET_PROPERTIES.shapes[
          Math.floor(Math.random() * SET_PROPERTIES.shapes.length)
        ],
      color:
        SET_PROPERTIES.colors[
          Math.floor(Math.random() * SET_PROPERTIES.colors.length)
        ],
      fill: SET_PROPERTIES.fills[
        Math.floor(Math.random() * SET_PROPERTIES.fills.length)
      ],
      number:
        SET_PROPERTIES.numbers[
          Math.floor(Math.random() * SET_PROPERTIES.numbers.length)
        ],
    };
  }

  function generateBoard(): SetCard[] {
    const board: SetCard[] = [];
    while (board.length < 12) {
      const newCard = generateRandomCard();
      // Ensure no duplicate cards
      if (
        !board.some(
          (card) =>
            card.shape === newCard.shape &&
            card.color === newCard.color &&
            card.fill === newCard.fill &&
            card.number === newCard.number,
        )
      ) {
        board.push(newCard);
      }
    }
    return board;
  }

  function countSets(cards: SetCard[]): number {
    let setCount = 0;
    for (let i = 0; i < cards.length - 2; i++) {
      for (let j = i + 1; j < cards.length - 1; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (isSet(cards[i], cards[j], cards[k])) {
            setCount++;
          }
        }
      }
    }
    return setCount;
  }

  // For random boards, just generate and return
  if (mode === "random") {
    return generateBoard();
  }

  // Keep generating boards until we find one that matches our criteria
  while (true) {
    const board = generateBoard();
    const setCount = countSets(board);

    if (mode === "exactlyOne" && setCount === 1) {
      return board;
    }
    if (mode === "atLeastOne" && setCount >= 1) {
      return board;
    }
  }
}
