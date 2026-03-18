import React from "react";
import { Grid, CircularProgress } from "@mui/material";
import { useSubscription, useMutation } from "@apollo/client";

import { GET_VIDEOS} from "../graphql/subscriptions";
import { DELETE_VIDEO } from "../graphql/mutations";

import Video from "./Video";

export default function VideoList({ queue }) {
  const { data, loading, error } = useSubscription(GET_VIDEOS);
  const [deleteVideo] = useMutation(DELETE_VIDEO);

  if (loading) {
    return (
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <CircularProgress size="10rem" />
      </div>
    );
  }

  if (error) {
    return <div>Error fetching videos</div>;
  }

  const handleDeleteVideo = (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      deleteVideo({ variables: { id } });
    }
  };

  return (
    <Grid container spacing={3}>
      {data.videos.map((video) => (
        <Grid item xs={12} sm={6} md={4} key={video.id}>
          <Video video={video} handleDeleteVideo={handleDeleteVideo} queue={queue} />
        </Grid>
      ))}
    </Grid>
  );
}
