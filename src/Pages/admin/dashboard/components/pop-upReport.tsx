import { Autocomplete, TextField } from "@mui/material"
import { ContainerFlutuante } from "./style"
import Button from "../../../../Components/button"
import { useEffect, useState } from "react";
import { format, subMonths } from "date-fns";
import { generateReport } from "../../../../hooks/report-excel";

interface PopUpReportProps {
    open: boolean;
    DadosPorMesLine: any[]
    DadosPorMesVertical: any[]
}

export default function PopUpReport({ open, DadosPorMesLine, DadosPorMesVertical }: PopUpReportProps) {
    const [months, setMonths] = useState<string[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    useEffect(() => {
        generateLastSixMonths();
    }, []);

    const generateLastSixMonths = () => {
        const currentDate = new Date();
        const monthsArray = Array.from({ length: 12 }, (_, index) =>
            format(subMonths(currentDate, index), 'MM/yyyy')
        );
        setMonths(monthsArray);
    };
    const handleGenerateReport = () => {
        const valueMesLine = DadosPorMesLine.find(mes => mes.month === selectedMonth)
        const valueMesVertical = DadosPorMesVertical.find(mes => mes.month === selectedMonth)
        generateReport(valueMesLine.valorTotal, valueMesVertical.valorTotal, selectedMonth);
    };
    return (
        <>
            {open ?
                <ContainerFlutuante>
                    <h2>Referente ao Mês</h2>
                    <Autocomplete
                        sx={{ width: '80%' }}
                        id="tags-standard"
                        options={months}
                        getOptionLabel={(month: string) => { return month; }}
                        onChange={(e, newValue) => {
                            setSelectedMonth(newValue ?? "");
                            console.log(newValue); // Adicione este console.log
                        }}
                        ListboxProps={{ style: { maxHeight: 150 } }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Relatório do Mês"
                                placeholder="Selecione o mês."
                            />
                        )}
                    />
                    <Button type="button" label="Gerar" onClick={() => handleGenerateReport()} />
                </ContainerFlutuante>
                : null
            }
        </>
    )
}