import React from "react";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import { Close, MusicVideo } from "@mui/icons-material";
import { useMutation } from "@apollo/client";

import { ADD_VIDEO } from "../graphql/mutations";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddVideoDialog({
  url,
  setUrl,
  dialog,
  setDialog,
  video,
  setVideo,
}) {
  const [addVideo, { error }] = useMutation(ADD_VIDEO);

  const handleCloseDialog = () => {
    setDialog(false);
  };

  const handleAddVideo = async () => {
    try {
      const { title, artist, thumbnail, duration } = video;
      await addVideo({
        variables: {
          url: url || "",
          thumbnail: thumbnail || "",
          duration: duration || 0,
          title: title || "",
          artist: artist || "",
        },
      });
      handleCloseDialog();
      setVideo({ duration: 0, title: "", artist: "", thumbnail: "" });
      setUrl("");
    } catch (error) {
      console.error("Error adding video", error);
    }
  };

  const handleChangeVideo = (e) => {
    const { name, value } = e.target;
    setVideo((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleError = (field) => {
    return error?.networkError?.extensions?.path.includes(field);
  };

  const { title, artist, thumbnail } = video;

  return (
    <Dialog
      open={dialog}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleCloseDialog}
      fullWidth
      maxWidth="sm"
      sx={{ backdropFilter: "blur(6px)" }}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>Add to library</Typography>
        <IconButton size="small" onClick={handleCloseDialog} sx={{ color: "text.secondary" }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5, pb: 1 }}>
        {/* Thumbnail */}
        <Box
          sx={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "action.hover",
            mb: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt="video thumbnail"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <MusicVideo sx={{ fontSize: 48, color: "text.disabled" }} />
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <TextField
            value={title}
            name="title"
            label="Title"
            fullWidth
            size="small"
            variant="outlined"
            onChange={handleChangeVideo}
            error={handleError("title")}
            helperText={handleError("title") && "Title cannot be empty"}
          />
          <TextField
            value={artist}
            name="artist"
            label="Artist"
            fullWidth
            size="small"
            variant="outlined"
            onChange={handleChangeVideo}
            error={handleError("artist")}
            helperText={handleError("artist") && "Artist cannot be empty"}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button fullWidth variant="outlined" color="inherit" onClick={handleCloseDialog}>
          Cancel
        </Button>
        <Button fullWidth variant="contained" color="primary" onClick={handleAddVideo}>
          Add video
        </Button>
      </DialogActions>
    </Dialog>
  );
}
