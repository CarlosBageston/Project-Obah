import { Table, TableBody, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { CSSProperties, useState } from 'react';
import {
    ContainerTable,
    StyledTableCell,
    StyledTableRow,
    ContainerButtons,
    Button,
    ButtonEdit,
    BsTrashStyled,
    FiEditStyled
} from './style';


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
    onSelectedRow?: (row: any) => void;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    isDisabled?: boolean;
    isVisibleEdit?: boolean;
    isVisibledDelete?: boolean;
};

const GenericTable = ({ columns, data, isLoading, error, styleDiv, onSelectedRow, onDelete, onEdit, isDisabled, isVisibleEdit, isVisibledDelete }: TableProps) => {
    const [selectedRowId, setSelectedRowId] = useState<string | undefined>(undefined);

    const handleRowClick = (rowId: string, row: any) => {
        if (typeof onSelectedRow === 'function') {
            if (rowId === selectedRowId) {
                setSelectedRowId(undefined);
                onSelectedRow(undefined);
            } else {
                setSelectedRowId(rowId);
                onSelectedRow(row);
            }
        }
    };
    if (error) {
        return <p>{error}</p>;
    }

    return (
        <>
            <ContainerButtons>
                <Button onClick={() => onDelete?.(onSelectedRow)} isDisabled={isDisabled} isVisibledDelete={isVisibledDelete} >
                    <BsTrashStyled isDisabled={isDisabled} />
                </Button>
                <ButtonEdit onClick={() => onEdit?.(onSelectedRow)} isDisabled={isDisabled} isVisibleEdit={isVisibleEdit} >
                    <FiEditStyled isDisabled={isDisabled} />
                </ButtonEdit>
            </ContainerButtons>
            <ContainerTable style={styleDiv}>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead >
                            <TableRow>
                                {columns.map((column) => (
                                    <StyledTableCell key={column.name} >{column.label}</StyledTableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row) => {
                                const rowId = row.id;
                                const isSelected = selectedRowId === rowId;
                                return isLoading ? (
                                    <></>
                                ) : (
                                    <StyledTableRow
                                        key={rowId}
                                        onClick={() => handleRowClick(rowId, row)}
                                        selected={isSelected}
                                    >
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
        </>
    );
};

export default GenericTable;