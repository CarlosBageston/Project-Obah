import styled from "styled-components";
import {ButtonProps} from './index'


export const StyledButton = styled.button<ButtonProps>`
  height: 2rem;
  width: 8rem;
  background-image: ${
  props => props.primary ? 'linear-gradient(135deg, #f34079 40%, #fc894d)' 
  : 
  'linear-gradient(135deg, rgb(2 6 173 / 78%) 40%, rgb(67 52 218 / 70%))'
  };
  border: 0;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-size: ${props => props.fontSize}px;
  font-weight: 700;
  padding-left: 20px;
  padding-right: 20px;
  margin: 10px;

&:active {
  outline: 0;
}
&:hover { 
  transform: scale(.99);
  opacity: .95;
}
:disabled {
  &:hover{
    transform: scale(1);
  }
  opacity: 0.8;
    cursor: default;
    background-image: linear-gradient(135deg, rgb(164 157 159) 40%, rgb(145 143 143));
  opacity: 0.8;
  cursor: default;
}
`;