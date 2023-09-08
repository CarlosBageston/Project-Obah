
import React from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateValidationError } from '@mui/x-date-pickers';
import { PickerChangeHandlerContext } from '@mui/x-date-pickers/internals/hooks/usePicker/usePickerValue.types';


interface CustomDatePickerProps {
    label: string;
    onChange: ((value: any, context: PickerChangeHandlerContext<DateValidationError>) => void) | undefined
    value: any
}

const DatePicker: React.FC<CustomDatePickerProps> = ({ label, onChange, value }) => {


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MUIDatePicker
                label={label}
                format='DD/MM/YYYY'
                onChange={onChange}
                value={value}
            />
        </LocalizationProvider>
    );
};

export default DatePicker;
