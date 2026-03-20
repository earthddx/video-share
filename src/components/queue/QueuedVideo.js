import { useState, useContext } from "react";
import {
  Typography,
  Avatar,
  IconButton,
  Box,
} from "@mui/material";
import {
  Cancel,
  PlayArrow,
  VolumeUp,
  DragIndicator,
} from "@mui/icons-material";
import { useMutation } from "@apollo/client";
import {useSortable} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ADD_OR_REMOVE_VIDEO_FROM_QUEUE } from "../../graphql/mutations";
import { VideoContext } from "../../store/VideoContext";


export default function QueuedVideo({ video }) {
  const { thumbnail, artist, title, duration } = video;
  const { state, dispatch } = useContext(VideoContext);
  const isCurrentVideo = !!state.video.id && video.id === state.video.id;
  const progress =
    isCurrentVideo && duration > 0 ? state.playedSeconds / duration : 0;
  const [hovered, setHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

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
      ref={setNodeRef}
      onClick={handlePlay}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1,
        py: 0.75,
        borderRadius: 1,
        cursor: "pointer",
        bgcolor: isCurrentVideo ? "action.selected" : "transparent",
        "&:hover": {
          bgcolor: isCurrentVideo ? "action.selected" : "action.hover",
        },
        transition: isDragging ? "none" : "background-color 0.15s",
        transform: CSS.Transform.toString(transform),
        ...(transition && { transition }),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : "auto",
      }}
    >
      {/* Drag handle */}
      <Box
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "grab",
          color: "text.disabled",
          flexShrink: 0,
          "&:hover": { color: "text.secondary" },
          "&:active": { cursor: "grabbing" },
        }}
      >
        <DragIndicator sx={{ fontSize: 16 }} />
      </Box>

      {/* Thumbnail with overlay + progress bar */}
      <Box sx={{ position: "relative", flexShrink: 0, width: 40, height: 40 }}>
        <Avatar
          variant="rounded"
          src={thumbnail}
          alt="video thumbnail"
          slotProps={{ img: { loading: "lazy" } }}
          sx={{ width: 40, height: 40, borderRadius: 1 }}
        />
        {isCurrentVideo && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: 1,
              bgcolor: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {state.isPlaying ? (
              <VolumeUp sx={{ fontSize: 18, color: "primary.main" }} />
            ) : (
              <PlayArrow sx={{ fontSize: 18, color: "white" }} />
            )}
          </Box>
        )}
        {/* Progress bar along the bottom edge of thumbnail */}
        {isCurrentVideo && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              borderRadius: "0 0 4px 4px",
              bgcolor: "rgba(0,0,0,0.4)",
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
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          display="block"
        >
          {artist}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={handleRemoveFromQueue}
        sx={{
          color: "text.disabled",
          flexShrink: 0,
          opacity: { xs: 1, sm: hovered ? 1 : 0 },
          "&:hover": { color: "error.main" },
          transition: "opacity 0.15s",
        }}
      >
        <Cancel fontSize="small" />
      </IconButton>
    </Box>
  );
}
