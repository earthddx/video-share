import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { TextField, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import ReactPlayer from "react-player";

import AddSongDialog from "./AddSongDialog";

=======
import { TextField, Button, makeStyles } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ReactPlayer from "react-player/youtube";

import AddSongDialog from "./AddSongDialog";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  urlInput: {
    margin: theme.spacing(2),
  },
  textInput: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightLight,
  },
  addSongButton: {
    margin: theme.spacing(0),
  },
  dialog: {
    textAlign: "center",
    backdropFilter: "blur(5px)",
  },
  thumbnail: {
    width: "100%",
  },
}));

>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
export default function AddSong() {
  const [dialog, setDialog] = useState(false);
  const [url, setUrl] = useState("");
  const [playable, setPlayable] = useState(false);
  const [song, setSong] = useState({
    duration: 0,
    title: "",
    artist: "",
    thumbnail: "",
  });
<<<<<<< HEAD
=======
  const classes = useStyles();
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994

  useEffect(() => {
    const isPlayable = ReactPlayer.canPlay(url);
    setPlayable(isPlayable);
  }, [url]);

  const handleEditSong = ({ player }) => {
<<<<<<< HEAD
    try {
      const nestedPlayer = player.player.player;
      if (typeof nestedPlayer.getDuration === "function") {
        const duration = nestedPlayer.getDuration();
        const { title, video_id, author } = nestedPlayer.getVideoData();
        const thumbnail = `https://img.youtube.com/vi/${video_id}/0.jpg`;
        setSong({ duration, title, artist: author, thumbnail, url });
        return;
      }
    } catch (_) {}
    setSong((prev) => ({ ...prev, url }));
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
=======
    const nestedPlayer = player.player.player;
    let songData;
    songData = getYouTubeInfo(nestedPlayer);
    setSong({
      ...songData,
      url,
    });
  };

  const getYouTubeInfo = (player) => {
    const duration = player.getDuration();
    const { title, video_id, author } = player.getVideoData();
    const thumbnail = `https://img.youtube.com/vi/${video_id}/0.jpg`;
    return {
      duration,
      title,
      artist: author,
      thumbnail,
    };
  };

  return (
    <div className={classes.container}>
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
      <AddSongDialog
        url={url}
        setUrl={setUrl}
        setDialog={setDialog}
        dialog={dialog}
        song={song}
        setSong={setSong}
      />
      <TextField
        fullWidth
        margin="normal"
        size="small"
<<<<<<< HEAD
        label="Add song or video URL"
        variant="filled"
        type="url"
        sx={{ margin: 2 }}
=======
        id="filled-basic"
        label="Add"
        variant="filled"
        type="url"
        className={classes.urlInput}
        InputProps={{
          classes: {
            input: classes.textInput,
          },
        }}
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
        onChange={(e) => setUrl(e.target.value)}
        value={url}
      />
      <Button
        variant="outlined"
        size="large"
        onClick={() => setDialog(true)}
<<<<<<< HEAD
        disabled={!playable}
      >
        <Add />
=======
        className={classes.addSongButton}
        disabled={!playable}
      >
        <AddIcon />
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
      </Button>
      <ReactPlayer url={url} hidden onReady={handleEditSong} />
    </div>
  );
}
