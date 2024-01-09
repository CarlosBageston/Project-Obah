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
import useFormatCurrency from '../../hooks/formatCurrency';

type TableColumn = {
    name: string;
    label: string;
    isCurrency?: boolean
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
    isdisabled?: boolean;
    isVisibleEdit?: boolean;
    isVisibledDelete?: boolean;
};

/**
 * Componente de tabela genérica que exibe dados em colunas e linhas.
 * 
 * @param columns - As colunas da tabela.
 * @param data - Os dados a serem exibidos na tabela.
 * @param isLoading - Indica se a tabela está em processo de carregamento.
 * @param error - Mensagem de erro, caso ocorra.
 * @param styleDiv - Estilos CSS para o container da tabela.
 * @param onSelectedRow - Função chamada ao selecionar uma linha da tabela.
 * @param onDelete - Função chamada ao excluir uma linha da tabela.
 * @param onEdit - Função chamada ao editar uma linha da tabela.
 * @param isdisabled - Indica se os botões de excluir e editar estão desabilitados.
 * @param isVisibleEdit - Indica se o botão de editar está visível.
 * @param isVisibledDelete - Indica se o botão de excluir está visível.
 * 
 * @returns O componente da tabela genérica.
 */

const GenericTable = ({ columns, data, isLoading, error, styleDiv, onSelectedRow, onDelete, onEdit, isdisabled: isdisabled, isVisibleEdit, isVisibledDelete }: TableProps) => {
    const [selectedRowId, setSelectedRowId] = useState<string | undefined>(undefined);

    const { NumberFormatForBrazilianCurrency } = useFormatCurrency();

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
                <Button onClick={() => onDelete?.(onSelectedRow)} isdisabled={isdisabled} isVisibledDelete={isVisibledDelete} >
                    <BsTrashStyled isdisabled={isdisabled} />
                </Button>
                <ButtonEdit onClick={() => onEdit?.(onSelectedRow)} isdisabled={isdisabled} isVisibleEdit={isVisibleEdit} >
                    <FiEditStyled isdisabled={isdisabled} />
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
                                                {column.isCurrency // ta errado isso aqui, ta formatando errado.
                                                    ? NumberFormatForBrazilianCurrency(column.name.split('.').reduce((obj, key) => obj?.[key], row))
                                                    : column.name.split('.').reduce((obj, key) => obj?.[key], row)
                                                }
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