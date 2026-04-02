import {
  useContext,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  useMemo,
  useEffect,
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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { QueueMusic, Search, Clear, GridView, ViewList } from "@mui/icons-material";
import { useQuery } from "@apollo/client";
import { createAppTheme } from "./theme";
import Header from "./components/Header";
import BackgroundArt from "./components/BackgroundArt";
import VideoList from "./components/video/VideoList";
import QueuedVideoList from "./components/queue/QueuedVideoList";
import MiniPlayer from "./components/miniplayer";
import videoReducer from "./store/reducer";
import { GET_QUEUED_VIDEOS } from "./graphql/queries";
import { VideoContext } from "./store/VideoContext";

// Inner component — rendered inside ThemeProvider so useMediaQuery can read the theme
function AppInner() {
  const { data } = useQuery(GET_QUEUED_VIDEOS);
  const context = useContext(VideoContext);
  const [state, dispatch] = useReducer(videoReducer, context);
  const greaterThanMd = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [viewMode, setViewMode] = useState("tiles");
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRestoreRef = useRef(null);

  useLayoutEffect(() => {
    if (scrollRestoreRef.current !== null) {
      const { videoId, offsetFromTop } = scrollRestoreRef.current;
      const el = document.querySelector(`[data-video-id="${videoId}"]`);
      if (el) {
        const newScrollY = el.getBoundingClientRect().top + window.scrollY - offsetFromTop;
        window.scrollTo(0, newScrollY);
      }
      scrollRestoreRef.current = null;
    }
  }, [sidebarOpen]);

  const toggleSidebar = (value) => {
    const elements = document.querySelectorAll("[data-video-id]");
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom > 100) {
        scrollRestoreRef.current = { videoId: el.dataset.videoId, offsetFromTop: rect.top };
        break;
      }
    }
    setSidebarOpen(value);
  };
  const handleFabClick = () => setMobileQueueOpen(true);
  const queue = useMemo(() => data?.queue ?? [], [data?.queue]);

  const hasMiniPlayer = !!state.video.id;

  // Scroll the active video card into view on video change (autoplay, keyboard, miniplayer next/prev)
  const isFirstVideoRef = useRef(true);
  useEffect(() => {
    if (!state.video.id) return;
    if (isFirstVideoRef.current) { isFirstVideoRef.current = false; return; }
    const el = document.querySelector(`[data-video-id="${state.video.id}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      const headerHeight = 64 + 16; // header + padding
      if (rect.top < headerHeight || rect.bottom > window.innerHeight) {
        window.scrollTo({ top: window.scrollY + rect.top - headerHeight, behavior: "smooth" });
      }
    }
  }, [state.video.id]);

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
      <BackgroundArt />
      <Header onToggleSidebar={() => toggleSidebar((v) => !v)} />
      <Grid
        container
        sx={{
          pt: "calc(64px + 16px)",
          px: { xs: 1, sm: 2 },
          pb: hasMiniPlayer ? "120px" : 0,
        }}
      >
        {greaterThanMd && sidebarOpen && (
          <Grid item md={3} sx={{ position: "sticky", top: "calc(64px + 16px)", alignSelf: "flex-start", maxHeight: "calc(100vh - 64px - 16px)", overflowY: "auto" }}>
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
        <Grid item xs={12} md={greaterThanMd && sidebarOpen ? 9 : 12} sx={{ pt: greaterThanMd ? "44px" : 0 }}>
          {!greaterThanMd && (
            <Box sx={{ px: 1, pt: 1, pb: 1, display: "flex", gap: 1, alignItems: "center" }}>
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
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, v) => v && setViewMode(v)}
                size="small"
              >
                <ToggleButton value="tiles"><GridView sx={{ fontSize: 18 }} /></ToggleButton>
                <ToggleButton value="list"><ViewList sx={{ fontSize: 18 }} /></ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
          {greaterThanMd && (
            <Box sx={{ position: "fixed", top: 72, right: 24, zIndex: 1100 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, v) => v && setViewMode(v)}
                size="small"
              >
                <ToggleButton value="tiles"><GridView sx={{ fontSize: 18 }} /></ToggleButton>
                <ToggleButton value="list"><ViewList sx={{ fontSize: 18 }} /></ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
          <VideoList queue={queue} filter={filter} viewMode={viewMode} />
        </Grid>
      </Grid>

      {/* Mini player */}
      <MiniPlayer queue={queue} />

      {/* Mobile queue FAB */}
      {!greaterThanMd && (
        <Fab
          color="primary"
          size="medium"
          sx={{
            position: "fixed",
            bottom: hasMiniPlayer ? 130 : 24,
            right: 24,
            transition: "bottom 0.2s",
            zIndex: 1200,
          }}
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

const darkTheme = createAppTheme();

// Outer wrapper — provides ThemeProvider
export default function App() {

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppInner />
    </ThemeProvider>
  );
}
