import React, { useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Cancel, ExpandMore, QueueMusic } from "@mui/icons-material";
import { useMutation } from "@apollo/client";

import { ADD_OR_REMOVE_SONG_FROM_QUEUE } from "../graphql/mutations";

export default function QueuedSongList({ queue }) {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    queue.length > 0 && (
      <div style={{ margin: "0 auto" }}>
        <div style={{ maxWidth: 275, minWidth: 275 }}>
          <CardActions disableSpacing>
            <Typography color="textPrimary">
              {expanded ? (
                <span style={{ fontWeight: 100 }}>
                  {queue.length} queued {queue.length === 1 ? "song" : "songs"}
                </span>
              ) : (
                <span style={{ fontWeight: 100 }}>
                  <Tooltip title="Queue">
                    <QueueMusic style={{ fontSize: 34 }} />
                  </Tooltip>
                </span>
              )}
            </Typography>
            <IconButton
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              sx={{
                marginLeft: "auto",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: (theme) =>
                  theme.transitions.create("transform", {
                    duration: theme.transitions.duration.shortest,
                  }),
              }}
            >
              <ExpandMore />
            </IconButton>
          </CardActions>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Card>
              <CardContent>
                {queue.map((song, i) => (
                  <QueuedSong key={i} song={song} />
                ))}
              </CardContent>
            </Card>
          </Collapse>
        </div>
      </div>
    )
  );
}

function QueuedSong({ song }) {
  const { thumbnail, artist, title } = song;
  const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_SONG_FROM_QUEUE, {
    onCompleted: (data) => {
      localStorage.setItem("queue", JSON.stringify(data.addOrRemoveFromQueue));
    },
  });

  const handleRemoveFromQueue = () => {
    addOrRemoveFromQueue({
      variables: { input: { ...song, __typename: "Song" } },
    });
  };

  return (
    <div
      style={{
        display: "grid",
        gridAutoFlow: "column",
        gridTemplateColumns: "50px auto 50px",
        gap: 12,
        alignItems: "center",
        marginTop: 10,
      }}
    >
      <Avatar
        variant="square"
        src={thumbnail}
        alt="song thumbnail"
        sx={{ width: 44, height: 44 }}
      />
      <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
        <Typography
          variant="subtitle2"
          sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
        >
          {artist}
        </Typography>
      </div>
      <IconButton onClick={handleRemoveFromQueue}>
        <Cancel color="primary" />
      </IconButton>
    </div>
  );
}
