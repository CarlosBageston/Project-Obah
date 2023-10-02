import { ReactNode } from 'react';
import { StyledButton } from './style'


export interface ButtonProps {
    onClick?: () => void;
    label: ReactNode,
    type: "button" | "submit" | "reset",
    style?: React.CSSProperties,
    disabled?: boolean | undefined
}

/**
 * Button Component
 * 
 * @param onClick Função de clique do botão
 * @param label Conteúdo do botão
 * @param type Tipo do botão: "button", "submit" ou "reset"
 * @param style Estilo CSS do botão
 * @param disabled Indica se o botão está desabilitado
 */
function Button({ label: label, onClick, type, style, disabled }: ButtonProps) {
    return (
        <StyledButton
            onClick={onClick}
            type={type}
            style={style}
            disabled={disabled}
        >
            {label}
        </StyledButton>
    );
}

export default Button;