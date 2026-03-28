import { useState } from "react";
import { IconButton, Tooltip, Box, TextField } from "@mui/material";
import MarqueeText from "../MarqueeText";
import { Queue, Check, Share, Edit, Save, Close } from "@mui/icons-material";
import { useMutation } from "@apollo/client";
import { UPDATE_VIDEO } from "../../graphql/mutations";

export default function VideoInfoRow({
  videoId,
  title,
  artist,
  hovered,
  currVideoInQueue,
  onAddToQueue,
  onShare,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editArtist, setEditArtist] = useState(artist);

  const [updateVideo, { loading }] = useMutation(UPDATE_VIDEO, {
    update(cache, { data }) {
      const updated = data?.update_videos?.returning?.[0];
      if (!updated) return;
      cache.modify({
        id: cache.identify({ __typename: "videos", id: updated.id }),
        fields: {
          title: () => updated.title,
          artist: () => updated.artist,
        },
      });
    },
  });

  const handleEdit = (e) => {
    e.stopPropagation();
    setEditTitle(title);
    setEditArtist(artist);
    setIsEditing(true);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    await updateVideo({ variables: { id: videoId, title: editTitle.trim(), artist: editArtist.trim() } });
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave(e);
    if (e.key === "Escape") handleCancel(e);
  };

  return (
    <Box
      sx={{ position: "relative", pt: 1.5, px: 1.5, pb: 1.5, minHeight: 96 }}
      onClick={isEditing ? (e) => e.stopPropagation() : undefined}
    >
      {isEditing ? (
        <>
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
              <TextField
                size="small"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Title"
                autoFocus
                fullWidth
                inputProps={{ style: { fontSize: 14, fontWeight: 600, paddingTop: 4, paddingBottom: 4 } }}
              />
              <TextField
                size="small"
                value={editArtist}
                onChange={(e) => setEditArtist(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Artist"
                fullWidth
                inputProps={{ style: { fontSize: 13, paddingTop: 4, paddingBottom: 4 } }}
              />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", ml: 0.5 }}>
              <Tooltip title="Save">
                <span>
                  <IconButton size="small" onClick={handleSave} disabled={loading || !editTitle.trim()}>
                    <Save sx={{ fontSize: 16, color: "primary.main" }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton size="small" onClick={handleCancel}>
                  <Close sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ minWidth: 0 }}>
            <MarqueeText typographyProps={{ variant: "body1", fontWeight: 600, sx: { lineHeight: 1.4 } }}>
              {title}
            </MarqueeText>
            <MarqueeText typographyProps={{ variant: "body2", color: "text.secondary" }}>
              {artist}
            </MarqueeText>
          </Box>

          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              right: 12,
              display: "flex",
              gap: 0.5,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.2s",
              pointerEvents: hovered ? "auto" : "none",
            }}
          >
            <Tooltip title="Edit title & artist">
              <IconButton size="small" onClick={handleEdit}>
                <Edit sx={{ fontSize: 16, color: "grey.400" }} />
              </IconButton>
            </Tooltip>

            <Tooltip title={currVideoInQueue ? "In queue" : "Add to queue"}>
              <span>
                <IconButton
                  size="small"
                  onClick={onAddToQueue}
                  disabled={currVideoInQueue}
                  sx={{ opacity: currVideoInQueue ? 1 : 0.7 }}
                >
                  {currVideoInQueue ? (
                    <Check sx={{ fontSize: 16, color: "grey.500" }} />
                  ) : (
                    <Queue sx={{ fontSize: 16, color: "grey.400" }} />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Copy link">
              <IconButton size="small" onClick={onShare}>
                <Share sx={{ fontSize: 16, color: "grey.400" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  );
}
