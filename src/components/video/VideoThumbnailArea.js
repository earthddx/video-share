import { Box, CardMedia, IconButton } from "@mui/material";
import { PlayArrow, Fullscreen } from "@mui/icons-material";

export default function VideoThumbnailArea({ thumbnail, hovered, onPlay, onExpand }) {
  return (
    <>
      <CardMedia
        component="img"
        src={thumbnail}
        loading="lazy"
        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Hover play overlay */}
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
          onClick={onPlay}
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

      {/* Expand button */}
      <IconButton
        onClick={onExpand}
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
    </>
  );
}
