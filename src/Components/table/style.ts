import styled from "styled-components";
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { styled as styleMui } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import { BsTrash } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";

export const ContainerTable = styled.div`
height: 25rem;
`;
export const ContainerFilter = styled(ContainerTable)`
height: auto;
margin-bottom: -20px;
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
margin-left: 95%;
margin-top: 20px;
`;
export const Button = styled.button<{isdisabled?: boolean; isVisibledDelete?: boolean}>`
display: ${props => props.isVisibledDelete ? 'none' : 'flex'};
width: 2.8rem;
height: 2.8rem;
justify-content: center;
align-items: center;
position: absolute;
background-color: ${props => props.isdisabled ? '#e0e0e0' : '#f06a61'};
border-radius: 6px;
margin-top: -24px;
border: ${props => props.isdisabled ? '1px solid #b5b5b5' : '1px solid red' } ;
box-shadow:2px 2px 2px 2px #00000222;
cursor: ${props => props.isdisabled ? 'default' : 'pointer'};
&:hover {
  transform: ${props => props.isdisabled ?' scale(1)' : 'scale(0.9)'}
}
`;
export const ButtonEdit = styled(Button)<{isdisabled?: boolean; isVisibleEdit?: boolean}>`
display: ${props => props.isVisibleEdit ? 'none' : 'block'};
margin-left: -60px;
background-color: ${props => props.isdisabled ? '#e0e0e0' : '#8585ff'};
border: ${props => props.isdisabled ? '1px solid #b5b5b5' : '1px solid blue' } ;
`;

export const BsTrashStyled = styled(BsTrash)<{isdisabled?: boolean}>`
color: ${props => props.isdisabled ? "#8f8d8d" : 'black'};
font-size: 22px;
`;
export const FiEditStyled = styled(FiEdit)<{isdisabled?: boolean}>`
color: ${props => props.isdisabled ? "#8f8d8d" : 'black'};
font-size: 22px;
`;
