import React, { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import ReactPlayer from "react-player";

import AddVideoDialog from "./AddVideoDialog";

export default function AddVideo() {
  const [dialog, setDialog] = useState(false);
  const [url, setUrl] = useState("");
  const [playable, setPlayable] = useState(false);
  const [video, setVideo] = useState({
    duration: 0,
    title: "",
    artist: "",
    thumbnail: "",
  });

  useEffect(() => {
    const isPlayable = ReactPlayer.canPlay(url);
    setPlayable(isPlayable);
  }, [url]);

  const handleEditVideo = async ({ player }) => {
    // YouTube — use player API for full metadata
    try {
      const nestedPlayer = player.player.player;
      if (typeof nestedPlayer.getDuration === "function") {
        const duration = nestedPlayer.getDuration();
        const { title, video_id, author } = nestedPlayer.getVideoData();
        const thumbnail = `https://img.youtube.com/vi/${video_id}/0.jpg`;
        setVideo({ duration, title, artist: author, thumbnail, url });
        return;
      }
    } catch (_) {}

    // Vimeo — oEmbed API
    if (/vimeo\.com/.test(url)) {
      try {
        const res = await fetch(
          `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
        );
        const data = await res.json();
        setVideo((prev) => ({
          ...prev,
          url,
          title: data.title || "",
          thumbnail: data.thumbnail_url || "",
          duration: data.duration || 0,
        }));
        return;
      } catch (_) {}
    }

    // SoundCloud — oEmbed API
    if (/soundcloud\.com/.test(url)) {
      try {
        const res = await fetch(
          `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        );
        const data = await res.json();
        setVideo((prev) => ({
          ...prev,
          url,
          title: data.title || "",
          thumbnail: data.thumbnail_url || "",
        }));
        return;
      } catch (_) {}
    }

    // Fallback — no metadata available
    setVideo((prev) => ({ ...prev, url }));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AddVideoDialog
        url={url}
        setUrl={setUrl}
        setDialog={setDialog}
        dialog={dialog}
        video={video}
        setVideo={setVideo}
      />
      <TextField
        fullWidth
        margin="normal"
        size="small"
        label="Add video URL"
        variant="filled"
        type="url"
        sx={{ mx: 2, my: 0, maxWidth: 500 }}
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
      <ReactPlayer url={url} hidden onReady={handleEditVideo} />
    </div>
  );
}
