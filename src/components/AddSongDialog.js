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

import { ADD_SONG } from "../graphql/mutations";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddSongDialog({
  url,
  setUrl,
  dialog,
  setDialog,
  song,
  setSong,
}) {
  const [addSong, { error }] = useMutation(ADD_SONG);

  const handleCloseDialog = () => {
    setDialog(false);
  };

  const handleAddSong = async () => {
    try {
      const { title, artist, thumbnail, url, duration } = song;
      await addSong({
        variables: {
          url: url.length > 0 ? url : null,
          thumbnail: thumbnail.length > 0 ? thumbnail : null,
          duration: duration > 0 ? duration : null,
          title: title.length > 0 ? title : null,
          artist: artist.length > 0 ? artist : null,
        },
      });
      handleCloseDialog();
      setSong({ duration: 0, title: "", artist: "", thumbnail: "" });
      setUrl("");
    } catch (error) {
      console.error("Error adding song", error);
    }
  };

  const handleChangeSong = (e) => {
    const { name, value } = e.target;
    setSong((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleError = (field) => {
    return error?.networkError?.extensions?.path.includes(field);
  };

  const { title, artist, thumbnail } = song;

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
          <img src={thumbnail} alt="song thumbnail" style={{ width: "100%" }} />
        )}
        <TextField
          value={artist}
          margin="dense"
          name="artist"
          label="Artist"
          fullWidth
          onChange={handleChangeSong}
          error={handleError("artist")}
          helperText={handleError("artist") && "Artist field cannot be empty"}
        />
        <TextField
          value={title}
          margin="dense"
          name="title"
          label="Title"
          fullWidth
          onChange={handleChangeSong}
          error={handleError("title")}
          helperText={handleError("title") && "Title field cannot be empty"}
        />
        <TextField
          value={thumbnail}
          margin="dense"
          name="thumbnail"
          label="Thumbnail URL"
          fullWidth
          onChange={handleChangeSong}
        />
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={handleCloseDialog}>
          Cancel
        </Button>
        <Button color="primary" variant="contained" onClick={handleAddSong}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
