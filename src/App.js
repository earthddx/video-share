import React, { createContext, useContext, useReducer } from "react";
import { Grid, useMediaQuery } from "@mui/material";
import { useQuery } from "@apollo/client";

import Header from "./components/Header";
import VideoList from "./components/VideoList";
import QueudVideoList from "./components/QueuedVideoList";
import videoReducer from "./reducer";
import { GET_QUEUED_VIDEOS } from "./graphql/queries";

export const VideoContext = createContext({
  video: {
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
  const { data } = useQuery(GET_QUEUED_VIDEOS);
  const context = useContext(VideoContext);
  const [state, dispatch] = useReducer(videoReducer, context);
  const greaterThanMd = useMediaQuery((theme) => theme.breakpoints.up("md"));

  return (
    <VideoContext.Provider value={{ state, dispatch }}>
      <Header />
      <Grid
        container
        sx={{ pt: 'calc(64px + 16px)', px: { xs: 1, sm: 2 } }}
      >
        {greaterThanMd && (
          <Grid item md={3}>
            <QueudVideoList queue={data?.queue ?? []} />
          </Grid>
        )}
        <Grid item xs={12} md={9}>
          <VideoList queue={data?.queue ?? []} />
        </Grid>
      </Grid>
    </VideoContext.Provider>
  );
}

export default App;
