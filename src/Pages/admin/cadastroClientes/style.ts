import styled from "styled-components";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { styled as styleMui } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';

export const Box = styled.div`
height: 100%;
`;

export const TitleDefault = styled.h1`
text-align: center;
margin: 1rem 0 2rem 0;
`;

export const ContainerInfoCliente = styled.div`
display: flex;
width: 100%;
padding: 0 4rem 0 4rem;
justify-content: space-between;
align-items: flex-end;
`;

export const DivCliente = styled.div`
width: 40%;
padding-left: 8px;
`;
export const DivPreco = styled.div`
padding: 0px 4rem;
display: flex;
justify-content: space-between;
`;

export const TextDivisao = styled.h4`
padding: 2rem 4rem 0 4rem;
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
            fontSize: 14,
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
margin: 0px 12rem;
`;

export const ButtonStyled = styled.button`
  --color: #7371f2;
  padding: 0.8em 1.7em;
  background-color: transparent;
  border-radius: .3em;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: .5s;
  font-weight: bold;
  font-size: 17px;
  border: 1px solid;
  font-family: inherit;
  text-transform: uppercase;
  color: var(--color);
  z-index: 1;

  &::before,
  &::after {
    content: '';
    display: block;
    width: 50px;
    height: 50px;
    transform: translate(-50%, -50%);
    position: absolute;
    border-radius: 50%;
    z-index: -1;
    background-color: var(--color);
    transition: 1s ease;
  }

  &::before {
    top: -1em;
    left: -1em;
  }

  &::after {
    left: calc(100% + 1em);
    top: calc(100% + 1em);
  }

  &:hover::before,
  &:hover::after {
    height: 410px;
    width: 410px;
  }

  &:hover {
    color: white;
  }

  &:active {
    filter: brightness(.8);
  }
`;