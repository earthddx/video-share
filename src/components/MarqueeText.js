import { useRef, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

/**
 * Renders text that scrolls on hover to reveal the full content when it overflows.
 * Static when the text fits or when not hovered.
 */
export default function MarqueeText({ children, typographyProps = {}, always = false }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;
    const diff = text.scrollWidth - container.clientWidth;
    setOffset(diff > 0 ? diff : 0);
  }, [children]);

  const duration = `${6 + offset / 25}s`;

  return (
    <Box
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{ overflow: "hidden" }}
    >
      <Typography
        ref={textRef}
        {...typographyProps}
        sx={{
          display: "inline-block",
          whiteSpace: "nowrap",
          ...(offset > 0 && (always || hovered) && {
            animationName: "marquee-scroll",
            animationDuration: duration,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: "0.4s",
            animationFillMode: "both",
            "@keyframes marquee-scroll": {
              "0%, 20%": { transform: "translateX(0)" },
              "60%, 80%": { transform: `translateX(-${offset}px)` },
              "100%": { transform: "translateX(0)" },
            },
          }),
          ...typographyProps.sx,
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}
