import { baseTheme, extendTheme } from "@chakra-ui/react";
import buttonTheme from "./buttonTheme";
import linkTheme from "./linkTheme";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const global = {
  body: {
    bg: 'white',
    color: 'black',
  },
  text: {
    muted: baseTheme.colors.gray[400],
  },
};

const theme = extendTheme({
  config,
  styles: {
    global
  },
  components: {
    Button: buttonTheme,
    Link: linkTheme,
  },
});

export default theme;