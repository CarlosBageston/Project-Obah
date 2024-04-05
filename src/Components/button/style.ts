import styled, { keyframes } from "styled-components";

const sh02 = keyframes`
  from {
    opacity: 0;
    left: 0%;
  }

  50% {
    opacity: 1;
  }

  to {
    opacity: 0;
    left: 100%;
  }
`;

export const StyledButton = styled.button`
  position: relative;
  padding: 10px 20px;
  border-radius: 7px;
  border: 1px solid ${props => props.theme.paletteColor.primaryBlue};
  font-size: 14px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 2px;
  background: transparent;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 0 0 0 transparent;
  transition: all 0.2s ease-in;
  cursor: pointer;
  background-color: #5078fe;
  box-shadow: 2px 2px 12px 1px ${props => props.theme.paletteColor.secundBlue};

  &:hover {
    background: ${props => props.theme.paletteColor.primaryBlue};
    box-shadow: 0 0 8px 1px ${props => props.theme.paletteColor.secundBlue};
    transition: all 0.2s ease-out;
    color: #fff;
    transform: translateY(-2px);
  }

  &:hover::before {
    animation: ${sh02} 0.5s 0s linear;
  }

  &::before {
    content: '';
    display: block;
    width: 0px;
    height: 86%;
    position: absolute;
    top: 7%;
    left: 0%;
    opacity: 0;
    background: #fff;
    box-shadow: 0 0 50px 30px #fff;
    transform: skewX(-20deg);
    
  }

  &:active {
    box-shadow: 0 0 0 0 transparent;
    transition: box-shadow 0.2s ease-in;
  }
  :disabled {
  &:hover{
    background: ${props => props.theme.paletteColor.secundDisabled};
    box-shadow: 0px 0px 0px 0px transparent;
    transition: none;
    color: #fff;
    transform: translateY(0px);
  }
  &:hover::before {
    animation: none;
  }
  cursor: default;
  background: ${props => props.theme.paletteColor.secundDisabled};
  opacity: 0.8;
  border: 1px solid ${props => props.theme.paletteColor.secundDisabled};
  box-shadow: 0px 0px 0px 0px transparent;
}
`;