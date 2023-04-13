import styled, { css } from "styled-components";
declare module 'react' {
  interface CSSProperties {
    '--index'?: string;
  }
}
export const InputWrapper = styled.div`
 position: relative;
  padding: 15px 0 0;
  margin-top: 10px;
  width: 100%;
`;

export const LabelWrapper = styled.label<{ isDisabled?: boolean, raisedLabel?:boolean, filled?:boolean  }>`
  position: absolute;
  top: 0;
  left: 0;
  color: ${props => props.theme.paletteColor.colorLabel};
  pointer-events: none;
  padding-left: 4px;
  transition: all 0.2s;
  font-size: 1.5rem;
  cursor: text;
  transform: ${({ raisedLabel }) => (raisedLabel ? 'translateY(-10px)' : 'translateY(24px)')};
  opacity: ${({ isDisabled }) => isDisabled ? 0.5 : 1};

  &.filled {
    transform: translateY(-5px);
    font-size: 1.1rem;
  }
`;
export const LabelChar = styled.span<{ raised?: boolean, animate?: boolean  }>`
  transform: ${({ raised }) => (raised ? 'translateY(-10px)' : 'translateY(24px)')};
  transition: all 0.2s;
  transition-delay: calc(var(--index) * 0.05s);
  ${({ animate }) =>
    animate &&
    css`
      transition-duration: 0.5s;
      transform: translateY(-100%);
    `}
`;

export const InputField = styled.input`
  width: 100%;
  border-bottom: 2px solid ${props => props.theme.paletteColor.borderInput};
  border-top: 0;
  border-left: 0;
  border-right: 0;
  outline: 0;
  font-size: 1.3rem;
  color: black;
  padding: 8px 0 7px 4px;
  background-color: ${props => props.theme.paletteColor.backgroundInput};
  transition: border-color 0.2s;
   &::placeholder {
    color: transparent;
  }
  &:focus ~ ${LabelWrapper} {
    font-size: 1.1rem;
    cursor: text;
    transform: translateY(-5px);
  }
   &:focus {
    border-bottom: 3px solid transparent;
    border-image: linear-gradient(0.25turn, #0300ff, rgb(85 91 247), rgb(138 152 252)) 2 / 1 / 0 stretch;
    border-image-slice: 2;
    width:100%;
  }
  :disabled {
    background-color: ${props => props.theme.paletteColor.disabled};
    opacity: 0.5;
  }
`;

export const ErrorMessage = styled.p`
color: red;
`;