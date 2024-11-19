import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface InputProps extends Omit<TextFieldProps, 'error' | 'helperText'> {
    label: string;
    error?: string;
    heightDiv?: number | string;
    maxLength?: number;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    heightDiv,
    maxLength,
    ...rest
}) => {
    return (
        <div style={{ height: heightDiv || '70px' }}>
            <TextField
                label={label}
                error={!!error}
                helperText={error}
                InputLabelProps={{ shrink: Boolean(rest.value) }}
                variant="standard"
                fullWidth
                inputProps={{ maxLength }}
                {...rest}
            />
        </div>
    );
};

export default Input;
