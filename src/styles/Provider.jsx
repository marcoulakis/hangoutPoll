import { ThemeProvider } from "@emotion/react";

const palette = {
    colors: {
        "lightGray": "#7B7C7F",
        "darkGray": "##24252B",
        "black": "#191A21",
        "white": "#FFFFFF",
        "green": "#30C708",
        "darkGreen": "#49752D",
        "blue": "#028AFE",
        "darkBlue": "#16425B",
        "orange": "#FF6700",
        "beige": "#B4A952",
        "red": "#EB3232",
        "yellow": "#FAE103"
    },
};

const lightTheme = {
    primary: {
        text: palette.colors.black,
        background: palette.colors.white,
        secondary: palette.colors.lightGray
    },
};

const darkTheme = {
    primary: {
        text: palette.colors.white,
        background: palette.colors.black,
        secondary: palette.colors.darkGray
    },
};
export const ProviderThemes = (props) => {

    return (
        <ThemeProvider theme={props.theme === "light" ? lightTheme : darkTheme}>
            {props.children}
        </ThemeProvider>
    );
};