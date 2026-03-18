<<<<<<< HEAD
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
=======
import { createMuiTheme } from "@material-ui/core/styles";
import { red, grey } from "@material-ui/core/colors";

const theme = createMuiTheme({
  palette: {
    fontFamily:'Roboto',
    type: "dark",
    primary: { main: red[700] },
    secondary: { main: grey[900] },
    
>>>>>>> b3eb029f673d880add61f8329d07f6756d857994
  },
});

export default theme;
