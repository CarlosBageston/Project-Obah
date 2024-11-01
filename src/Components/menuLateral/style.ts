import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import styled from "styled-components";

export const BoxTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const StyledListItemButton = styled(ListItemButton)`
  && {
    margin-top: 1rem;
    :hover {
        background-color: #050042;
    }
  }
`;

export const Image = styled.img `
  filter: invert(100%) ;
`;

export const StyledListItemText = styled(ListItemText)`
  .MuiTypography-root {
    font-size: 0.8rem;
    font-weight: bold;
    color: #fff;
    transition: color 0.2s ease-in-out;
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
background: #0a0269;
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

