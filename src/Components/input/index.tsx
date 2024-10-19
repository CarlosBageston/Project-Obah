import React from 'react';
import { TextField } from '@mui/material';

interface InputProps {
    key?: React.Key | null | undefined;
    name: string;
    label: string;
    value: string | number | readonly string[] | undefined | Date;
    maxLength?: number;
    error?: string;
    style?: React.CSSProperties;
    styleLabel?: React.CSSProperties;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean | undefined;
    onFocus?: boolean | undefined;
    inputRef?: ((instance: HTMLInputElement | null) => void) | React.RefObject<HTMLInputElement> | null | undefined;
    type?: React.HTMLInputTypeAttribute | undefined;
    onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>;
}

const Input: React.FC<InputProps> = ({
    label,
    value,
    onChange,
    name,
    error,
    onBlur,
    style,
    maxLength,
    disabled,
    inputRef,
    onKeyUp,
    onKeyDown,
    onKeyPress,
    type,
    key
}) => {
    return (
        <div style={{ height: '70px' }}>
            <TextField
                key={key}
                label={label}
                value={value instanceof Date ? value.toLocaleDateString() : value}
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                type={type || 'text'}
                error={!!error}
                helperText={error}
                inputProps={{ maxLength }}
                InputLabelProps={{ shrink: Boolean(value) }}
                disabled={disabled}
                inputRef={inputRef}
                onKeyUp={onKeyUp}
                onKeyDown={onKeyDown}
                onKeyPress={onKeyPress}
                variant="standard"
                fullWidth
                sx={style}
            />
        </div>
    );
};

export default Input;
