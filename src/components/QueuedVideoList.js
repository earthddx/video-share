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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Cancel, ExpandMore, QueueMusic, PlayArrow, VolumeUp, DeleteSweep, DragIndicator, Shuffle } from "@mui/icons-material";
import { useMutation, useApolloClient } from "@apollo/client";
import { VideoContext } from "../App";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ADD_OR_REMOVE_VIDEO_FROM_QUEUE } from "../graphql/mutations";
import { GET_QUEUED_VIDEOS } from "../graphql/queries";

export default function QueuedVideoList({ queue }) {
  const [expanded, setExpanded] = useState(true);
  const [originalQueue, setOriginalQueue] = useState(null);
  const isMobile = useMediaQuery(useTheme().breakpoints.down("sm"));
  const client = useApolloClient();

  const isShuffled = originalQueue !== null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleClearQueue = (e) => {
    e.stopPropagation();
    setOriginalQueue(null);
    client.cache.writeQuery({ query: GET_QUEUED_VIDEOS, data: { queue: [] } });
    localStorage.setItem("queue", JSON.stringify([]));
  };

  const handleShuffle = (e) => {
    e.stopPropagation();
    if (isShuffled) {
      client.cache.writeQuery({ query: GET_QUEUED_VIDEOS, data: { queue: originalQueue } });
      localStorage.setItem("queue", JSON.stringify(originalQueue));
      setOriginalQueue(null);
    } else {
      setOriginalQueue([...queue]);
      const shuffled = [...queue];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      client.cache.writeQuery({ query: GET_QUEUED_VIDEOS, data: { queue: shuffled } });
      localStorage.setItem("queue", JSON.stringify(shuffled));
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = queue.findIndex((v) => v.id === active.id);
    const newIndex = queue.findIndex((v) => v.id === over.id);
    const reordered = arrayMove(queue, oldIndex, newIndex);
    client.cache.writeQuery({ query: GET_QUEUED_VIDEOS, data: { queue: reordered } });
    localStorage.setItem("queue", JSON.stringify(reordered));
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
          cursor: !isMobile && queue.length > 0 ? "pointer" : "default",
          userSelect: "none",
        }}
        onClick={() => !isMobile && queue.length > 0 && setExpanded((v) => !v)}
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
            <Tooltip title={isShuffled ? "Unshuffle" : "Shuffle"}>
              <IconButton size="small" onClick={handleShuffle} sx={{ color: isShuffled ? "primary.main" : "text.disabled", "&:hover": { color: isShuffled ? "primary.dark" : "text.primary" } }}>
                <Shuffle fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear queue">
              <IconButton size="small" onClick={handleClearQueue} sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}>
                <DeleteSweep fontSize="small" />
              </IconButton>
            </Tooltip>
            {!isMobile && (
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
            )}
          </Box>
        )}
      </Box>

      <Collapse in={(isMobile || expanded) && queue.length > 0} timeout="auto" unmountOnExit>
        <Divider sx={{ mb: 1 }} />
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={queue.map((v) => v.id)} strategy={verticalListSortingStrategy}>
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
              {queue.map((video) => (
                <QueuedVideo key={video.id} video={video} />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      </Collapse>
    </Box>
  );
}

function QueuedVideo({ video }) {
  const { thumbnail, artist, title, duration } = video;
  const { state, dispatch } = useContext(VideoContext);
  const isCurrentVideo = !!state.video.id && video.id === state.video.id;
  const progress = isCurrentVideo && duration > 0 ? state.playedSeconds / duration : 0;
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
        "&:hover": { bgcolor: isCurrentVideo ? "action.selected" : "action.hover" },
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
