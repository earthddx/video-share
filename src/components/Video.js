import { useState, useEffect, useContext, useRef, Suspense } from "react";
import {
  CardMedia,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Slider,
} from "@mui/material";
import {
  PlayArrow,
  Queue,
  Cancel,
  Pause,
  Check,
  Fullscreen,
  Close,
  SkipPrevious,
  SkipNext,
  RepeatOne,
  VolumeUp,
} from "@mui/icons-material";
import { useMutation } from "@apollo/client";
import ReactPlayer from "react-player";

import { ADD_OR_REMOVE_VIDEO_FROM_QUEUE } from "../graphql/mutations";
import { VideoContext } from "../App";

export default function Video({ video, handleDeleteVideo, queue }) {
  const { artist, title, thumbnail } = video;
  const { state, dispatch } = useContext(VideoContext);

  const isCurrentVideo = !!state.video.id && video.id === state.video.id;

  const [currVideoInQueue, setCurrVideoInQueue] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [volume, setVolume] = useState(1);
  const [repeatVideo, setRepeatVideo] = useState(false);
  const [positionInQueue, setPositionInQueue] = useState(0);
  const reactPlayerRef = useRef();

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

  // Auto-advance
  useEffect(() => {
    if (!isCurrentVideo) return;
    const nextVideo = queue[positionInQueue + 1];
    if (played >= 0.99 && nextVideo && !repeatVideo) {
      setPlayed(0);
      dispatch({ type: "SET_VIDEO", payload: { video: nextVideo } });
    }
  }, [played, positionInQueue, repeatVideo, isCurrentVideo, dispatch, queue]);

  const handleTogglePlay = () => {
    if (isCurrentVideo) {
      dispatch(
        state.isPlaying ? { type: "PAUSE_VIDEO" } : { type: "PLAY_VIDEO" },
      );
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

  const formatDuration = (seconds) => {
    const mins = (video.duration || 0) / 60;
    if (mins >= 60) {
      return mins >= 600
        ? new Date(seconds * 1000).toISOString().slice(11, 19)
        : new Date(seconds * 1000).toISOString().slice(12, 19);
    }
    return new Date(seconds * 1000).toISOString().slice(14, 19);
  };

  const handleAddToQueue = () => {
    addOrRemoveFromQueue({
      variables: { input: { ...video, __typename: "Video" } },
    });
  };

  const showControls =
    isCurrentVideo && !state.isVideoExpanded && (hovered || !state.isPlaying);

  return (
    <>
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          cursor: "pointer",
          borderRadius: 2,
          overflow: "hidden",
          transition: "background-color 0.2s",
          "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
        }}
      >
        {/* 16:9 video area */}
        <Box
          sx={{
            position: "relative",
            aspectRatio: "16/9",
            width: "100%",
            bgcolor: "black",
          }}
        >
          {/* Thumbnail (non-current) */}
          {!isCurrentVideo && (
            <CardMedia
              image={thumbnail}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}

          {/* ReactPlayer — sole audio+video source */}
          {isCurrentVideo && (
            <Box
              sx={
                state.isVideoExpanded
                  ? {
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "80vw",
                      height: "45vw",
                      zIndex: 1301,
                      bgcolor: "black",
                    }
                  : {
                      width: "100%",
                      height: "100%",
                    }
              }
            >
              <Suspense fallback={null}>
                <ReactPlayer
                  ref={reactPlayerRef}
                  url={video.url}
                  playing={state.isPlaying}
                  volume={volume}
                  loop={repeatVideo}
                  width="100%"
                  height={state.isVideoExpanded ? "calc(100% - 80px)" : "100%"}
                  controls={false}
                  style={{ pointerEvents: "none" }}
                  onProgress={({ played: p, playedSeconds: ps }) => {
                    if (!isUserSeeking) {
                      setPlayed(p);
                      setPlayedSeconds(ps);
                      dispatch({
                        type: "SET_PLAYED_SECONDS",
                        payload: { playedSeconds: ps },
                      });
                    }
                  }}
                />
              </Suspense>

              {/* Modal controls */}
              {state.isVideoExpanded && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    px: 2,
                    pb: 1,
                    pt: 3,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                  }}
                >
                  {/* Progress */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "white", minWidth: 36, textAlign: "right" }}
                    >
                      {formatDuration(playedSeconds)}
                    </Typography>
                    <Slider
                      value={played}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(_, v) => setPlayed(v)}
                      onMouseDown={() => setIsUserSeeking(true)}
                      onChangeCommitted={(_, v) => {
                        setIsUserSeeking(false);
                        reactPlayerRef.current?.seekTo(v);
                      }}
                      sx={{
                        color: "white",
                        "& .MuiSlider-thumb": { width: 12, height: 12 },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "white", minWidth: 36 }}
                    >
                      {formatDuration(video.duration)}
                    </Typography>
                  </Box>

                  {/* Buttons */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      onClick={handlePlayPrev}
                      disabled={positionInQueue <= 0}
                    >
                      <SkipPrevious sx={{ color: "white" }} />
                    </IconButton>
                    <IconButton onClick={handleTogglePlay}>
                      {state.isPlaying ? (
                        <Pause sx={{ color: "white", fontSize: 32 }} />
                      ) : (
                        <PlayArrow sx={{ color: "white", fontSize: 32 }} />
                      )}
                    </IconButton>
                    <IconButton
                      onClick={handlePlayNext}
                      disabled={positionInQueue >= queue.length - 1}
                    >
                      <SkipNext sx={{ color: "white" }} />
                    </IconButton>

                    <Tooltip title="Repeat">
                      <IconButton onClick={() => setRepeatVideo(!repeatVideo)}>
                        <RepeatOne
                          sx={{ color: repeatVideo ? "primary.main" : "white" }}
                        />
                      </IconButton>
                    </Tooltip>

                    <Box sx={{ flex: 1 }} />

                    <VolumeUp sx={{ color: "white", mr: 1 }} />
                    <Slider
                      value={volume}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(_, v) => setVolume(v)}
                      sx={{
                        width: 80,
                        color: "white",
                        "& .MuiSlider-thumb": { width: 12, height: 12 },
                      }}
                    />

                    <Tooltip title="Close">
                      <IconButton
                        onClick={() => dispatch({ type: "COLLAPSE_VIDEO" })}
                        sx={{ ml: 1 }}
                      >
                        <Close sx={{ color: "white" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Fullscreen backdrop */}
          {isCurrentVideo && state.isVideoExpanded && (
            <Box
              onClick={() => dispatch({ type: "COLLAPSE_VIDEO" })}
              sx={{
                position: "fixed",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.85)",
                zIndex: 1300,
              }}
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

          {/* Player controls overlay — bottom of video, current video only */}
          {isCurrentVideo && !state.isVideoExpanded && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                px: 1,
                pb: 0.5,
                pt: 4,
                opacity: showControls ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            >
              {/* Progress */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "white",
                    fontSize: 10,
                    minWidth: 30,
                    textAlign: "right",
                  }}
                >
                  {formatDuration(playedSeconds)}
                </Typography>
                <Slider
                  value={played}
                  min={0}
                  max={1}
                  step={0.01}
                  size="small"
                  onChange={(_, v) => setPlayed(v)}
                  onMouseDown={() => setIsUserSeeking(true)}
                  onChangeCommitted={(_, v) => {
                    setIsUserSeeking(false);
                    reactPlayerRef.current?.seekTo(v);
                  }}
                  sx={{
                    color: "white",
                    "& .MuiSlider-thumb": { width: 10, height: 10 },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "white", fontSize: 10, minWidth: 30 }}
                >
                  {formatDuration(video.duration)}
                </Typography>
              </Box>

              {/* Buttons */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  size="small"
                  onClick={handlePlayPrev}
                  disabled={positionInQueue <= 0}
                >
                  <SkipPrevious sx={{ color: "white", fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" onClick={handleTogglePlay}>
                  {state.isPlaying ? (
                    <Pause sx={{ color: "white", fontSize: 18 }} />
                  ) : (
                    <PlayArrow sx={{ color: "white", fontSize: 18 }} />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handlePlayNext}
                  disabled={positionInQueue >= queue.length - 1}
                >
                  <SkipNext sx={{ color: "white", fontSize: 18 }} />
                </IconButton>

                <Box sx={{ flex: 1 }} />

                <VolumeUp sx={{ fontSize: 14, color: "white", mr: 0.5 }} />
                <Slider
                  value={volume}
                  min={0}
                  max={1}
                  step={0.01}
                  size="small"
                  onChange={(_, v) => setVolume(v)}
                  sx={{
                    width: 56,
                    color: "white",
                    "& .MuiSlider-thumb": { width: 10, height: 10 },
                  }}
                />

                <Tooltip title="Repeat">
                  <IconButton
                    size="small"
                    onClick={() => setRepeatVideo(!repeatVideo)}
                    sx={{ ml: 0.5 }}
                  >
                    <RepeatOne
                      sx={{
                        fontSize: 16,
                        color: repeatVideo ? "primary.main" : "white",
                      }}
                    />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Expand">
                  <IconButton
                    size="small"
                    onClick={() => dispatch({ type: "EXPAND_VIDEO" })}
                    sx={{ ml: 0.5 }}
                  >
                    <Fullscreen sx={{ fontSize: 16, color: "white" }} />
                  </IconButton>
                </Tooltip>
              </Box>
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

        {/* Info row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            pt: 1.5,
            px: 1.5,
            pb: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Tooltip title={title} placement="top">
              <Typography
                variant="body1"
                fontWeight={600}
                noWrap
                sx={{ lineHeight: 1.4 }}
              >
                {title}
              </Typography>
            </Tooltip>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              display="block"
            >
              {artist}
            </Typography>
          </Box>
          <Tooltip title={currVideoInQueue ? "In queue" : "Add to queue"}>
            <span>
              <IconButton
                size="small"
                onClick={handleAddToQueue}
                disabled={currVideoInQueue}
                sx={{
                  mt: "-2px",
                  ml: 0.5,
                  opacity: hovered || currVideoInQueue ? 1 : 0,
                  transition: "opacity 0.2s",
                }}
              >
                {currVideoInQueue ? (
                  <Check sx={{ fontSize: 16, color: "grey.500" }} />
                ) : (
                  <Queue sx={{ fontSize: 16, color: "grey.400" }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
}
