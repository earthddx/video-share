import React, { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import ReactPlayer from "react-player";

import AddSongDialog from "./AddSongDialog";

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

  useEffect(() => {
    const isPlayable = ReactPlayer.canPlay(url);
    setPlayable(isPlayable);
  }, [url]);

  const handleEditSong = ({ player }) => {
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
        label="Add song or video URL"
        variant="filled"
        type="url"
        sx={{ margin: 2 }}
        onChange={(e) => setUrl(e.target.value)}
        value={url}
      />
      <Button
        variant="outlined"
        size="large"
        onClick={() => setDialog(true)}
        disabled={!playable}
      >
        <Add />
      </Button>
      <ReactPlayer url={url} hidden onReady={handleEditSong} />
    </div>
  );
}
