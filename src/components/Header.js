import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
<<<<<<< HEAD
  Grid,
  useMediaQuery,
} from "@mui/material";
import { YouTube } from "@mui/icons-material";
=======
  makeStyles,
  Grid,
  useMediaQuery,
} from "@material-ui/core";
import { YouTube } from "@material-ui/icons/";
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994

import AddSong from "./AddSong";
import SongPlayer from "./SongPlayer";

<<<<<<< HEAD
export default function Header() {
=======
const useStyles = makeStyles((theme) => ({
  songPlayer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightLight,
  },
  title: {
    marginLeft: theme.spacing(1),
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightLight,
  },
}));

export default function Header() {
  const classes = useStyles();
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
  const greaterThanSm = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  return (
    <AppBar position="fixed" color="secondary">
      <Grid container spacing={1}>
        {greaterThanSm && (
          <Grid item md={4}>
            <Toolbar>
<<<<<<< HEAD
              <YouTube sx={{ fontSize: 40 }} color="primary" />
              <Typography
                variant="h5"
                component="h1"
                sx={{ ml: 1, fontWeight: "light" }}
              >
                Music Share
=======
              <YouTube style={{ fontSize: 40 }} color="primary" />
              <Typography variant="h5" component="h1" className={classes.title}>
                YouTube Music Share
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
              </Typography>
            </Toolbar>
          </Grid>
        )}
        <Grid item md={4}>
          <AddSong />
        </Grid>
<<<<<<< HEAD
        <Grid
          item
          md={4}
          sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
        >
          <SongPlayer />
=======
        <Grid item md={4} className={classes.songPlayer}>
          <SongPlayer/>
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
        </Grid>
      </Grid>
    </AppBar>
  );
}
