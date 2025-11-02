import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { useDarkMode } from "../../hooks/useDarkMode";
type AutoFitTextProps = {
  text: string;
  fill?: string;
  className?: string;
  maxFontSize?: number;
  minFontSize?: number;
  darkFill?: string;
};

export function SvgTextFit({
  text,
  fill = "white",
  darkFill = "black",
  className = "",
  maxFontSize = 100,
  minFontSize = 10,
}: AutoFitTextProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);
  const { darkMode } = useDarkMode();
  const fitText = useCallback(() => {
    if (!svgRef.current || !textRef.current) return;
    const fontSizeRef = maxFontSize;
    textRef.current.setAttribute("font-size", fontSizeRef.toString());

    const bbox = textRef.current.getBBox();
    const ratio = svgRef.current.width.animVal.value / bbox.width;
    let newFontSize = fontSizeRef * ratio;

    // Limiter la taille pour rester lisible
    newFontSize = Math.max(minFontSize, Math.min(maxFontSize, newFontSize));

    setFontSize(newFontSize);
  }, [svgRef, textRef, maxFontSize, minFontSize]);
  useEffect(() => {
    fitText();
    window.addEventListener("resize", fitText);
    return () => window.removeEventListener("resize", fitText);
  }, [text, fitText]);

  return (
    <svg
      ref={svgRef}
      className={cn(className)}
      width="100%"
      height="100%"
      preserveAspectRatio="xMinYMid meet"
    >
      <text
        ref={textRef}
        x="50%"
        y="50%"
        fill={darkMode ? darkFill : fill}
        fontSize={fontSize}
        dominantBaseline="middle"
        lengthAdjust="spacing"
        textAnchor="middle"
        style={{ whiteSpace: "pre" }}
      >
        {text}
      </text>
    </svg>
  );
}
