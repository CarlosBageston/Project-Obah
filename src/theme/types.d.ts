import 'styled-components';

declare module 'styled-components' {

    export interface DefaultTheme {

        paletteColor: {
            colorDefault: string,
            colorLabel: string,
            backgroundInput: string,
            borderInput: string,
            disabled: string
        },
        fontsDefault: {
            primaryFont: string,
            secondaryFont: string
        }
    }
}