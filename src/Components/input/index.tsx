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