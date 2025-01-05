export const SET_PROPERTIES = {
  shapes: ["diamond", "oval", "squiggle"],
  colors: ["red", "green", "purple"],
  fills: ["solid", "striped", "open"],
  number: [1, 2, 3],
} as const;

export type SetShape = (typeof SET_PROPERTIES.shapes)[number];
export type SetColor = (typeof SET_PROPERTIES.colors)[number];
export type SetFill = (typeof SET_PROPERTIES.fills)[number];
export type SetNumber = (typeof SET_PROPERTIES.number)[number];

export interface SetCard {
  shape: SetShape;
  color: SetColor;
  fill: SetFill;
  number: SetNumber;
}
interface SetCardProps {
  card: SetCard;
  selected?: boolean;
  size?: "xxs" | "xs" | "sm" | "md" | "lg";
  responsive?: boolean;
}

export default function SetCard({
  card,
  size = "md",
  selected = false,
  responsive = false,
}: SetCardProps) {
  const { shape, color, fill, number } = card;

  const sizeClass = responsive
    ? "aspect-[5/3] w-full gap-1"
    : {
        xxs: "w-10 h-6 gap-0.5",
        xs: "w-16 h-10 gap-1 ",
        sm: "w-24 h-16 gap-2 ",
        md: "w-40 h-24 gap-3 ",
        lg: "w-48 h-28 gap-4 ",
      }[size];

  const getShape = () => {
    return (
      <div className="h-[80%] aspect-[1/2]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 30 60"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern
              id={`stripe-${color}`}
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
            >
              <line
                x1="0"
                y1="3"
                x2="6"
                y2="3"
                stroke={color}
                strokeWidth="3"
              />
            </pattern>
          </defs>

          {shape === "diamond" && (
            <path
              d="M15 5 L27 30 L15 55 L3 30 Z"
              stroke={color}
              fill={
                fill === "striped"
                  ? `url(#stripe-${color})`
                  : fill === "solid"
                    ? color
                    : "none"
              }
              strokeWidth="3"
            />
          )}
          {shape === "oval" && (
            <path
              d="M 5 18 v 24 a 10 10 0 0 0 20 0 v -24 a 10 10 0 0 0 -20 0"
              stroke={color}
              fill={
                fill === "striped"
                  ? `url(#stripe-${color})`
                  : fill === "solid"
                    ? color
                    : "none"
              }
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}
          {shape === "squiggle" && (
            <path
              d="M 4.37 11.5 C 4.37 8.74 5.75 6.44 8.05 4.6 C 11.73 2.3 16.79 3.22 19.55 6.9 c 5.98 8.74 7.82 18.4 2.76 27.6 c -1.84 3.22 -0.92 5.98 1.38 8.74 c 2.76 3.22 2.3 8.28 -0.92 11.5 c -3.22 2.76 -8.28 2.3 -11.5 -0.92 C 4.37 45.54 2.99 35.88 8.05 26.68 C 9.89 23 8.51 19.32 5.75 16.1 C 4.83 14.72 4.37 12.88 4.37 11.5 z"
              stroke={color}
              strokeWidth="3"
              fill={
                fill === "striped"
                  ? `url(#stripe-${color})`
                  : fill === "solid"
                    ? color
                    : "none"
              }
            />
          )}
        </svg>
      </div>
    );
  };

  const selectedClasses = selected
    ? "shadow-[0_0_36px_0_rgba(255,255,255,0.7)] border-blue-800"
    : "shadow-[2px_2px_4px_0_rgba(255,255,255,0.5)]";

  return (
    <div
      className={`${sizeClass} rounded-[8%] flex justify-center items-center border-2 ${selectedClasses} bg-base-100`}
    >
      {[...Array(number)].map((_, i) => (
        <div key={i} className="flex justify-center items-center h-full">
          {getShape()}
        </div>
      ))}
    </div>
  );
}
