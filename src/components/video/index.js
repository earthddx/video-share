import { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
  CardMedia,
  IconButton,
  Tooltip,
  Box,
  Snackbar,
} from "@mui/material";
import {
  PlayArrow,
  Cancel,
  Fullscreen,
  Close,
} from "@mui/icons-material";
import { useMutation } from "@apollo/client";
import ReactPlayer from "react-player";
import { ADD_OR_REMOVE_VIDEO_FROM_QUEUE } from "../../graphql/mutations";
import PlayerControls from "./PlayerControls";
import VideoInfoRow from "./VideoInfoRow";
import { VideoContext } from "../../store/VideoContext";

const MODAL_CONTROLS_HEIGHT = 80;

export default function Video({ video, handleDeleteVideo, queue, allVideos }) {
  const { artist, title, thumbnail } = video;
  const { state, dispatch } = useContext(VideoContext);

  const isCurrentVideo = !!state.video.id && video.id === state.video.id;

  const [currVideoInQueue, setCurrVideoInQueue] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [repeatVideo, setRepeatVideo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [positionInQueue, setPositionInQueue] = useState(0);

  const volume = state.volume ?? 1;
  const setVolume = (v) => dispatch({ type: "SET_VOLUME", payload: { volume: v } });

  const reactPlayerRef = useRef();
  const initialSecondsRef = useRef(isCurrentVideo ? state.playedSeconds : 0);
  const hasRestoredSeek = useRef(false);
  const lastDispatchedSecondsRef = useRef(0);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail.id !== video.id) return;
      setHighlighted(true);
      setTimeout(() => setHighlighted(false), 1200);
    };
    window.addEventListener("highlightVideo", handler);
    return () => window.removeEventListener("highlightVideo", handler);
  }, [video.id]);


  const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_VIDEO_FROM_QUEUE, {
    onCompleted: (data) => {
      localStorage.setItem("queue", JSON.stringify(data.addOrRemoveFromQueue));
    },
  });

  useEffect(() => {
    setCurrVideoInQueue(queue.some((item) => item.id === video.id));
  }, [video.id, queue]);

  useEffect(() => {
    setPositionInQueue(queue.findIndex((s) => s.id === video.id));
  }, [video.id, queue]);

  const hasAdvancedRef = useRef(false);

  useEffect(() => { hasAdvancedRef.current = false; }, [video.id]);

  // Auto-advance: queue first, then shared list as fallback
  const handleVideoEnd = useCallback(() => {
    if (!isCurrentVideo || repeatVideo || hasAdvancedRef.current) return;
    hasAdvancedRef.current = true;
    const nextInQueue = queue[positionInQueue + 1];
    if (nextInQueue) {
      setPlayed(0);
      dispatch({ type: "SET_VIDEO", payload: { video: nextInQueue } });
      return;
    }
    if (allVideos?.length) {
      const posInList = allVideos.findIndex((v) => v.id === video.id);
      const nextInList = allVideos[posInList + 1] ?? allVideos[0];
      if (nextInList && nextInList.id !== video.id) {
        setPlayed(0);
        dispatch({ type: "SET_VIDEO", payload: { video: nextInList } });
      }
    }
  }, [isCurrentVideo, repeatVideo, queue, positionInQueue, allVideos, video.id, dispatch]);

  // Fallback for YouTube (which sometimes suppresses onEnded)
  useEffect(() => {
    if (played >= 0.99) handleVideoEnd();
  }, [played, handleVideoEnd]);

  // Lock orientation to landscape on mobile when expanded
  useEffect(() => {
    if (!isCurrentVideo) return;
    if (state.isVideoExpanded) {
      window.screen.orientation?.lock?.("landscape").catch(() => {});
    } else {
      window.screen.orientation?.unlock?.();
    }
    return () => window.screen.orientation?.unlock?.();
  }, [state.isVideoExpanded, isCurrentVideo]);

  // Seek triggered from mini player
  useEffect(() => {
    if (!isCurrentVideo || state.seekTo == null) return;
    reactPlayerRef.current?.seekTo(state.seekTo);
    setPlayed(state.seekTo);
    dispatch({ type: "SEEK_TO_DONE" });
  }, [state.seekTo, isCurrentVideo, dispatch]);

  const handleTogglePlay = () => {
    if (isCurrentVideo) {
      dispatch(state.isPlaying ? { type: "PAUSE_VIDEO" } : { type: "PLAY_VIDEO" });
    } else {
      dispatch({ type: "SET_VIDEO", payload: { video } });
      dispatch({ type: "PLAY_VIDEO" });
    }
  };

  const handlePlayPrev = () => {
    const prev = queue[positionInQueue - 1];
    if (prev) dispatch({ type: "SET_VIDEO", payload: { video: prev } });
  };

  const handlePlayNext = () => {
    const next = queue[positionInQueue + 1];
    if (next) dispatch({ type: "SET_VIDEO", payload: { video: next } });
  };

  const handleAddToQueue = () => {
    addOrRemoveFromQueue({ variables: { input: { ...video, __typename: "Video" } } });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(video.url).then(() => setCopied(true));
  };

  const sharedControlsProps = {
    played,
    playedSeconds,
    duration: video.duration,
    volume,
    isPlaying: state.isPlaying,
    repeatVideo,
    positionInQueue,
    queueLength: queue.length,
    onSeekChange: (v) => setPlayed(v),
    onSeekStart: () => setIsUserSeeking(true),
    onSeekCommit: (v) => { setIsUserSeeking(false); reactPlayerRef.current?.seekTo(v); },
    onVolumeChange: setVolume,
    onPlayPrev: handlePlayPrev,
    onPlayNext: handlePlayNext,
    onTogglePlay: handleTogglePlay,
    onRepeatToggle: () => setRepeatVideo(!repeatVideo),
    playbackRate: state.playbackRate ?? 1,
    onSpeedChange: () => {
      const speeds = [0.75, 1, 1.25, 1.5, 2];
      const next = speeds[(speeds.indexOf(state.playbackRate ?? 1) + 1) % speeds.length];
      dispatch({ type: "SET_PLAYBACK_RATE", payload: { playbackRate: next } });
    },

  };

  const showControls = isCurrentVideo && !state.isVideoExpanded && (hovered || !state.isPlaying);

  return (
    <>
      <Box
        data-video-id={video.id}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          cursor: "pointer",
          borderRadius: 2,
          overflow: "hidden",
          transition: "background-color 0.2s",
          "&:hover": {
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          },
          "@keyframes videoHighlight": {
            "0%": { backgroundColor: "transparent", boxShadow: "0 0 0 0px rgba(239,83,80,0)" },
            "25%": { backgroundColor: "rgba(239,83,80,0.13)", boxShadow: "0 0 0 2px rgba(239,83,80,0.7)" },
            "50%": { backgroundColor: "rgba(239,83,80,0.10)", boxShadow: "0 0 0 2px rgba(239,83,80,0.5)" },
            "100%": { backgroundColor: "transparent", boxShadow: "0 0 0 0px rgba(239,83,80,0)" },
          },
          ...(highlighted && { animation: "videoHighlight 1.2s ease-in-out" }),
        }}
      >
        {/* 16:9 video area */}
        <Box sx={{ position: "relative", aspectRatio: "16/9", width: "100%", bgcolor: "black" }}>

          {/* Thumbnail (non-current) */}
          {!isCurrentVideo && (
            <CardMedia
              component="img"
              src={thumbnail}
              loading="lazy"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}

          {/* ReactPlayer — sole audio+video source */}
          {isCurrentVideo && (
            <Box
              onClick={handleTogglePlay}
              sx={
                state.isVideoExpanded
                  ? {
                      position: "fixed",
                      top: { xs: 0, sm: "50%" },
                      left: { xs: 0, sm: "50%" },
                      transform: { xs: "none", sm: "translate(-50%, -50%)" },
                      width: { xs: "100vw", sm: "80vw" },
                      height: { xs: "100vh", sm: "45vw" },
                      zIndex: 1301,
                      bgcolor: "black",
                    }
                  : { width: "100%", height: "100%" }
              }
            >
              <ReactPlayer
                ref={reactPlayerRef}
                url={video.url}
                playing={state.isPlaying}
                volume={volume}
                playbackRate={state.playbackRate ?? 1}
                loop={repeatVideo}
                playsinline
                width="100%"
                height={state.isVideoExpanded ? `calc(100% - ${MODAL_CONTROLS_HEIGHT}px)` : "100%"}
                style={{ pointerEvents: "none" }}
                config={{ youtube: { playerVars: { playsinline: 1 } } }}
                onReady={() => {
                  if (!hasRestoredSeek.current && initialSecondsRef.current > 0) {
                    reactPlayerRef.current?.seekTo(initialSecondsRef.current, "seconds");
                    hasRestoredSeek.current = true;
                  }
                }}
                onEnded={handleVideoEnd}
                onProgress={({ played: p, playedSeconds: ps }) => {
                  if (!isUserSeeking) {
                    setPlayed(p);
                    setPlayedSeconds(ps);
                    window.dispatchEvent(
                      new CustomEvent("playerProgress", { detail: { playedSeconds: ps } })
                    );
                    if (ps - lastDispatchedSecondsRef.current >= 5) {
                      lastDispatchedSecondsRef.current = ps;
                      dispatch({ type: "SET_PLAYED_SECONDS", payload: { playedSeconds: ps } });
                    }

                  }
                }}
              />

              {/* Modal close button */}
              {state.isVideoExpanded && (
                <Box
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "flex-end",
                    px: 1,
                    pt: 1,
                    zIndex: 1,
                  }}
                >
                  <Tooltip title="Close">
                    <IconButton onClick={() => dispatch({ type: "COLLAPSE_VIDEO" })}>
                      <Close sx={{ color: "white" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* Modal controls */}
              {state.isVideoExpanded && (
                <Box
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    px: 2,
                    pb: 1,
                    pt: 3,
                    background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                  }}
                >
                  <PlayerControls {...sharedControlsProps} />
                </Box>
              )}
            </Box>
          )}

          {/* Fullscreen backdrop */}
          {isCurrentVideo && state.isVideoExpanded && (
            <Box
              onClick={() => dispatch({ type: "COLLAPSE_VIDEO" })}
              sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,0.85)", zIndex: 1300 }}
            />
          )}

          {/* Hover overlay: play button (non-current videos) */}
          {!isCurrentVideo && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            >
              <IconButton
                onClick={handleTogglePlay}
                sx={{
                  bgcolor: "rgba(0,0,0,0.6)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
                  width: 48,
                  height: 48,
                }}
              >
                <PlayArrow sx={{ color: "white", fontSize: 28 }} />
              </IconButton>
            </Box>
          )}

          {/* Delete button — top-right */}
          <IconButton
            onClick={() => handleDeleteVideo(video.id)}
            size="small"
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.2s",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
            }}
          >
            <Cancel sx={{ fontSize: 18, color: "white" }} />
          </IconButton>

          {/* Inline controls overlay */}
          {isCurrentVideo && !state.isVideoExpanded && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                px: 1,
                pb: 0.5,
                pt: 4,
                opacity: showControls ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            >
              <PlayerControls
                {...sharedControlsProps}
                compact
                showExpand
                onExpand={() => dispatch({ type: "EXPAND_VIDEO" })}
              />
            </Box>
          )}

          {/* Expand button for non-current videos (hover) */}
          {!isCurrentVideo && (
            <IconButton
              onClick={() => {
                dispatch({ type: "SET_VIDEO", payload: { video } });
                dispatch({ type: "PLAY_VIDEO" });
                dispatch({ type: "EXPAND_VIDEO" });
              }}
              size="small"
              sx={{
                position: "absolute",
                bottom: 4,
                right: 4,
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.2s",
                bgcolor: "rgba(0,0,0,0.5)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
              }}
            >
              <Fullscreen sx={{ fontSize: 18, color: "white" }} />
            </IconButton>
          )}
        </Box>

        <VideoInfoRow
          videoId={video.id}
          title={title}
          artist={artist}
          hovered={hovered}
          currVideoInQueue={currVideoInQueue}
          onAddToQueue={handleAddToQueue}
          onShare={handleShare}
        />
      </Box>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Link copied to clipboard"
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </>
  );
}
