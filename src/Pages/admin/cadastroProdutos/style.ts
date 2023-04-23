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

export const ContainerFlutuante = styled.div`
position: absolute;
display: flex;
width: 600px;
height: 650px;
top: 12%;
left: 32%;
background-color: #ffffff;
border-radius: 8px;
box-shadow: 1px 4px 5px 1px #00000070;
justify-content: space-around;
align-items: center;
flex-direction: column;
animation: scale-in-hor-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 200ms both;
@keyframes scale-in-hor-center {
  0% {
    transform: scaleX(0);
    opacity: 1;
  }
  100% {
    transform: scaleX(1);
    opacity: 1;
  }
}
`;

export const Paragrafo = styled.p`
width: 30rem;
font-size: 16px;
text-align: center;
`;

export const ContianerMP = styled.div`
height: 16rem;
overflow-y: auto;
`;

export const DivLineMP = styled.div`
display: flex;
align-items: center;
justify-content: flex-start;
width: 30rem;
margin-top: 1rem;
height: 45px;
`;


export const ButtonStyled = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: auto;
  border-radius: 36px;
  font-weight: 700;
  height: 54px;
  font-size: 16px;
  padding-inline: 20px;
  background-color: transparent;
  color: black;
  text-transform: uppercase;
  overflow: hidden;
  text-align: center;
  border: none;
  transition: all .25s ease-in-out;
  z-index: 1;
  cursor: pointer;

  &:hover::before,
  &:focus::before {
    transform: translateX(0%);
  }

  .text {
    white-space: nowrap;
    line-height: 1.2;
    padding-inline-end: 44px;
    z-index: 2;
  }

  &::after {
    content: '';
    position: absolute;
    height: 98%;
    width: 98%;
    border: 1px solid #FFB400;
    border-radius: 36px;
    z-index: 2;
  }

  &::before {
    content: "";
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: #FFB400;
    z-index: 1;
    left: -2px;
    transform: translateX(90%);
    transition: all .3s ease-out;
  }

  .icon {
    display: inherit;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    width: 54px;
    height: 54px;
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    background-color: #FFB400;
    z-index: 2;
  }
`;

export const DivLineMPEdit = styled(DivLineMP)`
width: auto;
`;

