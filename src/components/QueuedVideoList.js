import { useState, useContext } from "react";
import {
  Typography,
  Avatar,
  Collapse,
  IconButton,
  Chip,
  Divider,
  Box,
  Tooltip,
} from "@mui/material";
import { Cancel, ExpandMore, QueueMusic, PlayArrow, VolumeUp, DeleteSweep } from "@mui/icons-material";
import { useMutation, useApolloClient } from "@apollo/client";
import { VideoContext } from "../App";

import { ADD_OR_REMOVE_VIDEO_FROM_QUEUE } from "../graphql/mutations";
import { GET_QUEUED_VIDEOS } from "../graphql/queries";

export default function QueuedVideoList({ queue }) {
  const [expanded, setExpanded] = useState(true);
  const client = useApolloClient();

  const handleClearQueue = (e) => {
    e.stopPropagation();
    client.cache.writeQuery({ query: GET_QUEUED_VIDEOS, data: { queue: [] } });
    localStorage.setItem("queue", JSON.stringify([]));
  };

  return (
    <Box sx={{ px: 2, pt: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          cursor: queue.length > 0 ? "pointer" : "default",
          userSelect: "none",
        }}
        onClick={() => queue.length > 0 && setExpanded((v) => !v)}
      >
        <QueueMusic sx={{ color: "text.secondary", fontSize: 20 }} />
        <Typography
          variant="overline"
          sx={{ letterSpacing: 1.5, color: "text.secondary", lineHeight: 1 }}
        >
          Up Next
        </Typography>
        <Chip
          label={queue.length}
          size="small"
          sx={{ ml: 0.5, height: 18, fontSize: 11, fontWeight: 600 }}
        />
        {queue.length > 0 && (
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
            <Tooltip title="Clear queue">
              <IconButton size="small" onClick={handleClearQueue} sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}>
                <DeleteSweep fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              aria-expanded={expanded}
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: (theme) =>
                  theme.transitions.create("transform", {
                    duration: theme.transitions.duration.shortest,
                  }),
              }}
            >
              <ExpandMore fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <Collapse in={expanded && queue.length > 0} timeout="auto" unmountOnExit>
        <Divider sx={{ mb: 1 }} />
        {/* Scrollable list */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            maxHeight: 420,
            overflowY: "auto",
            overflowX: "hidden",
            pr: 0.5,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            "&::-webkit-scrollbar-thumb": { bgcolor: "action.disabled", borderRadius: 2 },
          }}
        >
          {queue.map((video, i) => (
            <QueuedVideo key={i} video={video} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

function QueuedVideo({ video }) {
  const { thumbnail, artist, title, duration } = video;
  const { state, dispatch } = useContext(VideoContext);
  const isCurrentVideo = !!state.video.id && video.id === state.video.id;
  const progress = isCurrentVideo && duration > 0 ? state.playedSeconds / duration : 0;

  const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_VIDEO_FROM_QUEUE, {
    onCompleted: (data) => {
      localStorage.setItem("queue", JSON.stringify(data.addOrRemoveFromQueue));
    },
  });

  const handlePlay = () => {
    dispatch({ type: "SET_VIDEO", payload: { video } });
    dispatch({ type: "PLAY_VIDEO" });
  };

  const handleRemoveFromQueue = (e) => {
    e.stopPropagation();
    addOrRemoveFromQueue({
      variables: { input: { ...video, __typename: "Video" } },
    });
  };

  return (
    <Box
      onClick={handlePlay}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1,
        py: 0.75,
        borderRadius: 1,
        cursor: "pointer",
        bgcolor: isCurrentVideo ? "action.selected" : "transparent",
        "&:hover": { bgcolor: isCurrentVideo ? "action.selected" : "action.hover" },
        transition: "background-color 0.15s",
      }}
    >
      {/* Thumbnail with overlay + progress bar */}
      <Box sx={{ position: "relative", flexShrink: 0, width: 40, height: 40 }}>
        <Avatar
          variant="rounded"
          src={thumbnail}
          alt="video thumbnail"
          sx={{ width: 40, height: 40, borderRadius: 1 }}
        />
        {isCurrentVideo && (
          <Box
            sx={{
              position: "absolute", inset: 0, borderRadius: 1,
              bgcolor: "rgba(0,0,0,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {state.isPlaying
              ? <VolumeUp sx={{ fontSize: 18, color: "primary.main" }} />
              : <PlayArrow sx={{ fontSize: 18, color: "white" }} />}
          </Box>
        )}
        {/* Progress bar along the bottom edge of thumbnail */}
        {isCurrentVideo && (
          <Box
            sx={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: 3, borderRadius: "0 0 4px 4px", bgcolor: "rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${progress * 100}%`,
                bgcolor: "primary.main",
                transition: "width 1s linear",
              }}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Typography
          variant="body2"
          fontWeight={isCurrentVideo ? 600 : 500}
          noWrap
          color={isCurrentVideo ? "primary.main" : "text.primary"}
        >
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {artist}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={handleRemoveFromQueue}
        sx={{ color: "text.disabled", flexShrink: 0, "&:hover": { color: "error.main" } }}
      >
        <Cancel fontSize="small" />
      </IconButton>
    </Box>
  );
}
