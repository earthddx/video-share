import { useState, useEffect } from "react";

export function useHighlight(videoId) {
  const [highlighted, setHighlighted] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail.id !== videoId) return;
      setHighlighted(true);
      setTimeout(() => setHighlighted(false), 3200);
    };
    window.addEventListener("highlightVideo", handler);
    return () => window.removeEventListener("highlightVideo", handler);
  }, [videoId]);

  return highlighted;
}
