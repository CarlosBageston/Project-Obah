import { useState } from 'react';
import { InputField, InputWrapper, LabelWrapper, ErrorMessage, LabelChar } from './style'

interface InputProps {
  key?: React.Key | null | undefined;
  name: string;
  label: string;
  value: string | number | readonly string[] | undefined | Date;
  maxLength?: number;
  error: string | undefined;
  style?: React.CSSProperties;
  styleDiv?: React.CSSProperties;
  styleLabel?: React.CSSProperties;
  onInput?: React.FormEventHandler<HTMLInputElement>;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean | undefined;
  onFocus?: boolean | undefined;
  ref?: ((instance: HTMLInputElement | null) => void) | React.RefObject<HTMLInputElement> | null | undefined;
  raisedLabel?: boolean;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement> | undefined;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement> | undefined;
  onKeyPress?: React.KeyboardEventHandler<HTMLInputElement> | undefined
}

/**
 * Input Component
 * 
 * Este componente exibe um campo de entrada de texto personalizado com um rótulo, estilização e manipulação de eventos.
 * Ele pode ser utilizado para capturar dados de entrada do usuário.
 * O componente permite a personalização de várias propriedades, como o valor, o nome, o rótulo, o estilo, o máximo de caracteres, entre outros.
 * Também oferece recursos como tratamento de erros, preenchimento automático e desabilitação do campo.
 * 
 * @param label O rótulo exibido acima do campo de entrada.
 * @param value O valor atual do campo de entrada.
 * @param onChange A função de callback chamada quando o valor do campo é alterado.
 * @param name O nome atribuído ao campo de entrada.
 * @param error A mensagem de erro exibida abaixo do campo, caso exista algum erro.
 * @param onBlur A função de callback chamada quando o campo perde o foco.
 * @param style O estilo CSS aplicado ao campo de entrada.
 * @param maxLength O número máximo de caracteres permitidos no campo de entrada.
 * @param styleLabel O estilo CSS aplicado ao rótulo.
 * @param onInput A função de callback chamada quando há entrada de dados no campo.
 * @param styleDiv O estilo CSS aplicado à div que envolve o componente.
 * @param key Uma chave única para o componente.
 * @param disabled Indica se o campo de entrada está desabilitado.
 * @param onFocus Indica se o campo de entrada está com foco.
 * @param ref Uma referência para o campo de entrada.
 * @param raisedLabel Indica se o rótulo deve ser exibido em relevo.
 * @param onKeyUp A função de callback chamada quando uma tecla é liberada no campo de entrada.
 * @param onKeyDown A função de callback chamada quando uma tecla é pressionada no campo de entrada.
 * @param onKeyPress A função de callback chamada quando uma tecla é pressionada e liberada no campo de entrada.
 * 
 * @returns Retorna o componente de campo de entrada personalizado.
 */

function Input({
  label,
  value,
  onChange,
  name,
  error,
  onBlur,
  style,
  maxLength,
  styleLabel,
  onInput,
  styleDiv,
  key,
  disabled,
  onFocus,
  ref,
  raisedLabel,
  onKeyUp,
  onKeyDown,
  onKeyPress,
}: InputProps) {
  const [isFilled, setIsFilled] = useState(false);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFilled(!!event.target.value);
    onBlur && onBlur(event);
  };

  const hasError = !!error;
  const labelClass = `${hasError ? 'error' : ''} ${isFilled ? 'filled' : ''}`;


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsFilled(event.target.value !== '');
    onChange(event);
  };
  return (
    <InputWrapper
      style={styleDiv}
    >
      <InputField
        key={key}
        type="text"
        value={value instanceof Date ? value.toLocaleDateString() : value}
        onChange={handleInputChange}
        name={name}
        onBlur={handleBlur}
        style={style}
        maxLength={maxLength}
        onInput={onInput}
        disabled={disabled}
        autoFocus={onFocus}
        ref={ref}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        onKeyPress={onKeyPress}
      />
      <LabelWrapper
        className={labelClass}
        style={styleLabel}
        isDisabled={disabled}
        raisedLabel={raisedLabel}
      >
        {label.split('').map((char, index) => (
          <LabelChar key={index} raised={raisedLabel} style={{ '--index': String(index) }}>
            {char}
          </LabelChar>
        ))}
      </LabelWrapper>
      {hasError && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

export default Input;