import { useState, useEffect, useContext, useRef, Suspense } from "react";
import { CardMedia, Typography, IconButton, Tooltip, Box, Slider } from "@mui/material";
import {
  PlayArrow, Queue, Cancel, Pause, Check, Fullscreen, Close,
  SkipPrevious, SkipNext, RepeatOne, VolumeUp,
} from "@mui/icons-material";
import { useMutation } from "@apollo/client";
import ReactPlayer from "react-player";

import { ADD_OR_REMOVE_SONG_FROM_QUEUE } from "../graphql/mutations";
import { SongContext } from "../App";

export default function Song({ song, handleDeleteSong, queue }) {
  const { artist, title, thumbnail } = song;
  const { state, dispatch } = useContext(SongContext);

  const isCurrentSong = !!state.song.id && song.id === state.song.id;

  const [currSongInQueue, setCurrSongInQueue] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [volume, setVolume] = useState(1);
  const [repeatSong, setRepeatSong] = useState(false);
  const [positionInQueue, setPositionInQueue] = useState(0);
  const reactPlayerRef = useRef();

  const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_SONG_FROM_QUEUE, {
    onCompleted: (data) => {
      localStorage.setItem("queue", JSON.stringify(data.addOrRemoveFromQueue));
    },
  });

  useEffect(() => {
    setCurrSongInQueue(queue.some((item) => item.id === song.id));
  }, [song.id, queue]);

  useEffect(() => {
    setPositionInQueue(queue.findIndex((s) => s.id === song.id));
  }, [song.id, queue]);

  // Auto-advance
  useEffect(() => {
    if (!isCurrentSong) return;
    const nextSong = queue[positionInQueue + 1];
    if (played >= 0.99 && nextSong && !repeatSong) {
      setPlayed(0);
      dispatch({ type: "SET_SONG", payload: { song: nextSong } });
    }
  }, [played, positionInQueue, repeatSong, isCurrentSong, dispatch, queue]);

  const handleTogglePlay = () => {
    if (isCurrentSong) {
      dispatch(state.isPlaying ? { type: "PAUSE_SONG" } : { type: "PLAY_SONG" });
    } else {
      dispatch({ type: "SET_SONG", payload: { song } });
      dispatch({ type: "PLAY_SONG" });
    }
  };

  const handlePlayPrev = () => {
    const prev = queue[positionInQueue - 1];
    if (prev) dispatch({ type: "SET_SONG", payload: { song: prev } });
  };

  const handlePlayNext = () => {
    const next = queue[positionInQueue + 1];
    if (next) dispatch({ type: "SET_SONG", payload: { song: next } });
  };

  const formatDuration = (seconds) => {
    const mins = (song.duration || 0) / 60;
    if (mins >= 60) {
      return mins >= 600
        ? new Date(seconds * 1000).toISOString().slice(11, 19)
        : new Date(seconds * 1000).toISOString().slice(12, 19);
    }
    return new Date(seconds * 1000).toISOString().slice(14, 19);
  };

  const handleAddToQueue = () => {
    addOrRemoveFromQueue({ variables: { input: { ...song, __typename: "Song" } } });
  };

  const showControls = isCurrentSong && !state.isVideoExpanded && (hovered || !state.isPlaying);

  return (
    <>
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          cursor: "pointer",
          borderRadius: 1,
          overflow: "hidden",
          transition: "background-color 0.2s",
          "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
        }}
      >
        {/* 16:9 video area */}
        <Box sx={{ position: "relative", aspectRatio: "16/9", width: "100%", bgcolor: "black" }}>

          {/* Thumbnail (non-current) */}
          {!isCurrentSong && (
            <CardMedia image={thumbnail} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}

          {/* ReactPlayer — sole audio+video source */}
          {isCurrentSong && (
            <Box
              sx={state.isVideoExpanded ? {
                position: "fixed",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80vw", height: "45vw",
                zIndex: 1301,
                bgcolor: "black",
              } : {
                width: "100%", height: "100%",
              }}
            >
              <Suspense fallback={null}>
                <ReactPlayer
                  ref={reactPlayerRef}
                  url={song.url}
                  playing={state.isPlaying}
                  volume={volume}
                  loop={repeatSong}
                  width="100%"
                  height={state.isVideoExpanded ? "calc(100% - 80px)" : "100%"}
                  controls={false}
                  style={{ pointerEvents: "none" }}
                  onProgress={({ played: p, playedSeconds: ps }) => {
                    if (!isUserSeeking) {
                      setPlayed(p);
                      setPlayedSeconds(ps);
                      dispatch({ type: "SET_PLAYED_SECONDS", payload: { playedSeconds: ps } });
                    }
                  }}
                />
              </Suspense>

              {/* Modal controls */}
              {state.isVideoExpanded && (
                <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, px: 2, pb: 1, pt: 3,
                  background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)" }}>
                  {/* Progress */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" sx={{ color: "white", minWidth: 36, textAlign: "right" }}>
                      {formatDuration(playedSeconds)}
                    </Typography>
                    <Slider
                      value={played} min={0} max={1} step={0.01}
                      onChange={(_, v) => setPlayed(v)}
                      onMouseDown={() => setIsUserSeeking(true)}
                      onChangeCommitted={(_, v) => { setIsUserSeeking(false); reactPlayerRef.current?.seekTo(v); }}
                      sx={{ color: "white", "& .MuiSlider-thumb": { width: 12, height: 12 } }}
                    />
                    <Typography variant="caption" sx={{ color: "white", minWidth: 36 }}>
                      {formatDuration(song.duration)}
                    </Typography>
                  </Box>

                  {/* Buttons */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={handlePlayPrev} disabled={positionInQueue <= 0}>
                      <SkipPrevious sx={{ color: "white" }} />
                    </IconButton>
                    <IconButton onClick={handleTogglePlay}>
                      {state.isPlaying
                        ? <Pause sx={{ color: "white", fontSize: 32 }} />
                        : <PlayArrow sx={{ color: "white", fontSize: 32 }} />}
                    </IconButton>
                    <IconButton onClick={handlePlayNext} disabled={positionInQueue >= queue.length - 1}>
                      <SkipNext sx={{ color: "white" }} />
                    </IconButton>

                    <Tooltip title="Repeat">
                      <IconButton onClick={() => setRepeatSong(!repeatSong)}>
                        <RepeatOne sx={{ color: repeatSong ? "primary.main" : "white" }} />
                      </IconButton>
                    </Tooltip>

                    <Box sx={{ flex: 1 }} />

                    <VolumeUp sx={{ color: "white", mr: 1 }} />
                    <Slider
                      value={volume} min={0} max={1} step={0.01}
                      onChange={(_, v) => setVolume(v)}
                      sx={{ width: 80, color: "white", "& .MuiSlider-thumb": { width: 12, height: 12 } }}
                    />

                    <Tooltip title="Close">
                      <IconButton onClick={() => dispatch({ type: "COLLAPSE_VIDEO" })} sx={{ ml: 1 }}>
                        <Close sx={{ color: "white" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Fullscreen backdrop */}
          {isCurrentSong && state.isVideoExpanded && (
            <Box
              onClick={() => dispatch({ type: "COLLAPSE_VIDEO" })}
              sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,0.85)", zIndex: 1300 }}
            />
          )}

          {/* Hover overlay: play button (non-current songs) */}
          {!isCurrentSong && (
            <Box
              sx={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            >
              <IconButton
                onClick={handleTogglePlay}
                sx={{ bgcolor: "rgba(0,0,0,0.6)", "&:hover": { bgcolor: "rgba(0,0,0,0.85)" }, width: 48, height: 48 }}
              >
                <PlayArrow sx={{ color: "white", fontSize: 28 }} />
              </IconButton>
            </Box>
          )}

          {/* Delete button — top-right */}
          <IconButton
            onClick={() => handleDeleteSong(song.id)}
            size="small"
            sx={{
              position: "absolute", top: 4, right: 4,
              opacity: hovered ? 1 : 0, transition: "opacity 0.2s",
              bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
            }}
          >
            <Cancel sx={{ fontSize: 18, color: "white" }} />
          </IconButton>

          {/* Player controls overlay — bottom of video, current song only */}
          {isCurrentSong && !state.isVideoExpanded && (
            <Box
              sx={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                px: 1, pb: 0.5, pt: 4,
                opacity: showControls ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            >
              {/* Progress */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: "white", fontSize: 10, minWidth: 30, textAlign: "right" }}>
                  {formatDuration(playedSeconds)}
                </Typography>
                <Slider
                  value={played} min={0} max={1} step={0.01} size="small"
                  onChange={(_, v) => setPlayed(v)}
                  onMouseDown={() => setIsUserSeeking(true)}
                  onChangeCommitted={(_, v) => { setIsUserSeeking(false); reactPlayerRef.current?.seekTo(v); }}
                  sx={{ color: "white", "& .MuiSlider-thumb": { width: 10, height: 10 } }}
                />
                <Typography variant="caption" sx={{ color: "white", fontSize: 10, minWidth: 30 }}>
                  {formatDuration(song.duration)}
                </Typography>
              </Box>

              {/* Buttons */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton size="small" onClick={handlePlayPrev} disabled={positionInQueue <= 0}>
                  <SkipPrevious sx={{ color: "white", fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" onClick={handleTogglePlay}>
                  {state.isPlaying
                    ? <Pause sx={{ color: "white", fontSize: 18 }} />
                    : <PlayArrow sx={{ color: "white", fontSize: 18 }} />}
                </IconButton>
                <IconButton size="small" onClick={handlePlayNext} disabled={positionInQueue >= queue.length - 1}>
                  <SkipNext sx={{ color: "white", fontSize: 18 }} />
                </IconButton>

                <Box sx={{ flex: 1 }} />

                <VolumeUp sx={{ fontSize: 14, color: "white", mr: 0.5 }} />
                <Slider
                  value={volume} min={0} max={1} step={0.01} size="small"
                  onChange={(_, v) => setVolume(v)}
                  sx={{ width: 56, color: "white", "& .MuiSlider-thumb": { width: 10, height: 10 } }}
                />

                <Tooltip title="Repeat">
                  <IconButton size="small" onClick={() => setRepeatSong(!repeatSong)} sx={{ ml: 0.5 }}>
                    <RepeatOne sx={{ fontSize: 16, color: repeatSong ? "primary.main" : "white" }} />
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

          {/* Expand button for non-current songs (hover) */}
          {!isCurrentSong && (
            <IconButton
              onClick={() => {
                dispatch({ type: "SET_SONG", payload: { song } });
                dispatch({ type: "PLAY_SONG" });
                dispatch({ type: "EXPAND_VIDEO" });
              }}
              size="small"
              sx={{
                position: "absolute", bottom: 4, right: 4,
                opacity: hovered ? 1 : 0, transition: "opacity 0.2s",
                bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
              }}
            >
              <Fullscreen sx={{ fontSize: 18, color: "white" }} />
            </IconButton>
          )}
        </Box>

        {/* Info row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", pt: 1, px: 0.5, pb: 0.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Tooltip title={title} placement="top">
              <Typography variant="body2" fontWeight={600} noWrap sx={{ lineHeight: 1.3 }}>
                {title}
              </Typography>
            </Tooltip>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {artist}
            </Typography>
          </Box>
          <Tooltip title={currSongInQueue ? "In queue" : "Add to queue"}>
            <span>
              <IconButton
                size="small"
                onClick={handleAddToQueue}
                disabled={currSongInQueue}
                sx={{ mt: "-2px", ml: 0.5, opacity: hovered || currSongInQueue ? 1 : 0, transition: "opacity 0.2s" }}
              >
                {currSongInQueue
                  ? <Check sx={{ fontSize: 16, color: "grey.500" }} />
                  : <Queue sx={{ fontSize: 16, color: "grey.400" }} />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
}
