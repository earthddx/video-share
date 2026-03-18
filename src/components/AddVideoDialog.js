import React from "react";
import {
  TextField,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Slide,
} from "@mui/material";
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
      sx={{ textAlign: "center", backdropFilter: "blur(5px)" }}
    >
      <DialogContent>
        {thumbnail && (
          <img
            src={thumbnail}
            alt="video thumbnail"
            style={{ width: "100%" }}
          />
        )}
        <TextField
          value={artist}
          margin="dense"
          name="artist"
          label="Artist"
          fullWidth
          onChange={handleChangeVideo}
          error={handleError("artist")}
          helperText={handleError("artist") && "Artist field cannot be empty"}
        />
        <TextField
          value={title}
          margin="dense"
          name="title"
          label="Title"
          fullWidth
          onChange={handleChangeVideo}
          error={handleError("title")}
          helperText={handleError("title") && "Title field cannot be empty"}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleCloseDialog}>
          Cancel
        </Button>
        <Button color="primary" variant="contained" onClick={handleAddVideo}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
