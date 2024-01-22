import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { IoIosArrowUp } from "react-icons/io";
import styled from "styled-components";
import BoxMui from '@mui/material/Box';


export const Box = styled(BoxMui)`
 overflow-x: hidden;
 overflow-y: auto;
 padding-bottom: 0.5rem;
 /* Estilo para a barra de rolagem vertical */
 &::-webkit-scrollbar {
  width: 6px; /* Largura da barra de rolagem */
}

&::-webkit-scrollbar-thumb {
  background-color: #fff; /* Cor do polegar da barra de rolagem */
  border-radius: 6px; /* Raio da borda do polegar da barra de rolagem */
}

&::-webkit-scrollbar-track {
  background: transparent; /* Cor do fundo da barra de rolagem */
}
`;

export const BoxTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.p`
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 12px;
  color: #FFF;
  filter: drop-shadow(0 0 0.7px #FF2E63) drop-shadow(0 0 0.7px #FF2E63) drop-shadow(0 0 0.7px #FF2E63);
`;
export const StyledListItemButton = styled(ListItemButton)`
  && {
    position: relative;
    margin-top: 1rem;
    :hover {
      background-color: #FFF;
      width: 100%;
      margin-left: 0.5rem;
      border-bottom-left-radius: 20px;
      border-top-left-radius: 20px;
      &::before {
        content: "";
        position: absolute;
        background-color: 'transparent';
        clip-path: inset(0 2% 0 0);
        top: -19px;
        right: 8px;
        height: 20px;
        width: 25px;
        transform: rotate(180deg);
        border-top-left-radius: 25px;
        box-shadow: -7px -5px 0 0 #FFF;
        opacity: 1;
        transition: opacity 0.5s ease;
      }
      &::after {
        box-shadow: 7px -5px 0 0 #FFF;
        content: "";
        position: absolute;
        background-color: 'transparent';
        clip-path: inset(-1px -1% -6px 0px);
        bottom: -19px;
        right: 8px;
        height: 20px;
        width: 25px;
        transform: rotate(0deg);
        border-top-right-radius: 25px;
        opacity: 1;
        transition: opacity 0.5s ease;
      }
    }
  }
`;

export const StyledListItemButtonSubOpcao = styled(StyledListItemButton)`
 && {
  margin-left: 20px;
 }
  `;

export const Image = styled.img `
  filter: invert(100%) drop-shadow(0 0 0.5px #FF2E63) drop-shadow(0 0 0.5px #FF2E63) drop-shadow(0 0 0.5px #FF2E63) ;
   ${StyledListItemButton}:hover & {
    filter: invert(100%) drop-shadow(0 0 0.5px #000) drop-shadow(0 0 0.5px #000) drop-shadow(0 0 0.5px #000) ;
    filter: invert(0)
  }
`;

export const StyledListItemText = styled(ListItemText)`
  .MuiTypography-root {
    font-size: 0.8rem;
    font-weight: bold;
    color: #fff;
    transition: color 0.2s ease-in-out;
  }
    ${StyledListItemButton}:hover & .MuiTypography-root {
    color: #000;
  }
`;

export const Button = styled.button<{open: boolean}>`
width: 5rem;
height: 2rem;
margin-top: 8px;
border-radius: 5px;
border: none;
transition: all 0.5s ease-in-out;
font-size: 1rem;
font-family: Verdana, Geneva, Tahoma, sans-serif;
font-weight: 600;
display: ${props => props.open ? 'none' : 'flex'};
align-items: center;
background: #040f16;
color: #f5f5f5;
position: relative; 
cursor: pointer;
&:hover {
  box-shadow: 0 0 20px 0px #2e2e2e3a;
}

.icon {
  position: absolute;
  height: 25px;
  width: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.5s;
}

.text {
  transform: translateX(30px);
  font-size: 12px;
}

&:hover .icon {
  width: 100px;
}

&:hover .text {
  transition: all 0.5s;
  opacity: 0;
}

&:focus {
  outline: none;
}

&:active .icon {
  transform: scale(0.85);
}
`;

export const Icon = styled(IoIosArrowUp)<{ opensubopcao: string }>`
  font-size: 25px;
  color: #ffff;
  transform: ${({ opensubopcao }) => (opensubopcao === 'true' ? 'rotate(180deg)' : 'none')};
  transition: transform 0.3s linear;

  ${StyledListItemButton}:hover & {
    color: black;
  }
`;

