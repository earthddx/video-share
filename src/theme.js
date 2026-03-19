import { createTheme } from "@mui/material/styles";
import { red, grey } from "@mui/material/colors";

export function createAppTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: red[400] },
      secondary: { main: mode === "dark" ? grey[900] : grey[200] },
      ...(mode === "light" && {
        text: {
          secondary: "rgba(0,0,0,0.75)",
          disabled: "rgba(0,0,0,0.5)",
        },
      }),
    },
    shape: { borderRadius: 8 },
    typography: { fontFamily: "Roboto" },
  });
}
