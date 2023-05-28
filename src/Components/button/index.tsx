import { ReactNode } from 'react';
import { StyledButton } from './style'


export interface ButtonProps {
    onClick?: () => void;
    children: ReactNode,
    type: "button" | "submit" | "reset",
    style?: React.CSSProperties,
    disabled?: boolean | undefined
}


function Button({ children, onClick, type, style, disabled }: ButtonProps) {
    return (
        <StyledButton
            onClick={onClick}
            type={type}
            style={style}
            disabled={disabled}
        >
            {children}
        </StyledButton>
    );
}

export default Button;