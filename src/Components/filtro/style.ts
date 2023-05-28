import { Button } from "@mui/material";
import styled, { keyframes } from "styled-components";

export const ContainerFilter = styled.div`
display: flex;
`;

export const ContainerInput = styled.div<{isVisible: boolean}>`
display: none;
width: 18rem;
${({ isVisible }) =>
    isVisible &&
    `
      margin-right: 10px;
      display: block;
      animation: slide-right 1s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    `}
@keyframes slide-right {
  0% {
            transform: translateX(-100px);
  }
  100% {
            transform: translateX(10px);
  }
}
`;

export const ContainerButton = styled.div`
margin-top: 6px
`;


const flipOut = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform:  scale(0);
    opacity: 0;
  }
`;
const flipEnter = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

export const StyledButton = styled(Button)`
  opacity: 1;
  position: absolute;
  left: 0%;

  &:hover {
    opacity: 0.8;
  }

  &.flip-out {
    animation: ${flipOut} 1s linear forwards;
  }
  `;


export const ButtonFilter = styled(Button)`

  &:hover {
    opacity: 0.8;
  }

  &.flip-out {
    animation: ${flipOut} 1s linear forwards;
  }
  &.flip-enter {
    animation: ${flipEnter} 1s linear forwards;
  }
  `;