import React, { createContext, useContext, useReducer } from "react";
<<<<<<< HEAD
import { Grid, useMediaQuery } from "@mui/material";
import { useQuery } from "@apollo/client";
=======
import { Grid, useMediaQuery } from "@material-ui/core";
import { useQuery } from "@apollo/react-hooks";
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994

import Header from "./components/Header";
import SongList from "./components/SongList";
import QueudSongList from "./components/QueuedSongList";
import songReducer from "./reducer";
import { GET_QUEUED_SONGS } from "./graphql/queries";

export const SongContext = createContext({
  song: {
    artist: "",
    title: "",
    duration: 0,
    id: "",
    thumbnail: "",
    url: "",
  },
  isPlaying: false,
});

function App() {
  const { data } = useQuery(GET_QUEUED_SONGS);
  const context = useContext(SongContext);
  const [state, dispatch] = useReducer(songReducer, context);
  const greaterThanMd = useMediaQuery((theme) => theme.breakpoints.up("md"));

  return (
    <SongContext.Provider value={{ state, dispatch }}>
      <Header />
      <Grid container>
        {greaterThanMd && (
          <Grid
            item
            md={3}
            style={{
              paddingTop: 80,
              display: "flex",
              flexDirection: "column",
            }}
          >
<<<<<<< HEAD
            <QueudSongList queue={data?.queue ?? []} />
=======
            <QueudSongList queue={data.queue} />
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
          </Grid>
        )}
        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          style={{
            paddingTop: 100,
<<<<<<< HEAD
          }}
        >
          <SongList queue={data?.queue ?? []} />
=======

          }}
        >
          <SongList queue={data.queue} />
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
        </Grid>
        <Grid item md={3} />
      </Grid>
    </SongContext.Provider>
  );
}

export default App;
