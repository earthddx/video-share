import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  useMediaQuery,
  Button,
} from "@mui/material";
import { YouTube, InfoOutlined } from "@mui/icons-material";
import AddVideo from "./add-video";
import AboutDialog from "./AboutDialog";

export default function Header() {
  const greaterThanMd = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <AppBar position="fixed" color="secondary">
      <Grid container alignItems="center" sx={{ minHeight: 64 }}>
        {greaterThanMd && (
          <Grid item md={2}>
            <Toolbar>
              <YouTube sx={{ fontSize: 36 }} color="primary" />
              <Typography
                variant="h6"
                component="h1"
                sx={{ ml: 1, fontWeight: "light" }}
              >
                Video Share
              </Typography>
            </Toolbar>
          </Grid>
        )}

        {/* AddVideo — full width on mobile, 8 cols on desktop */}
        <Grid item xs={10} md={greaterThanMd ? 8 : 10} sx={{ px: { xs: 0, md: 2 } }}>
          <AddVideo />
        </Grid>

        {/* Right section — always visible */}
        <Grid
          item
          xs={2}
          md={2}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          {greaterThanMd && (
            <Button
              color="inherit"
              startIcon={<InfoOutlined />}
              onClick={() => setAboutOpen(true)}
            >
              About
            </Button>
          )}
        </Grid>
      </Grid>
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </AppBar>
  );
}
