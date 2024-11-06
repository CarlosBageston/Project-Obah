/* eslint-disable @typescript-eslint/no-unused-vars */
import { Table, TableBody, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, IconButton, TableCell, Tooltip } from '@mui/material';
import { CSSProperties, Dispatch, SetStateAction, useEffect, useState } from 'react';
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
import SituacaoProduto from '../../enumeration/situacaoProduto';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
    setEditData?: Dispatch<SetStateAction<T | undefined>>
    checkStock?: boolean
    pageSize?: number
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
    deleteData,
    setEditData,
    checkStock,
    pageSize
}: TableProps<T>) => {
    const [selectedRowId, setSelectedRowId] = useState<string | undefined>(undefined);
    const [selected, setSelected] = useState<T>();
    const [data, setData] = useState<any[]>([]);
    const [dataTotal, setDataTotal] = useState<any[]>([]);
    const [dataTotalFiltered, setDataTotalFiltered] = useState<any[]>([]);
    const [appliedFilters, setAppliedFilters] = useState<any[]>([]);
    const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot | null>(null);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
    const [page, setPage] = useState(1);
    const dispatch = useDispatch();
    const loading = useSelector((state: RootState) => state.loading.getItemPaginationLoading);
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [openDelete, setOpenDelete] = useState<boolean>(false);

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

    const fetchPageData = async (direction: 'next' | 'previous' = 'next', filters: any[] = []) => {
        const cursor = direction === 'next' ? lastVisible : firstVisible;
        const appliedQueryFilters = filters.length > 0 ? filters : appliedFilters;
        const result = await getItemsByPage(
            collectionName ?? '',
            [...constraints ?? [], ...appliedQueryFilters],
            dispatch, pageSize ? pageSize : 5,
            cursor,
            direction
        );

        setDataTotal((prevData) => [
            ...prevData,
            ...result.data.filter(item => !prevData.some(existingItem => existingItem.id === item.id))
        ]);
        if (appliedQueryFilters.length > 0) {
            setDataTotalFiltered((prevData) => [
                ...prevData,
                ...result.data.filter(item => !prevData.some(existingItem => existingItem.id === item.id))
            ]);
        }
        // Se filtros foram aplicados, usa os dados filtrados para a navegação
        const dataSource = appliedQueryFilters.length > 0 ? dataTotalFiltered : dataTotal;


        if (direction === 'next') {
            setData(result.data);
        } else {
            const startIndex = (page - 2) * (pageSize ?? 5);
            const endIndex = startIndex + (pageSize ?? 5);
            const newData = dataSource.slice(startIndex, endIndex);
            setData(newData);
        }

        setFirstVisible(result.firstVisible);
        setLastVisible(result.lastVisible);

        setHasNextPage(result.hasMore);

    };
    useEffect(() => {
        setHasPreviousPage(page > 1);
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
        if (editData && selected && editData !== selected) {
            const refID: string = (selected as any).id ?? '';
            const index = data.findIndex((item: T) => (item as any).id === refID);
            const updatedDataTable = [
                ...data.slice(0, index),
                editData,
                ...data.slice(index + 1),
            ];
            setData(updatedDataTable);
            setEditData && setEditData(undefined);
            setSelectedRowId(undefined);
            setSelected(undefined)
        }
        if (editData && !selected && data.length < 5) {
            setData(prov => [...prov, editData]);
            setEditData && setEditData(undefined);
            setSelectedRowId(undefined);
            setSelected(undefined)
        }
        if (editData && !selected && data.length >= 5) {
            setEditData && setEditData(undefined);
            setSelectedRowId(undefined);
            setSelected(undefined)
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

    useEffect(() => {
        if (checkStock) {
            if (data.length > 0) {
                const updatedData = data.map(item => {
                    const isBelowMin = item.qntMinima > item.quantidade;
                    return {
                        ...item,
                        stEstoque: isBelowMin
                            ? (item.tpProduto === SituacaoProduto.FABRICADO ? 'Fabricar' : 'Comprar')
                            : 'Bom'
                    };
                });
                setData(updatedData);
            }
        }
    }, [data, checkStock]);

    return (
        <>
            <ContainerFilter>
                <GenericFilter
                    carregarDados={setRecarregue}
                    setAppliedFilters={setAppliedFilters}
                    setPage={setPage}
                    fetchPageData={fetchPageData}
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row) => {
                                    const rowId = row.id;
                                    const isSelected = selectedRowId === rowId;
                                    return (
                                        <StyledTableRow
                                            key={rowId}  // Usando rowId para garantir que a chave seja única
                                            onClick={() => handleRowClick(rowId, row)}
                                            selected={isSelected}
                                        >
                                            {columns.map((column) => (
                                                <StyledTableCell key={column.name}>
                                                    {column.isCurrency
                                                        ? (row[column.name] != null
                                                            ? NumberFormatForBrazilianCurrency(row[column.name])
                                                            : '-')
                                                        : column.isInfinite && row.stEstoqueInfinito ? '∞'
                                                            : row[column.name] || '-'}
                                                </StyledTableCell>
                                            ))}
                                        </StyledTableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        mt: 2
                    }}
                >
                    <IconButton
                        onClick={handlePreviousPage}
                        disabled={!hasPreviousPage}
                        sx={{ mx: 1 }}
                    >
                        <Tooltip title="Anterior">
                            <ChevronLeftIcon />
                        </Tooltip>
                    </IconButton>
                    <IconButton
                        onClick={handleNextPage}
                        disabled={!hasNextPage}
                        sx={{ mx: 1 }}
                    >
                        <Tooltip title="Proximo">
                            <ChevronRightIcon />
                        </Tooltip>
                    </IconButton>
                </Box>
            </ContainerTable>
        </>
    );
};

export default GenericTable;