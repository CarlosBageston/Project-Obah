import styled from "styled-components";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { styled as styleMui } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import { BsTrash } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";

export const ContainerTable = styled.div`
margin:  0 4rem;
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

export const StyledTableRow = styleMui(TableRow)(
  () => ({
    cursor: 'pointer',
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  })
);
export const ContainerButtons = styled.div`
display: flex;
position: relative;
margin-left: 91%;
margin-top: 20px;
`;
export const Button = styled.button<{isDisabled?: boolean; isVisibledDelete?: boolean}>`
display: ${props => props.isVisibledDelete ? 'none' : 'flex'};
width: 2.8rem;
height: 2.8rem;
justify-content: center;
align-items: center;
position: absolute;
background-color: ${props => props.isDisabled ? '#e0e0e0' : '#f06a61'};
border-radius: 6px;
margin-top: -24px;
border: ${props => props.isDisabled ? '1px solid #b5b5b5' : '1px solid red' } ;
box-shadow:2px 2px 2px 2px #00000222;
cursor: ${props => props.isDisabled ? 'default' : 'pointer'};
&:hover {
  transform: ${props => props.isDisabled ?' scale(1)' : 'scale(0.9)'}
}
`;
export const ButtonEdit = styled(Button)<{isDisabled?: boolean; isVisibleEdit?: boolean}>`
display: ${props => props.isVisibleEdit ? 'none' : 'block'};
margin-left: -60px;
background-color: ${props => props.isDisabled ? '# #e0e0e0' : '#8585ff'};
border: ${props => props.isDisabled ? '1px solid #b5b5b5' : '1px solid blue' } ;
`;

export const BsTrashStyled = styled(BsTrash)<{isDisabled?: boolean}>`
color: ${props => props.isDisabled ? "#8f8d8d" : 'black'};
font-size: 22px;
`;
export const FiEditStyled = styled(FiEdit)<{isDisabled?: boolean}>`
color: ${props => props.isDisabled ? "#8f8d8d" : 'black'};
font-size: 22px;
`;
