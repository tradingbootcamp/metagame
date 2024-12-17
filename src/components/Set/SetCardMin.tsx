import { memo } from "react";

interface SetCardMinProps {
  size?: "sm" | "md";
}

export default memo(function SetCardMin({ size = "md" }: SetCardMinProps) {
  const sizeClass = {
    sm: "w-24 h-16",
    md: "w-40 h-24",
  }[size];

  return (
    <div
      className={`${sizeClass} rounded-lg border-2 flex justify-center items-center bg-dark-500`}
    >
      <div className="h-[80%] aspect-[1/2]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 30 60"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M15 5 L27 30 L15 55 L3 30 Z"
            stroke="red"
            fill="red"
            strokeWidth="3"
          />
        </svg>
      </div>
    </div>
  );
});
