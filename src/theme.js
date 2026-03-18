import { createTheme } from "@mui/material/styles";
import { red, grey } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: red[700] },
    secondary: { main: grey[900] },
  },
  typography: {
    fontFamily: "Roboto",
  },
});

export default theme;
