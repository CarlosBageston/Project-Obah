import 'styled-components';

declare module 'styled-components' {

    export interface DefaultTheme {

        paletteColor: {
            colorDefault: string,
            colorLabel: string,
            backgroundInput: string,
            borderInput: string,
            disabled: string,
            secundDisabled: string
            primaryBlue: string
            secundBlue: string,
            tertiaryBlue: string,
            primaryGreen: string,
            secundGreen: string,
            tertiaryGreen: string,
        },
        fontsDefault: {
            primaryFont: string,
            secondaryFont: string
        }
    }
}