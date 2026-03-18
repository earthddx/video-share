import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { YouTube } from "@mui/icons-material";

import AddSong from "./AddSong";
import SongPlayer from "./SongPlayer";

export default function Header() {
  const greaterThanSm = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  return (
    <AppBar position="fixed" color="secondary">
      <Grid container spacing={1}>
        {greaterThanSm && (
          <Grid item md={4}>
            <Toolbar>
              <YouTube sx={{ fontSize: 40 }} color="primary" />
              <Typography
                variant="h5"
                component="h1"
                sx={{ ml: 1, fontWeight: "light" }}
              >
                Music Share
              </Typography>
            </Toolbar>
          </Grid>
        )}
        <Grid item md={4}>
          <AddSong />
        </Grid>
        <Grid
          item
          md={4}
          sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
        >
          <SongPlayer />
        </Grid>
      </Grid>
    </AppBar>
  );
}
