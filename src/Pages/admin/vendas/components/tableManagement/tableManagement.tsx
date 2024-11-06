import * as Yup from 'yup';
import Button from "../../../../../Components/button";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { TableBill } from "../tableBill/tableBill";
import VendaModel from "../../model/vendas";
import ButtonAdd from "../../../../../Components/button/buttonAdd/buttonAdd";
import TableManagemenModel from "../../model/tableManagemen";
import { Box, CircularProgress, Fade, IconButton, Paper, Typography } from "@mui/material";
import { Timestamp, addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../../firebase";
import { useDispatch, useSelector } from "react-redux";
import { setError, setLoading } from "../../../../../store/reducer/reducer";
import { useFormik } from "formik";
import { BsTrash } from "react-icons/bs";
import ModalDelete from '../../../../../Components/FormAlert/modalDelete';
import iconTable from '../../../../../assets/Icon/iconTable.png'
import { RootState } from '../../../../../store/reducer/store';
import { SubProdutoModel } from '../../../cadastroProdutos/model/subprodutos';
import CustomSnackBar, { StateSnackBar } from '../../../../../Components/snackBar/customsnackbar';
import MUIButton from "@mui/material/Button";
import { getItemsByQuery } from '../../../../../hooks/queryFirebase';
import CloseIcon from '@mui/icons-material/Close';
import Input from '../../../../../Components/input';
import { useTableKeys } from '../../../../../hooks/tableKey';



interface TableManagementProps {
    setFecharComanda: Dispatch<SetStateAction<VendaModel>>
    setShowTableManegement: Dispatch<React.SetStateAction<boolean>>
    produtoEscaniadoList: SubProdutoModel[];
    showTableManegement: boolean;
}

export function TableManagement({ setFecharComanda, setShowTableManegement, produtoEscaniadoList, showTableManegement }: TableManagementProps) {
    const [showTable, setShowTable] = useState<boolean>(false);
    const [recarregar, setRecarregar] = useState<boolean>(true);
    const [showNewTable, setShowNewTable] = useState<boolean>(false);
    const [showModalDelete, setShowModalDelete] = useState<string | undefined>(undefined);
    const [dataTableOrder, setDataTableOrder] = useState<TableManagemenModel[]>([]);
    const [dataTable, setDataTable] = useState<TableManagemenModel[]>([]);
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state: RootState) => state.user);
    const { getItemsByQueryLoading } = useSelector((state: RootState) => state.loading);
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const tableKeys = useTableKeys();

    const initialValues: TableManagemenModel = ({
        nmTable: '',
        createdAt: Timestamp.now()
    });

    const { setFieldValue, values, handleSubmit, touched, errors, resetForm } = useFormik<TableManagemenModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmTable: Yup.string().required("Campo Obrigatório").test("MesaExistente", "Essa Mesa Já Existe", (value) => {
                return !dataTable.some(data => data.nmTable === value)
            })
        }),
        onSubmit: handleSubmitForm,
    });
    useEffect(() => {
        const getItem = async () => {
            const { data } = await getItemsByQuery<TableManagemenModel>(tableKeys.Mesas, [], dispatch, 100)
            setDataTable(data)
        }
        if (recarregar)
            getItem()
    }, [recarregar])

    function handleTable(nameTable: string, id: string | undefined) {
        setFieldValue('id', id);
        setFieldValue('nmTable', nameTable);
        setShowTable(!showTable);
    }

    /**
     * Função para enviar os valores para o banco de dados.
     */
    async function handleSubmitForm(values: TableManagemenModel) {
        setRecarregar(false);
        dispatch(setLoading(true));
        await addDoc(collection(db, tableKeys.Mesas), {
            ...values,
            createdAt: Timestamp.now()
        }).then(() => {
            dispatch(setLoading(false))
            setShowNewTable(false)
        }).catch(() => {
            dispatch(setLoading(false))
            dispatch(setError('Erro ao Registrar Mesa'))
            setOpenSnackBar(prev => ({ ...prev, error: true }))
        });
        resetForm();
        setFieldValue('id', undefined);
        setFieldValue('nmTable', '');
        setRecarregar(true);
    }

    async function handleDeleteItem(id: string | undefined) {
        setRecarregar(false);
        setShowModalDelete(undefined);
        await deleteDoc(doc(db, tableKeys.Mesas, id ?? '')).then(() => {
            dispatch(setLoading(false))
        }).catch(() => {
            dispatch(setLoading(false))
            dispatch(setError('Erro ao Deletar Mesa'))
            setOpenSnackBar(prev => ({ ...prev, error: true }))
        });
        setRecarregar(true);
    }
    useEffect(() => {
        if (dataTable) {
            const sortedData = [...dataTable].sort((a, b) => {
                const dateA = a.createdAt.toDate();
                const dateB = b.createdAt.toDate();
                return dateA.getTime() - dateB.getTime();
            });
            setDataTableOrder(sortedData);
        }
    }, [dataTable]);

    function keyPressHandleSubmitForm(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter') return handleSubmit();
    }

    return (
        <Fade in={showTableManegement}>
            <Box
                sx={{
                    position: 'absolute',
                    display: 'flex',
                    width: '80%',
                    height: '70%',
                    top: '26.8%',
                    left: '9%',
                    bgcolor: '#ffffff',
                    borderRadius: 1,
                    boxShadow: '1px 4px 5px 1px rgba(0, 0, 0, 0.7)',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    flexDirection: 'column',
                    zIndex: 5,
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        height: '20%',
                        display: 'grid',
                        placeItems: 'center',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                    }}
                >
                    <ButtonAdd label="Adicionar Novas Mesas" onClick={() => { setShowNewTable(!showNewTable); }} />
                    <Typography variant="h4">Gestão Das Mesas</Typography>
                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end', alignItems: 'flex-start', height: '100%' }}>
                        <IconButton
                            onClick={() => setShowTableManegement(false)}
                            sx={{ color: 'inherit' }}
                        >
                            <CloseIcon fontSize="medium" />
                        </IconButton>
                    </Box>
                </Box>

                {showNewTable && (
                    <Fade in={showNewTable}>
                        <Paper
                            sx={{
                                position: 'absolute',
                                display: 'flex',
                                width: '20%',
                                height: '50%',
                                top: '13.5%',
                                left: '9.5%',
                                bgcolor: '#ffffff',
                                borderRadius: 1,
                                boxShadow: '1px 4px 5px 1px rgba(0, 0, 0, 0.7)',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                flexDirection: 'column',
                                zIndex: 5,
                            }}
                        >
                            <Typography variant="h5">Adicionar mesa</Typography>
                            <Input
                                value={values.nmTable}
                                error={touched.nmTable && errors.nmTable ? errors.nmTable : ""}
                                onChange={(e) => setFieldValue('nmTable', e.target.value)}
                                label="Nome/Numero Da Mesa"
                                onKeyDown={keyPressHandleSubmitForm}
                            />
                            <MUIButton variant='contained' onClick={() => handleSubmit()} disabled={loading}>
                                Adicionar
                            </MUIButton>
                        </Paper>
                    </Fade>
                )}

                <Box
                    sx={{
                        width: '100%',
                        height: '80%',
                        display: 'grid',
                        gridTemplateColumns: dataTable.length ? 'repeat(3, 1fr)' : 'none',
                        gridAutoRows: dataTable.length ? '150px' : 'none',
                        gap: '20px',
                        alignItems: 'center',
                        justifyItems: 'center',
                        overflow: 'auto',
                    }}
                >
                    {dataTableOrder.length > 0 ? (
                        dataTableOrder.map((data) => (
                            <Box key={data.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button
                                    label={data.nmTable}
                                    type="button"
                                    onClick={() => handleTable(data.nmTable, data.id)}
                                    style={{ height: 40, width: 150 }}
                                />
                                <Box
                                    sx={{
                                        p: 1,
                                        ml: 1,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: '#f3f3f394' },
                                    }}

                                    onClick={() => setShowModalDelete(data.id)}
                                >
                                    <BsTrash color="red" size={22} />
                                </Box>
                                <ModalDelete
                                    open={showModalDelete !== undefined}
                                    onCancelClick={() => setShowModalDelete(undefined)}
                                    onDeleteClick={() => handleDeleteItem(showModalDelete)}
                                />
                            </Box>
                        ))
                    ) : getItemsByQueryLoading ? <CircularProgress /> : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img src={iconTable} alt="Icon Mesas" width={150} />
                            <Typography>Nenhuma Mesa Cadastrada :/</Typography>
                        </Box>
                    )}
                </Box>
                {showTable ?
                    <TableBill
                        nameTable={values.nmTable}
                        setShowTable={setShowTable}
                        setFecharComanda={setFecharComanda}
                        setShowTableManegement={setShowTableManegement}
                        produtoEscaniadoList={produtoEscaniadoList}
                    />
                    :
                    null
                }
                <CustomSnackBar message={error} open={openSnackBar} setOpen={setOpenSnackBar} />
            </Box>
        </Fade>
    );
}