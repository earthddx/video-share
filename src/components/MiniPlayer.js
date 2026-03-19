import { useContext } from "react";
import { Box, IconButton, Typography, Avatar, Slider, Tooltip } from "@mui/material";
import { PlayArrow, Pause, SkipPrevious, SkipNext, VolumeUp, VolumeOff } from "@mui/icons-material";
import { VideoContext } from "../App";

function formatDuration(seconds, totalDuration) {
  const ref = totalDuration || 0;
  const mins = ref / 60;
  if (mins >= 600) return new Date(seconds * 1000).toISOString().slice(11, 19);
  if (mins >= 60)  return new Date(seconds * 1000).toISOString().slice(12, 19);
  return new Date(seconds * 1000).toISOString().slice(14, 19);
}

export default function MiniPlayer({ queue }) {
  const { state, dispatch } = useContext(VideoContext);
  const { video, isPlaying, playedSeconds, isVideoExpanded, volume = 1 } = state;

  if (!video.id || isVideoExpanded) return null;

  const played = video.duration > 0 ? playedSeconds / video.duration : 0;
  const positionInQueue = queue.findIndex((v) => v.id === video.id);
  const hasPrev = positionInQueue > 0;
  const hasNext = positionInQueue >= 0 && positionInQueue < queue.length - 1;

  const handlePrev = () => {
    const prev = queue[positionInQueue - 1];
    if (prev) dispatch({ type: "SET_VIDEO", payload: { video: prev } });
  };

  const handleNext = () => {
    const next = queue[positionInQueue + 1];
    if (next) dispatch({ type: "SET_VIDEO", payload: { video: next } });
  };

  const handleSeek = (_, v) => {
    dispatch({ type: "SEEK_TO", payload: { fraction: v } });
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        width: { xs: "calc(100% - 32px)", sm: 580, md: 660 },
        zIndex: 1350,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 8,
        overflow: "hidden",
      }}
    >
      {/* Info + controls row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1.5,
          pt: 1,
          pb: 0.5,
        }}
      >
        <Avatar
          variant="rounded"
          src={video.thumbnail}
          alt={video.title}
          sx={{ width: 38, height: 38, flexShrink: 0 }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {video.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {video.artist}
          </Typography>
        </Box>

        <Tooltip title="Previous">
          <span>
            <IconButton size="small" onClick={handlePrev} disabled={!hasPrev}>
              <SkipPrevious />
            </IconButton>
          </span>
        </Tooltip>

        <IconButton
          onClick={() =>
            dispatch(isPlaying ? { type: "PAUSE_VIDEO" } : { type: "PLAY_VIDEO" })
          }
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>

        <Tooltip title="Next">
          <span>
            <IconButton size="small" onClick={handleNext} disabled={!hasNext}>
              <SkipNext />
            </IconButton>
          </span>
        </Tooltip>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => dispatch({ type: "SET_VOLUME", payload: { volume: volume > 0 ? 0 : 1 } })}
          >
            {volume === 0 ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
          </IconButton>
          <Slider
            value={volume}
            min={0}
            max={1}
            step={0.01}
            size="small"
            onChange={(_, v) => dispatch({ type: "SET_VOLUME", payload: { volume: v } })}
            sx={{ width: 72, "& .MuiSlider-thumb": { width: 10, height: 10 } }}
          />
        </Box>
      </Box>

      {/* Progress row with times */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, pb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 34, textAlign: "right", flexShrink: 0 }}>
          {formatDuration(playedSeconds, video.duration)}
        </Typography>

        <Slider
          value={played}
          min={0}
          max={1}
          step={0.001}
          size="small"
          onChange={handleSeek}
          sx={{
            flex: 1,
            "& .MuiSlider-thumb": {
              width: 10,
              height: 10,
              opacity: 0,
              transition: "opacity 0.15s",
              "&:hover, &.Mui-active": { opacity: 1 },
            },
          }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 34, flexShrink: 0 }}>
          {formatDuration(video.duration, video.duration)}
        </Typography>
      </Box>
    </Box>
  );
}
