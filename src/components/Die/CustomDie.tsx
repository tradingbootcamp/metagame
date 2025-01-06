import { pipPaths } from "./DicePipPaths";
import type { Face } from "./DicePipPaths";

interface CustomDieProps {
  dieIdentifier?: Record<Face, number>;
  fill?: string;
  stroke?: string;
  size?: number;
}

/**
 * CustomDie is a component that renders a die with pips.
 * @param dieIdentifier - The die identifier object that contains the pips for each face.
 * @param fill - The fill (really a stroke fill; the faces are transparent) color of the die.
 * @param stroke - The stroke color of the die.
 * @param size - The size of the die.
 * @returns A React component that renders a die with pips.
 */
export function CustomDie({
  dieIdentifier = {
    left: 3,
    top: 1,
    right: 4,
  },
  fill = "#ff57ff",
  stroke = "#aa33ff",
  size = 512,
}: CustomDieProps) {
  const renderFacePips = (face: Face) => {
    const pipNumber = dieIdentifier[face];
    const paths = pipPaths[face][pipNumber];
    return paths?.map((path, index) => (
      <path key={`${face}-${pipNumber}-${index}`} className="st0" d={path} />
    ));
  };

  return (
    <svg
      height={size}
      width={size}
      version="1.1"
      id="_x32_"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="-10.24 -10.24 532.48 532.48"
      xmlSpace="preserve"
      fill={fill}
      stroke={stroke}
      strokeWidth="13.824"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g id="SVGRepo_iconCarrier">
        <style type="text/css">{`.st0{fill:${fill};}`}</style>
        <g>
          <path
            className="st0"
            d="M449.528,105.602L288.459,8.989C278.469,2.994,267.232,0,255.993,0c-11.225,0-22.463,2.994-32.452,8.989
            L62.471,105.602c-19.012,11.406-30.64,31.95-30.64,54.117v192.562c0,22.168,11.628,42.711,30.64,54.117l161.069,96.613
            c9.989,5.988,21.228,8.989,32.452,8.989c11.239,0,22.476-3.001,32.466-8.989l161.069-96.613
            c19.013-11.406,30.64-31.95,30.64-54.117V159.719C480.168,137.552,468.541,117.008,449.528,105.602z M250.595,492.733
            c-6.028-0.745-11.936-2.712-17.321-5.948L72.206,390.172c-13.306-7.99-21.456-22.37-21.456-37.891V159.719
            c0-6.022,1.242-11.862,3.518-17.233l196.328,117.76V492.733z M59.665,133.114c3.37-4.464,7.593-8.318,12.54-11.285l161.069-96.613
            c6.996-4.196,14.85-6.291,22.718-6.291c7.882,0,15.737,2.095,22.732,6.291l161.069,96.613c4.942,2.967,9.171,6.821,12.54,11.285
            L255.993,250.881L59.665,133.114z M461.249,352.281c0,15.521-8.15,29.901-21.456,37.891l-161.069,96.613
            c-5.397,3.236-11.292,5.203-17.32,5.948V260.246l196.328-117.76c2.282,5.37,3.518,11.211,3.518,17.233V352.281z"
          />
          {/* Render pips for each face */}
          {renderFacePips("left")}
          {renderFacePips("top")}
          {renderFacePips("right")}
        </g>
      </g>
    </svg>
  );
}
