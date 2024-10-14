/* eslint-disable @typescript-eslint/no-unused-vars */
import { Table, TableBody, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import { CSSProperties, useEffect, useState } from 'react';
import {
    ContainerTable,
    StyledTableCell,
    StyledTableRow,
    ContainerButtons,
    Button,
    ButtonEdit,
    BsTrashStyled,
    FiEditStyled,
    ContainerFilter
} from './style';
import useFormatCurrency from '../../hooks/formatCurrency';
import { getItemsByPage } from '../../hooks/queryFirebase';
import { deleteDoc, doc, QueryConstraint, QueryDocumentSnapshot } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/reducer/store';
import GenericFilter from '../filtro';
import { db } from '../../firebase';
import ModalDelete from '../FormAlert/modalDelete';

type TableColumn = {
    name: string;
    label: string;
    isCurrency?: boolean
    isInfinite?: boolean
    shouldApplyFilter?: boolean
};

type TableProps<T> = {
    columns: TableColumn[];
    styleDiv?: CSSProperties | undefined
    onEdit?: (row: T | undefined, data: any[]) => void;
    onDelete?: (row: T | undefined, data: any[]) => void;
    isVisibleEdit?: boolean;
    isVisibledDelete?: boolean;
    collectionName: string;
    constraints?: QueryConstraint[]
    editData?: T
    deleteData?: boolean
};


const GenericTable = <T,>({
    columns,
    styleDiv,
    onEdit,
    onDelete,
    isVisibleEdit,
    isVisibledDelete,
    collectionName,
    constraints,
    editData,
    deleteData
}: TableProps<T>) => {
    const [selectedRowId, setSelectedRowId] = useState<string | undefined>(undefined);
    const [selected, setSelected] = useState<T>();
    const [data, setData] = useState<any[]>([]);
    const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot | null>(null);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
    const [page, setPage] = useState(0);
    const dispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.loading.getItemPaginationLoading);
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [openDelete, setOpenDelete] = useState<boolean>(false);

    const pageSize = 5;
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);

    const { NumberFormatForBrazilianCurrency } = useFormatCurrency();

    const handleRowClick = (rowId: string, row: any) => {
        if (rowId === selectedRowId) {
            setSelectedRowId(undefined);
            setSelected(undefined)
        } else {
            setSelectedRowId(rowId);
            setSelected(row)
        }
    };

    useEffect(() => {
        if (recarregue) {
            fetchPageData();
        }
    }, [recarregue]);

    const fetchPageData = async (direction: 'next' | 'previous' = 'next') => {
        const cursor = direction === 'next' ? lastVisible : firstVisible;
        const result = await getItemsByPage(collectionName ?? '', constraints ?? [], dispatch, pageSize, cursor, direction);

        setData(result.data);
        setFirstVisible(result.firstVisible);
        setLastVisible(result.lastVisible);

        setHasNextPage(result.hasMore);

    };
    useEffect(() => {
        setHasPreviousPage(page > 0);
    }, [page])
    const handleNextPage = () => {
        setPage(prev => prev + 1);
        fetchPageData('next');
    };

    const handlePreviousPage = () => {
        setPage(prev => prev - 1);
        fetchPageData('previous');
    };

    const columnsToFilter = columns.filter(column => column.shouldApplyFilter);

    useEffect(() => {
        if (editData && editData !== selected) {
            const refID: string = (selected as any).id ?? '';
            const index = data.findIndex((item: T) => (item as any).id === refID);
            const updatedDataTable = [
                ...data.slice(0, index),
                editData,
                ...data.slice(index + 1),
            ];
            setData(updatedDataTable);
        }
    }, [editData])

    useEffect(() => {
        if (deleteData) {
            const newDataTable = data.filter(row => row.id !== (selected as any).id);
            setData(newDataTable);
        }
    }, [deleteData])

    async function handleDeleteRow() {
        if (selected) {
            const refID: string = (selected as any).id ?? '';
            await deleteDoc(doc(db, collectionName, refID)).then(() => {
                const newDataTable = data.filter((row) => (row as any).id !== refID);
                setData(newDataTable);
            });
        }
        setOpenDelete(false)
        setSelected(undefined);
    }

    function handleDelete(row: T | undefined, data: any[]) {
        if (onDelete) onDelete(row, data)
        setOpenDelete(false)
    }

    return (
        <>
            <ContainerFilter>
                <GenericFilter
                    setFilteredData={setData}
                    carregarDados={setRecarregue}
                    collectionName={collectionName}
                    filter={columnsToFilter.map(column => ({
                        label: column.label,
                        values: column.name
                    }))}
                    setLastVisible={setLastVisible}
                />
            </ContainerFilter>
            <ModalDelete open={openDelete} onDeleteClick={() => onDelete ? handleDelete(selected, data) : handleDeleteRow()} onCancelClick={() => setOpenDelete(false)} />
            <ContainerButtons>
                <Button onClick={() => setOpenDelete(true)} isdisabled={!selected} isVisibledDelete={isVisibledDelete} >
                    <BsTrashStyled isdisabled={!selected} />
                </Button>
                <ButtonEdit onClick={() => onEdit?.(selected, data)} isdisabled={!selected} isVisibleEdit={isVisibleEdit} >
                    <FiEditStyled isdisabled={!selected} />
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
                                return loading ? (
                                    <>
                                        <CircularProgress />
                                    </>
                                ) : (
                                    <StyledTableRow
                                        key={Math.random()}
                                        onClick={() => handleRowClick(rowId, row)}
                                        selected={isSelected}
                                    >
                                        {columns.map((column) => (
                                            <StyledTableCell key={column.name}>
                                                {column.isCurrency
                                                    ? (column.name.split('.').reduce((obj, key) => obj?.[key], row) != null
                                                        ? NumberFormatForBrazilianCurrency(column.name.split('.').reduce((obj, key) => obj?.[key], row))
                                                        : '-')
                                                    : column.isInfinite && row.stEstoqueInfinito ? '∞'
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <button onClick={handlePreviousPage} disabled={!hasPreviousPage}>
                        Anterior
                    </button>
                    <button onClick={handleNextPage} disabled={!hasNextPage}>
                        Próximo
                    </button>
                </div>
            </ContainerTable>
        </>
    );
};

export default GenericTable;