import styled from "styled-components";
import { Button } from "@mui/material";
import { TitleDefault } from "../cadastroClientes/style";

export const Box = styled.div`
width: 100%;
height: 100vh;
`

export const Title = styled(TitleDefault)``;

export const ContainerAll = styled.div`
margin-top: 4rem;
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
`
export const ContainerInput = styled.div`
width: 79%;
`

export const ContainerProdutos = styled.div`
height: 25rem;
width: 40%;
display: flex;
flex-direction: column;
-webkit-box-align: center;
align-items: center;
background-color: rgb(255 255 255);
margin-top: 16px;
border: 0px solid rgba(0, 0, 0, 0.59);
border-radius: 2px;
box-shadow: rgba(0, 0, 0, 0.75) 2px 2px 6px -1px;

`;

export const DivTitle = styled.div`
width: 100%;
padding: 8px;
background-color: ${props => props.theme.paletteColor.primaryBlue};
border-radius: 4px 4px 0px 0px;
box-shadow: 0px 3px 10px -4px rgba(0,0,0,0.71);
`;

export const TitleProduto = styled.p`
font-size: 18px;
font-weight: bold;
color: #fff
`;


export const ResultadoTotal = styled.p`
    font-size: 1.5rem;
    margin-top: 8px
`;

export const DateStyle = styled.p`
font-weight: bold;
font-size: 18px;
padding: 8px;
`;

export const ContainerNota = styled.div`
width: 100%;
overflow: auto;
height: 22.4rem;
::-webkit-scrollbar {
    width: 4px;
    height: 4px;
    background-color: #F5F5F5;
  }
::-webkit-scrollbar-thumb {
    background-color: #888;
  }
::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`

export const ContainerDescricao = styled.div`
display: flex;
justify-content: space-between;
width: 100%;
`

export const TitleNota = styled.p`
color: #0a0269;
font-size: 1.2rem;
padding: 4px 12px;
font-weight: bold;
`

export const ContainerPreco = styled.div`
display: flex;
justify-content: space-between;
`
export const TitlePreco = styled.div`
color: #001f03;
padding: 4px 12px;
font-weight: 600;
`

export const BoxProduto = styled.div`
display: flex;
width: 100%;
justify-content: space-around;
`;

export const BoxButtonInput = styled.div`
display: flex;
flex-direction: column;
justify-content: space-between;
`;

export const DivEmpty = styled.div`
display: flex;
flex-direction: column;
align-items: center;
`;
export const TextEmpty = styled.div`
font-size: 1rem;
font-weight: bold;
font-style: italic;
`;

export const StyleButton = styled(Button)``;

export const DivAdicionais = styled.div`
display: flex;
align-items: center;
padding-top: 8px;
`;

export const TextAdicional = styled.p`
font-size: 24px;
font-weight: bold;
`;

export const DivMultiplicar = styled.div`
width: 8rem;
`;
