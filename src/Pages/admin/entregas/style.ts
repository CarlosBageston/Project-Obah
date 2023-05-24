import styled from "styled-components";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { styled as styleMui } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import { TitleDefault } from "../cadastroClientes/style";

export const Box = styled.div`
height: 100%;
`;

export const Title = styled(TitleDefault)``;

export const TextTable = styled.p`
font-size: 20px;
font-weight: bold;
padding: 24px 8px 8px 8px;
`

export const DivProduto = styled.div`
display: flex;
align-items: center;
padding-bottom: 8px;
margin-top: 4px;
border-bottom: 1px solid black;
height: 3rem;
`;
export const NameProduto = styled.div`
width: 15rem;
padding: 0 8px;
`;
export const ValueProduto = styled.div`
width: 10rem;
padding: 0 8px;
`;
export const QntProduto = styled.div`
width: 10rem;
padding:8px;
`;
export const ResultProduto = styled.div`
width: 10rem;
padding: 0 8px;
`;

export const ContainerTableCliente = styled.div<{isVisible?: boolean}>`
overflow: auto;
height: 19rem;
display: flex;
width: 42rem;
justify-content: flex-start;
opacity: ${({ isVisible }) => isVisible ? 0 : 1};
border: 2px solid #0000008c;
border-radius: 8px;
box-shadow: 4px 4px 13px 0px rgba(0,0,0,0.45);
flex-direction: column;

::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background-color: #F5F5F5;
  }
::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
  }
::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`;

export const ContainerCliente = styled.div`
display: flex;
  align-items: center;
  justify-content: center;
  width: 40rem;
  position: relative;
`;


export const ContainerAll = styled.div`
display: flex;
padding: 0 4rem 0 4rem;
`;
export const DivButtonAndTable = styled.div`
display: flex;
flex-direction: column;
align-items: flex-end;
`;

export const DivInputs = styled.div`
display: flex;
width: 37rem;
justify-content: flex-start;
`;