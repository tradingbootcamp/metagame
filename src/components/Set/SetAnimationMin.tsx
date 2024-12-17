import { useState, useEffect } from "react";
import SetCard from "./SetCard";
import { generateSetBoard } from "./SetSet";

export default function SetAnimationMin() {
  const [board] = useState(generateSetBoard("atLeastOne"));

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="grid grid-cols-6 md:grid-cols-12 gap-1 md:gap-2 w-full auto-rows-fr">
        {board.map((card, index) => (
          <div
            key={`${card.shape}-${card.color}-${card.fill}-${card.number}-${index}`}
          >
            <SetCard card={card} size="sm" responsive />
          </div>
        ))}
      </div>
    </div>
  );
}
