import styled from "styled-components";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { styled as styleMui } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import { TitleDefault } from "../cadastroClientes/style";

export const Box = styled.div`
height: 100%;
`;

export const Title = styled(TitleDefault)`
`;

export const ContainerInputs = styled.div`
display: flex;
width: 100%;
justify-content: space-around;
`;
export const DivInput = styled.div`
width: 42%;
`;

export const ContainerTable = styled.div`
margin: 0px 4rem;
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

export const ContainerButton = styled.div`
margin: 16px 12rem;
`;