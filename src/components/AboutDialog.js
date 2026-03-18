import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Link,
} from "@mui/material";

export default function AboutDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>About Video Share</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          How it works
        </Typography>
        <Typography variant="body2" paragraph>
          Video Share lets you build a collaborative playlist from YouTube,
          Vimeo, and SoundCloud links. Paste a URL into the header, hit the{" "}
          <strong>+</strong> button to confirm the song details, and it is added
          to the shared list for everyone to see.
        </Typography>
        <Typography variant="body2" paragraph>
          Click the play button on any song to start listening. Songs can be
          added to your personal queue using the queue icon, and the player
          supports play/pause and skipping between queued tracks.
        </Typography>

        <Typography variant="subtitle1" gutterBottom fontWeight="bold" mt={1}>
          Where data is stored
        </Typography>
        <Typography variant="body2" paragraph>
          Songs are stored in a{" "}
          <Link
            href="https://hasura.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hasura
          </Link>{" "}
          GraphQL database. The app connects over a live WebSocket subscription
          so the song list updates in real time across all open sessions.
        </Typography>
        <Typography variant="body2">
          Your personal playback queue is saved to{" "}
          <strong>localStorage</strong> in your browser and is not shared with
          other users.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
