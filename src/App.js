import React, { createContext, useContext, useReducer, useState, useMemo, useEffect } from "react";
import {
  Grid,
  useMediaQuery,
  ThemeProvider,
  CssBaseline,
  Fab,
  Drawer,
  Box,
} from "@mui/material";
import { QueueMusic } from "@mui/icons-material";
import { useQuery } from "@apollo/client";

import { createAppTheme } from "./theme";
import Header from "./components/Header";
import VideoList from "./components/VideoList";
import QueuedVideoList from "./components/QueuedVideoList";
import MiniPlayer from "./components/MiniPlayer";
import videoReducer from "./reducer";
import { GET_QUEUED_VIDEOS } from "./graphql/queries";

const _savedVideo = (() => {
  try { return JSON.parse(localStorage.getItem("currentVideo")); } catch { return null; }
})();
const _savedSeconds = Number(localStorage.getItem("playedSeconds")) || 0;

export const VideoContext = createContext({
  video: _savedVideo ?? {
    artist: "",
    title: "",
    duration: 0,
    id: "",
    thumbnail: "",
    url: "",
  },
  isPlaying: false,
  playedSeconds: _savedSeconds,
  isVideoExpanded: false,
  seekTo: null,
  volume: 1,
});

export const ThemeContext = createContext({ mode: "dark", toggleTheme: () => {} });

// Inner component — rendered inside ThemeProvider so useMediaQuery can read the theme
function AppInner() {
  const { data } = useQuery(GET_QUEUED_VIDEOS);
  const context = useContext(VideoContext);
  const [state, dispatch] = useReducer(videoReducer, context);
  const greaterThanMd = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);
  const queue = data?.queue ?? [];

  const hasMiniPlayer = !!state.video.id;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't fire when user is typing
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (!state.video.id) return;
        dispatch(state.isPlaying ? { type: "PAUSE_VIDEO" } : { type: "PLAY_VIDEO" });
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        const pos = queue.findIndex((v) => v.id === state.video.id);
        const next = queue[pos + 1];
        if (next) dispatch({ type: "SET_VIDEO", payload: { video: next } });
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        const pos = queue.findIndex((v) => v.id === state.video.id);
        const prev = queue[pos - 1];
        if (prev) dispatch({ type: "SET_VIDEO", payload: { video: prev } });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isPlaying, state.video.id, queue, dispatch]);

  // Persist current video + timestamp before page unload
  useEffect(() => {
    const save = () => {
      if (state.video.id) {
        localStorage.setItem("currentVideo", JSON.stringify(state.video));
        localStorage.setItem("playedSeconds", String(state.playedSeconds));
      }
    };
    window.addEventListener("beforeunload", save);
    return () => window.removeEventListener("beforeunload", save);
  }, [state.video, state.playedSeconds]);

  return (
    <VideoContext.Provider value={{ state, dispatch }}>
      <Header />
      <Grid
        container
        sx={{
          pt: "calc(64px + 16px)",
          px: { xs: 1, sm: 2 },
          pb: hasMiniPlayer ? "100px" : 0,
        }}
      >
        {greaterThanMd && (
          <Grid item md={3}>
            <QueuedVideoList queue={queue} />
          </Grid>
        )}
        <Grid item xs={12} md={9}>
          <VideoList queue={queue} />
        </Grid>
      </Grid>

      {/* Mini player */}
      <MiniPlayer queue={queue} />

      {/* Mobile queue FAB — floats above mini player when active */}
      {!greaterThanMd && (
        <Fab
          color="primary"
          size="medium"
          sx={{
            position: "fixed",
            bottom: hasMiniPlayer ? 130 : 24,
            right: 24,
            zIndex: 1200,
            transition: "bottom 0.2s",
          }}
          onClick={() => setMobileQueueOpen(true)}
        >
          <QueueMusic />
        </Fab>
      )}

      {/* Mobile queue bottom drawer */}
      <Drawer
        anchor="bottom"
        open={mobileQueueOpen && !greaterThanMd}
        onClose={() => setMobileQueueOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px 16px 0 0",
            maxHeight: "70vh",
            overflowY: "auto",
            pb: hasMiniPlayer ? "100px" : 0,
          },
        }}
      >
        <Box sx={{ pb: 2 }}>
          <QueuedVideoList queue={queue} />
        </Box>
      </Drawer>
    </VideoContext.Provider>
  );
}

// Outer wrapper — owns theme state and provides ThemeProvider
export default function App() {
  const [mode, setMode] = useState(
    () => localStorage.getItem("themeMode") || "dark"
  );
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleTheme = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    localStorage.setItem("themeMode", next);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppInner />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
