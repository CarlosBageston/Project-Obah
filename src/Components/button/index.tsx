import { ReactNode } from 'react';
import { StyledButton } from './style'


export interface ButtonProps {
    primary?: boolean;
    onClick?: () => void;
    fontSize?: number,
    children: ReactNode,
    type: "button" | "submit" | "reset",
    style?: React.CSSProperties,
    disabled?: boolean | undefined
}


function Button({ children, primary, onClick, fontSize, type, style, disabled }: ButtonProps) {
    return (
        <StyledButton
            primary={primary}
            onClick={onClick}
            fontSize={fontSize}
            type={type}
            style={style}
            disabled={disabled}
        >
            {children}
        </StyledButton>
    );
}

export default Button;