import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import {
    ContainerTable,
    StyledTableCell,
    StyledTableRow,
} from './style'
import { CSSProperties } from 'react';


type TableColumn = {
    name: string;
    label: string;
};

type TableProps = {
    columns: TableColumn[];
    data: any[];
    isLoading: boolean;
    error?: string;
    styleDiv?: CSSProperties | undefined
};

const GenericTable = ({ columns, data, isLoading, error, styleDiv }: TableProps) => {

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <ContainerTable style={styleDiv}>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <StyledTableCell key={column.name} >{column.label}</StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => {
                            return isLoading ? (
                                <></>
                            ) : (
                                <StyledTableRow key={row.id} >
                                    {columns.map((column) => (
                                        <StyledTableCell key={column.name}>
                                            {column.name.split('.').reduce((obj, key) => obj?.[key], row)}
                                        </StyledTableCell>
                                    ))}
                                </StyledTableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </ContainerTable>
    );
};

export default GenericTable;