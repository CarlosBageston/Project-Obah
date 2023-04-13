import { ThemeProvider } from "styled-components"
import Router from "./routes/routes"
import GlobalStyle from "./styleGlobal"
import { theme } from "./theme"


function App() {

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router />
    </ThemeProvider>
  )
}

export default App
