import { ThemeProvider } from "styled-components"
import Router from "./routes/routes"
import GlobalStyle from "./styleGlobal"
import { theme } from "./theme"
import UseAuth from "./hooks/auth/useauth"
import { Box, Dots } from "./store/assets/loadingStyle"
import logo from "./assets/Image/logo.png"


function App() {
    const { isLoading } = UseAuth();
    if (isLoading) {
        return (
            <Box>
                <div>
                    <img src={logo} alt="logo da empresa" width={250} />
                </div>
                <Dots />
            </Box>);
    }

    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <Router />
        </ThemeProvider>
    )
}

export default App
