import { Typography, IconButton, Tooltip, Box } from "@mui/material";
import { Queue, Check, Share } from "@mui/icons-material";

export default function VideoInfoRow({
  title,
  artist,
  hovered,
  currVideoInQueue,
  onAddToQueue,
  onShare,
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", pt: 1.5, px: 1.5, pb: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Tooltip title={title} placement="top">
          <Typography variant="body1" fontWeight={600} noWrap sx={{ lineHeight: 1.4 }}>
            {title}
          </Typography>
        </Tooltip>
        <Typography variant="body2" color="text.secondary" noWrap display="block">
          {artist}
        </Typography>
      </Box>

      <Tooltip title={currVideoInQueue ? "In queue" : "Add to queue"}>
        <span>
          <IconButton
            size="small"
            onClick={onAddToQueue}
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

      <Tooltip title="Copy link">
        <IconButton
          size="small"
          onClick={onShare}
          sx={{ mt: "-2px", ml: 0.5, opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}
        >
          <Share sx={{ fontSize: 16, color: "grey.400" }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
