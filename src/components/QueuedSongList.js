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
<<<<<<< HEAD
} from "@mui/material";
import { Cancel, ExpandMore, QueueMusic } from "@mui/icons-material";
import { useMutation } from "@apollo/client";

import { ADD_OR_REMOVE_SONG_FROM_QUEUE } from "../graphql/mutations";

export default function QueuedSongList({ queue }) {
=======
  makeStyles,
} from "@material-ui/core";
import clsx from "clsx";
import { Cancel, ExpandMore, QueueMusic } from "@material-ui/icons/";
import { useMutation } from "@apollo/react-hooks";

import { ADD_OR_REMOVE_SONG_FROM_QUEUE } from "../graphql/mutations";

const useStyles = makeStyles((theme) => ({
  queuedSongList: {
    margin: " 0 auto",
  },
  avatar: {
    width: 44,
    height: 44,
  },
  text: {
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  container: {
    display: "grid",
    gridAutoFlow: "column",
    gridTemplateColumns: "50px auto 50px",
    gridGap: 12,
    alignItems: "center",
    marginTop: 10,
  },
  songInfoContainer: {
    overflow: "hidden",
    whiteSpace: "no-wrap",
  },

  root: {
    maxWidth: 275,
    minWidth: 275,
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
}));

export default function QueuedSongList({ queue }) {
  const classes = useStyles();
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    queue.length > 0 && (
<<<<<<< HEAD
      <div style={{ margin: "0 auto" }}>
        <div style={{ maxWidth: 275, minWidth: 275 }}>
=======
      <div className={classes.queuedSongList}>
        <div className={classes.root}>
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
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
<<<<<<< HEAD
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
=======
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
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
<<<<<<< HEAD
=======
  const classes = useStyles();
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
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
<<<<<<< HEAD
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
=======
    <div className={classes.container}>
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
      <Avatar
        variant="square"
        src={thumbnail}
        alt="song thumbnail"
<<<<<<< HEAD
        sx={{ width: 44, height: 44 }}
      />
      <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
        <Typography
          variant="subtitle2"
          sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
        >
=======
        className={classes.avatar}
      />
      <div className={classes.songInfoContainer}>
        <Typography variant="subtitle2" className={classes.text}>
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
<<<<<<< HEAD
          sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
=======
          className={classes.text}
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
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
