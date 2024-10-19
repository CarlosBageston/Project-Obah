import {createGlobalStyle} from 'styled-components';

const GlobalStyle = createGlobalStyle`
/* Reset básico de CSS */
@import url('https://fonts.googleapis.com/css2?family=Baloo+2&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  width: 100%;
  font-size: 16px;
}

@media print {
    /* Oculta elementos que não devem aparecer na impressão */
    .no-print {
        display: none !important;
    }

    .marginprint {
        margin-bottom: 6px;
        margin-top: 6px;
    }

    /* Adicione aqui quaisquer outros estilos específicos para impressão */
}

.style-scrollbar {
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 14px; 
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px; 
  }

  &::-webkit-scrollbar-thumb {
    background: #979799;
    border-radius: 10px; 
    border: 3px solid #f1f1f1;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #333;
  }
}

body {
  font-family: ${props => props.theme.fontsDefault.primaryFont};
  line-height: 1.4;
  color: #333;
  background-color: #fff;

    /* Estilize a barra de rolagem vertical do WebKit */
    ::-webkit-scrollbar {
      width: 16px; /* largura da barra de rolagem */
      background-color: #f0f0f0; /* cor do fundo da barra de rolagem */
    }

    ::-webkit-scrollbar-thumb {
      background-color: #9999; /* cor da barra de rolagem */
      border-radius: 8px; /* borda arredondada da barra de rolagem */
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: #999; /* cor da barra de rolagem ao passar o mouse */
    }

    ::-webkit-scrollbar-track {
      background-color: #f0f0f0; /* cor do fundo da trilha da barra de rolagem */
    }

    ::-webkit-scrollbar-track:hover {
      background-color: #d3d3d3; /* cor do fundo da trilha ao passar o mouse */
    }
}

h1, h2, h3, h4, h5, h6 {
  font-weight: bold;
}

ul, ol, li {
  list-style: none;
}

a {
  color: #007bff;
  text-decoration: none;
}

`
export default GlobalStyle