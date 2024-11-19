import { Button } from "@mui/material";
import styled, { keyframes } from "styled-components";

export const ContainerFilter = styled.div`
display: flex;
`;

export const ContainerInput = styled.div`
display: block;
width: 11rem;
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

export const ButtonFilter = styled(Button)`

  &:hover {
    opacity: 0.8;
  }

  &.flip-out {
    animation: ${flipOut} .4s linear forwards;
  }
  `;