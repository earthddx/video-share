import { useState } from "react";
import {
  Typography,
  Collapse,
  IconButton,
  Chip,
  Divider,
  Box,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ExpandMore,
  QueueMusic,
  DeleteSweep,
  Shuffle,
} from "@mui/icons-material";
import { useApolloClient } from "@apollo/client";
import QueuedVideo from "./QueuedVideo";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { GET_QUEUED_VIDEOS } from "../../graphql/queries";


export default function QueuedVideoList({ queue }) {
  const [expanded, setExpanded] = useState(true);
  const [originalQueue, setOriginalQueue] = useState(null);
  const isMobile = useMediaQuery(useTheme().breakpoints.down("sm"));
  const client = useApolloClient();

  const isShuffled = originalQueue !== null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
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
      client.cache.writeQuery({
        query: GET_QUEUED_VIDEOS,
        data: { queue: originalQueue },
      });
      localStorage.setItem("queue", JSON.stringify(originalQueue));
      setOriginalQueue(null);
    } else {
      setOriginalQueue([...queue]);
      const shuffled = [...queue];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      client.cache.writeQuery({
        query: GET_QUEUED_VIDEOS,
        data: { queue: shuffled },
      });
      localStorage.setItem("queue", JSON.stringify(shuffled));
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = queue.findIndex((v) => v.id === active.id);
    const newIndex = queue.findIndex((v) => v.id === over.id);
    const reordered = arrayMove(queue, oldIndex, newIndex);
    client.cache.writeQuery({
      query: GET_QUEUED_VIDEOS,
      data: { queue: reordered },
    });
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
              <IconButton
                size="small"
                onClick={handleShuffle}
                sx={{
                  color: isShuffled ? "primary.main" : "text.disabled",
                  "&:hover": {
                    color: isShuffled ? "primary.dark" : "text.primary",
                  },
                }}
              >
                <Shuffle fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear queue">
              <IconButton
                size="small"
                onClick={handleClearQueue}
                sx={{
                  color: "text.disabled",
                  "&:hover": { color: "error.main" },
                }}
              >
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

      <Collapse
        in={(isMobile || expanded) && queue.length > 0}
        timeout="auto"
        unmountOnExit
      >
        <Divider sx={{ mb: 1 }} />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={queue.map((v) => v.id)}
            strategy={verticalListSortingStrategy}
          >
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
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "action.disabled",
                  borderRadius: 2,
                },
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
