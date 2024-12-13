interface SetCard {
  shape: "diamond" | "squiggle" | "oval";
  color: "red" | "green" | "purple";
  fill: "solid" | "striped" | "open";
  number: 1 | 2 | 3;
}
interface SetCardProps {
  card: SetCard;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function SetCard({
  card,
  size = "md",
  selected = false,
}: SetCardProps) {
  const { shape, color, fill, number } = card;

  const sizeClasses = {
    sm: "w-32 h-20",
    md: "w-40 h-24",
    lg: "w-48 h-28",
  };

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
              id={`stripe-${color}-${shape}`}
              patternUnits="userSpaceOnUse"
              width="4"
              height="4"
            >
              <path
                d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
                stroke={color}
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {shape === "diamond" && (
            <path
              d="M15 5 L27 30 L15 55 L3 30 Z"
              stroke={color}
              fill={
                fill === "striped"
                  ? `url(#stripe-${color}-${shape})`
                  : fill === "solid"
                    ? color
                    : "none"
              }
              strokeWidth="2"
            />
          )}
          {shape === "oval" && (
            <line
              x1="15"
              y1="15"
              x2="15"
              y2="45"
              stroke={color}
              strokeWidth="30"
              strokeLinecap="round"
              fill={
                fill === "striped"
                  ? `url(#stripe-${color}-${shape})`
                  : fill === "solid"
                    ? color
                    : "none"
              }
            />
          )}
          {shape === "squiggle" && (
            <path
              d="M15,9 C30,25 0,35 15,51"
              stroke={color}
              fill={
                fill === "striped"
                  ? `url(#stripe-${color}-${shape})`
                  : fill === "solid"
                    ? color
                    : "none"
              }
              strokeWidth="18"
              strokeLinecap="round"
            />
          )}
        </svg>
      </div>
    );
  };

  const selectedClasses = selected
    ? "shadow-[0_0_36px_0_rgba(255,255,255,0.7)] bg-slate-100 bg-opacity-10"
    : "shadow-[2px_2px_4px_0_rgba(255,255,255,0.5)]";

  return (
    <div
      className={`${sizeClasses[size]} flex justify-center items-center gap-2 border-2 rounded-lg ${selectedClasses} `}
    >
      {[...Array(number)].map((_, i) => (
        <div key={i} className="flex justify-center items-center h-full">
          {getShape()}
        </div>
      ))}
    </div>
  );
}
