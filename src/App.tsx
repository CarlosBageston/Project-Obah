import { ThemeProvider } from "styled-components"
import Router from "./routes/routes"
import GlobalStyle from "./styleGlobal"
import { theme } from "./theme"
import { Provider } from 'react-redux'
import store from "./store/reducer/store"


function App() {

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router />
      </ThemeProvider>
    </Provider>
  )
}

export default App
