import { useState } from "react";
import {
  generateRandomDieIdentifier,
  type DieGenerationOptions,
} from "./DiceUtils";
import { CustomDie } from "./CustomDie";
import { cn } from "@/utils/cn";

type AnimatedCustomDieProps = {
  dieGenerationOptions?: DieGenerationOptions; // options for generating the die; whether to allow repeats, 7 sum, zero/blank
  duration?: number; // duration of the animation
  totalFrames?: number; // number of frames (different dice)
  className?: string; // class to apply to the die button
  scaleAnimation?: boolean; // scale the die when animating
};

export default function AnimatedCustomDie({
  dieGenerationOptions = {},
  duration = 500,
  totalFrames = 8,
  scaleAnimation = true,
  className = "",
}: AnimatedCustomDieProps) {
  const [dieIdentifier, setDieIdentifier] = useState(
    generateRandomDieIdentifier(dieGenerationOptions),
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const startTime = performance.now();
    let lastFrameIndex = -1;

    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      if (elapsed >= duration) {
        setIsAnimating(false);
        return;
      }

      // Calculate which frame we should be on based on progress
      const progress = elapsed / duration;
      const frameIndex = Math.floor(progress * totalFrames);

      // Only update value if we've moved to a new frame
      if (frameIndex > lastFrameIndex) {
        setDieIdentifier((prev) => {
          const next = generateRandomDieIdentifier(dieGenerationOptions);
          // Ensure we don't get the same values
          return next.left === prev.left &&
            next.top === prev.top &&
            next.right === prev.right
            ? generateRandomDieIdentifier(dieGenerationOptions)
            : next;
        });
        lastFrameIndex = frameIndex;
      }

      requestAnimationFrame(animateFrame);
    };

    requestAnimationFrame(animateFrame);
  };

  return (
    <button
      onClick={animate}
      disabled={isAnimating}
      className={cn(
        "relative inline-flex items-center justify-center size-10 transition-transform duration-500",
        className,
      )}
      style={
        scaleAnimation
          ? {
              transform: isAnimating ? "scale(0.92)" : "scale(1)",
              transition: "transform 0.1s ease-in-out",
            }
          : {}
      }
    >
      <CustomDie dieIdentifier={dieIdentifier} />
    </button>
  );
}
