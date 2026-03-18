import React, { createContext, useContext, useReducer } from "react";
import { Grid, useMediaQuery } from "@mui/material";
import { useQuery } from "@apollo/client";

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
  playedSeconds: 0,
  isVideoExpanded: false,
});

function App() {
  const { data } = useQuery(GET_QUEUED_SONGS);
  const context = useContext(SongContext);
  const [state, dispatch] = useReducer(songReducer, context);
  const greaterThanMd = useMediaQuery((theme) => theme.breakpoints.up("md"));

  return (
    <SongContext.Provider value={{ state, dispatch }}>
      <Header />
      <Grid
        container
        sx={{ pt: 'calc(64px + 16px)', px: { xs: 1, sm: 2 } }}
      >
        {greaterThanMd && (
          <Grid item md={3}>
            <QueudSongList queue={data?.queue ?? []} />
          </Grid>
        )}
        <Grid item xs={12} md={9}>
          <SongList queue={data?.queue ?? []} />
        </Grid>
      </Grid>
    </SongContext.Provider>
  );
}

export default App;
