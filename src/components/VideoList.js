import { useState } from "react";
import {
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useSubscription, useMutation } from "@apollo/client";

import { GET_VIDEOS } from "../graphql/subscriptions";
import { DELETE_VIDEO } from "../graphql/mutations";

import Video from "./Video";

export default function VideoList({ queue }) {
  const { data, loading, error } = useSubscription(GET_VIDEOS);
  const [deleteVideo] = useMutation(DELETE_VIDEO);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

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
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = () => {
    deleteVideo({ variables: { id: pendingDeleteId } });
    setPendingDeleteId(null);
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
  };

  return (
    <>
      <Grid container spacing={3}>
        {data.videos.map((video) => (
          <Grid item xs={12} sm={6} md={4} key={video.id}>
            <Video video={video} handleDeleteVideo={handleDeleteVideo} queue={queue} />
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!pendingDeleteId} onClose={handleCancelDelete} PaperProps={{ sx: { minWidth: 320 } }}>
        <DialogTitle>Delete Video</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this video? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} variant="contained" sx={{ bgcolor: "white", color: "#000", "&:hover": { bgcolor: "grey.100" } }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
