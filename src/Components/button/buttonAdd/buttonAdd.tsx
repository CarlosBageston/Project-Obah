import React from 'react';
import styled from 'styled-components';
import { MdAdd } from "react-icons/md";

const StyledButton = styled.button`
  position: relative;
  width: auto;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.theme.paletteColor.secundGreen};
  background-color: #3aa856;
  transition: all 0.3s;
  box-shadow: 5px 5px 10px -1px  ${props => props.theme.paletteColor.tertiaryGreen};
  border-radius: 4px;

  &:hover {
    background: ${props => props.theme.paletteColor.secundGreen};
    transform: translateY(-2px);
    box-shadow: 0 0 8px 1px  ${props => props.theme.paletteColor.tertiaryGreen};
  }
`;

const ButtonText = styled.div`
  padding: 0 8px 0 50px;
  width: 100%;
  color: #fff;
  font-weight: 600;
`;

const ButtonIcon = styled.div`
  position: absolute;
  height: 100%;
  width: 40px;
  background-color: ${props => props.theme.paletteColor.secundGreen};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s; 
  
  ${StyledButton}:hover & { 
    width: 100%;
  }
`;

interface ButtonProps {
    onClick: () => void;
    label: string;
    disabled?: boolean | undefined
}

const ButtonAdd = ({ label, onClick, disabled }: ButtonProps) => {
    return (
        <StyledButton disabled={disabled} type="button" onClick={onClick}>
            <ButtonText>{label}</ButtonText>
            <ButtonIcon>
                <MdAdd size={25} color='#FFFF' />
            </ButtonIcon>
        </StyledButton>
    );
};

export default ButtonAdd;
