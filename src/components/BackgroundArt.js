import { useContext, useEffect, useState } from "react";
import { Box, GlobalStyles, useMediaQuery } from "@mui/material";
import { VideoContext } from "../store/VideoContext";

const FADE_MS = 700;

const thumbLayerSx = (url) => ({
  position: "absolute",
  inset: 0,
  backgroundImage: `url(${url})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

export default function BackgroundArt() {
  const { state } = useContext(VideoContext);
  const isMobile = useMediaQuery("(max-width:600px)");

  const [current, setCurrent] = useState(state.video?.thumbnail ?? null);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    const next = state.video?.thumbnail ?? null;
    if (!next || next === current) return;
    setPrev(current);
    setCurrent(next);
    const t = setTimeout(() => setPrev(null), FADE_MS);
    return () => clearTimeout(t);
  }, [state.video?.thumbnail]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isMobile || !current) return null;

  return (
    <>
      <GlobalStyles styles={{ body: { backgroundColor: "transparent !important" } }} />

      {/* Crossfade thumbnail layers */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          overflow: "hidden",
          pointerEvents: "none",
          transform: "scale(1.1)",
          filter: "blur(18px)",
        }}
      >
        {/* Outgoing thumbnail */}
        {prev && <Box sx={thumbLayerSx(prev)} />}

        {/* Incoming thumbnail */}
        <Box
          key={current}
          sx={{
            ...thumbLayerSx(current),
            "@keyframes artFadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
            animation: `artFadeIn ${FADE_MS}ms ease-in-out`,
          }}
        />
      </Box>

      {/* Dark scrim so UI stays readable */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          bgcolor: "rgba(0,0,0,0.6)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
