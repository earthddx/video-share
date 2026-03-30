import { createTheme } from "@mui/material/styles";
import { red, grey } from "@mui/material/colors";

export function createAppTheme() {
  return createTheme({
    palette: {
      mode: "dark",
      primary: { main: red[400] },
      secondary: { main: grey[900] },
    },
    shape: { borderRadius: 8 },
    typography: { fontFamily: "Roboto" },
  });
}
