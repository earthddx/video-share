import {
  useContext,
  useReducer,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  Grid,
  useMediaQuery,
  ThemeProvider,
  CssBaseline,
  Fab,
  Drawer,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { QueueMusic, Search, Clear } from "@mui/icons-material";
import { useQuery } from "@apollo/client";
import { createAppTheme } from "./theme";
import Header from "./components/Header";
import VideoList from "./components/video/VideoList";
import QueuedVideoList from "./components/queue/QueuedVideoList";
import MiniPlayer from "./components/miniplayer";
import videoReducer from "./store/reducer";
import { GET_QUEUED_VIDEOS } from "./graphql/queries";
import { VideoContext } from "./store/VideoContext";
import { ThemeContext } from "./store/ThemeContext";

// Inner component — rendered inside ThemeProvider so useMediaQuery can read the theme
function AppInner() {
  const { data } = useQuery(GET_QUEUED_VIDEOS);
  const context = useContext(VideoContext);
  const [state, dispatch] = useReducer(videoReducer, context);
  const greaterThanMd = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [fabPos, setFabPos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fabPos"));
    } catch {
      return null;
    }
  });
  const fabDragRef = useRef(null);
  const latestFabPosRef = useRef(fabPos);
  const wasDragRef = useRef(false);

  const handleFabPointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    fabDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleFabPointerMove = (e) => {
    if (!fabDragRef.current) return;
    const { startX, startY, offsetX, offsetY } = fabDragRef.current;
    if (!fabDragRef.current.moved) {
      if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5)
        return;
      fabDragRef.current.moved = true;
    }
    const size = 56;
    const x = Math.max(
      8,
      Math.min(window.innerWidth - size - 8, e.clientX - offsetX),
    );
    const y = Math.max(
      8,
      Math.min(window.innerHeight - size - 8, e.clientY - offsetY),
    );
    const pos = { x, y };
    latestFabPosRef.current = pos;
    setFabPos(pos);
  };

  const handleFabPointerUp = () => {
    wasDragRef.current = fabDragRef.current?.moved ?? false;
    if (wasDragRef.current)
      localStorage.setItem("fabPos", JSON.stringify(latestFabPosRef.current));
    fabDragRef.current = null;
  };

  const handleFabClick = () => {
    if (wasDragRef.current) {
      wasDragRef.current = false;
      return;
    }
    setMobileQueueOpen(true);
  };
  const queue = useMemo(() => data?.queue ?? [], [data?.queue]);

  const hasMiniPlayer = !!state.video.id;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't fire when user is typing
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable)
        return;

      if (e.key === "?") {
        setShortcutsOpen((v) => !v);
      } else if (e.code === "Space") {
        e.preventDefault();
        if (!state.video.id) return;
        dispatch(
          state.isPlaying ? { type: "PAUSE_VIDEO" } : { type: "PLAY_VIDEO" },
        );
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
            <Box sx={{ px: 2, pt: 1, pb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Filter by title or artist…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" sx={{ color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                  endAdornment: filter ? (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end" onClick={() => setFilter("")}>
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Box>
            <QueuedVideoList queue={queue} />
          </Grid>
        )}
        <Grid item xs={12} md={9}>
          {!greaterThanMd && (
            <Box sx={{ px: 1, pt: 1, pb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Filter by title or artist…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" sx={{ color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                  endAdornment: filter ? (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end" onClick={() => setFilter("")}>
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Box>
          )}
          <VideoList queue={queue} filter={filter} />
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
            ...(fabPos
              ? { top: fabPos.y, left: fabPos.x }
              : {
                  bottom: hasMiniPlayer ? 130 : 24,
                  right: 24,
                  transition: "bottom 0.2s",
                }),
            zIndex: 1200,
            touchAction: "none",
          }}
          onPointerDown={handleFabPointerDown}
          onPointerMove={handleFabPointerMove}
          onPointerUp={handleFabPointerUp}
          onClick={handleFabClick}
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
      {/* Keyboard shortcuts dialog */}
      <Dialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogContent>
          {[
            ["Space", "Play / Pause"],
            ["→", "Next in queue"],
            ["←", "Previous in queue"],
            ["?", "Toggle this overlay"],
          ].map(([key, label]) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.75,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Box
                component="kbd"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 13,
                  fontFamily: "monospace",
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {key}
              </Box>
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </VideoContext.Provider>
  );
}

// Outer wrapper — owns theme state and provides ThemeProvider
export default function App() {
  const [mode, setMode] = useState(
    () => localStorage.getItem("themeMode") || "dark",
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
