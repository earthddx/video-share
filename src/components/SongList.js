import React from "react";
import { Grid, CircularProgress } from "@mui/material";
import { useSubscription, useMutation } from "@apollo/client";

import { GET_SONGS } from "../graphql/subscriptions";
import { DELETE_SONG } from "../graphql/mutations";

import Song from "./Song";

export default function SongList({ queue }) {
  const { data, loading, error } = useSubscription(GET_SONGS);
  const [deleteSong] = useMutation(DELETE_SONG);

  if (loading) {
    return (
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <CircularProgress size="10rem" />
      </div>
    );
  }

  if (error) {
    return <div>Error fetching songs</div>;
  }

  const handleDeleteSong = (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      deleteSong({ variables: { id } });
    }
  };

  return (
    <Grid container spacing={2}>
      {data.songs.map((song) => (
        <Grid item xs={12} sm={6} md={4} key={song.id}>
          <Song song={song} handleDeleteSong={handleDeleteSong} queue={queue} />
        </Grid>
      ))}
    </Grid>
  );
}
