import { useRef, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

/**
 * Renders text that scrolls left to reveal the full content when it overflows,
 * then scrolls back. Static when the text fits.
 */
export default function MarqueeText({ children, typographyProps = {} }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;
    const diff = text.scrollWidth - container.clientWidth;
    setOffset(diff > 0 ? diff : 0);
  }, [children]);

  return (
    <Box ref={containerRef} sx={{ overflow: "hidden" }}>
      <Typography
        ref={textRef}
        {...typographyProps}
        sx={{
          display: "inline-block",
          whiteSpace: "nowrap",
          ...(offset > 0 && {
            animationName: "marquee-scroll",
            animationDuration: `${3 + offset / 40}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: "1s",
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
