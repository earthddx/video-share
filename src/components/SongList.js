import React from "react";
<<<<<<< HEAD
import { Grid, CircularProgress } from "@mui/material";
import { useSubscription, useMutation } from "@apollo/client";
=======
import { Grid, CircularProgress } from "@material-ui/core";

import { useSubscription, useMutation } from "@apollo/react-hooks";
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994

import { GET_SONGS } from "../graphql/subscriptions";
import { DELETE_SONG } from "../graphql/mutations";

import Song from "./Song";

<<<<<<< HEAD
=======

>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
export default function SongList({ queue }) {
  const { data, loading, error } = useSubscription(GET_SONGS);
  const [deleteSong] = useMutation(DELETE_SONG);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 250,
        }}
      >
        <CircularProgress size="10rem" />
      </div>
    );
  }

  if (error) {
<<<<<<< HEAD
    return <div>Error fetching songs</div>;
  }

  const handleDeleteSong = (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      deleteSong({ variables: { id } });
=======
    return <div>Error fetching songs </div>;
  }

  const handleDeleteSong = (id) => {
    if (window.confirm("⚠️ Are you sure you want to delete song?")) {
      deleteSong({
        variables: { id },
      });
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
    }
  };

  return (
    <div>
      <Grid container spacing={0}>
        {data.songs.map((song) => (
          <Grid item md={4} key={song.id}>
<<<<<<< HEAD
            <Song song={song} handleDeleteSong={handleDeleteSong} queue={queue} />
=======
            <Song
              song={song}
              handleDeleteSong={handleDeleteSong}
              queue={queue}
            />
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
