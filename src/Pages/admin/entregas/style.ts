import styled from "styled-components";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { styled as styleMui } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import { TitleDefault } from "../cadastroClientes/style";

export const Box = styled.div`
height: 100%;
`;

export const Title = styled(TitleDefault)``;

export const TextTable = styled.p<{ isDisabled?: boolean }>`
font-size: 20px;
font-weight: bold;
text-align: center;
padding: 24px 8px 8px 8px;
opacity: ${({ isDisabled }) => isDisabled ? 0.5 : 1};
pointer-events: ${({ isDisabled }) => isDisabled ? 'none' : 'auto'};
`

export const DivPreco = styled.div`
width: 8rem;
`;

export const ContainerTableCliente = styled.div<{isVisible?: boolean}>`
overflow: auto;
height: 19rem;
display: flex;
width: 42rem;
justify-content: space-evenly;
opacity: ${({ isVisible }) => isVisible ? 0 : 1};
border: 2px solid #0000008c;
border-radius: 8px;
box-shadow: 4px 4px 13px 0px rgba(0,0,0,0.45);

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
export const ContainerTable = styled.div`
overflow: auto;
height: 27rem;

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

export const StyledTableCell = styleMui(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: '#0300ff',
            color: theme.palette.common.white,
            fontWeight: 'bold',
            fontSize: 16,
        },
        [`&.${tableCellClasses.body}`]: {
            fontWeight: 'bold',
            fontSize: 16,
        },
    }));

export const StyledTableRow = styleMui(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));


export const ContainerCliente = styled.div`
display: flex;
  align-items: center;
  justify-content: center;
  width: 40rem;
  position: relative;
`;


export const ContainerAll = styled.div`
display: flex;
align-items: flex-start;
justify-content: space-between;
`;
export const DivButtonAndTable = styled.div`
display: flex;
flex-direction: column;
align-items: flex-end;
`;

export const DivInputs = styled.div`
display: flex;
width: 45rem;
justify-content: flex-start;
`;