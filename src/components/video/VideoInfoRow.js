import { useState } from "react";
import { IconButton, Tooltip, Box, TextField, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import MarqueeText from "../MarqueeText";
import { Queue, Check, Share, Edit, Save, Close, DeleteOutline, MoreVert } from "@mui/icons-material";
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
  onDelete,
  compact = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editArtist, setEditArtist] = useState(artist);
  const [menuAnchor, setMenuAnchor] = useState(null);

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
      sx={{ pt: compact ? 0.5 : 1.5, px: 1.5, pb: compact ? 0.5 : 1.5, flex: compact ? 1 : undefined, minWidth: 0 }}
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
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <MarqueeText typographyProps={{ variant: "body1", fontWeight: 600, sx: { lineHeight: 1.4 } }}>
                {title}
              </MarqueeText>
              <MarqueeText typographyProps={{ variant: "body2", color: "text.secondary" }}>
                {artist}
              </MarqueeText>
            </Box>

            <Box
              sx={{
                ml: 0.5,
                flexShrink: 0,
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.2s",
                pointerEvents: hovered ? "auto" : "none",
              }}
            >
              <Tooltip title="More options">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}>
                  <MoreVert sx={{ fontSize: 18, color: "grey.400" }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              disableScrollLock
              onClose={(e) => { e?.stopPropagation?.(); setMenuAnchor(null); }}
              onClick={(e) => e.stopPropagation()}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={(e) => { setMenuAnchor(null); handleEdit(e); }}>
                <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                <ListItemText>Edit title &amp; artist</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); onAddToQueue(e); }}
                disabled={currVideoInQueue}
              >
                <ListItemIcon>
                  {currVideoInQueue ? <Check fontSize="small" /> : <Queue fontSize="small" />}
                </ListItemIcon>
                <ListItemText>{currVideoInQueue ? "In queue" : "Add to queue"}</ListItemText>
              </MenuItem>
              <MenuItem onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); onShare(e); }}>
                <ListItemIcon><Share fontSize="small" /></ListItemIcon>
                <ListItemText>Copy link</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); onDelete(); }} sx={{ color: "error.main" }}>
                <ListItemIcon><DeleteOutline fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
        </>
      )}
    </Box>
  );
}
