import * as Yup from 'yup';
import { useFormik } from "formik";
import { IoMdClose } from "react-icons/io";
import { db } from "../../../../../firebase";
import GetData from "../../../../../firebase/getData";
import Button from "../../../../../Components/button";
import { useDispatch, useSelector } from "react-redux";
import { TableKey } from "../../../../../types/tableName";
import { Autocomplete, AutocompleteChangeReason, Box, Dialog, Divider, Grow, IconButton, Stack, TextField, Typography } from "@mui/material";
import TableBillModel from "../../model/tableBill";
import VendaModel from "../../model/vendas";
import useFormatCurrency from "../../../../../hooks/formatCurrency";
import ProdutosModel from "../../../cadastroProdutos/model/produtos";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { setError, setLoading } from "../../../../../store/reducer/reducer";
import MUIButton from "@mui/material/Button";
import AddIcon from '@mui/icons-material/Add';

import { RootState } from '../../../../../store/reducer/store';
import { SubProdutoModel } from '../../../cadastroProdutos/model/subprodutos';
import CustomSnackBar, { StateSnackBar } from '../../../../../Components/snackBar/customsnackbar';
import { theme } from '../../../../../theme';
import CloseIcon from '@mui/icons-material/Close';
import useDebouncedSuggestions from '../../../../../hooks/useDebouncedSuggestions';

interface TableBillProps {
    nameTable: string;
    produtoEscaniadoList: SubProdutoModel[];
    setShowTable: Dispatch<SetStateAction<boolean>>;
    setFecharComanda: Dispatch<SetStateAction<VendaModel>>;
    setShowTableManegement: Dispatch<React.SetStateAction<boolean>>;
}

interface TableBill {
    nmProduto: string;
}
export function TableBill({ nameTable, setShowTable, setFecharComanda, setShowTableManegement, produtoEscaniadoList }: TableBillProps) {
    const [key, setKey] = useState<number>(0);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [openDialogVendas, setOpenDialogVendas] = useState<boolean>(false);
    const [produtoEscaniado, setProdutoEscaniado] = useState<SubProdutoModel>();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state: RootState) => state.user);
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const { NumberFormatForBrazilianCurrency } = useFormatCurrency();

    const {
        dataTable: dataTableComanda,
    } = GetData(TableKey.Comanda, true) as { dataTable: TableBillModel[] };

    const { values, handleSubmit, setFieldValue, touched, errors, resetForm } = useFormik<TableBillModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues: {
            vlTotal: 0,
            produtoEscaniado: [],
            nmTable: nameTable,
            quantidade: 0
        },
        validationSchema: Yup.object().shape({
            quantidade: Yup.string().required("Campo Obrigatório").test('vlRecebido', 'Valor Invalido', (value) => {
                const numericValue = value.replace(/[^\d]/g, '');
                return parseFloat(numericValue) > 0;
            })
        }),
        onSubmit: handleSubmitForm,
    });
    function handleAutoComplete(e: React.SyntheticEvent<Element, Event>, value: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            resetForm()
            setKey(Math.random());
        }
        if (value) {
            const novoProduto: SubProdutoModel = {
                nmProduto: value.nmProduto,
                vlVendaProduto: value.vlVendaProduto,
                vlTotalMult: 0,
                quantidade: 0,
                vlLucro: value.vlVendaProduto - value.vlUnitario,
                vlUnitario: value.vlUnitario,
                valorItem: 0
            };
            setProdutoEscaniado(novoProduto)
        }
    }
    function handleSubmitForm(values: TableBillModel) {
        if (produtoEscaniado && values.quantidade) {
            const quantidade = values.quantidade
            const updatedValues = { ...values };
            const updatedProduct: SubProdutoModel = {
                ...produtoEscaniado,
                quantidade: quantidade,
                vlTotalMult: quantidade * produtoEscaniado.vlVendaProduto,
                vlLucro: quantidade * (produtoEscaniado.vlLucro ?? 0),
                valorItem: 0,
                vlUnitario: 0,
                nmProduto: formik.values.nmProduto,
                vlVendaProduto: 0
            };
            updatedValues.produtoEscaniado.push(updatedProduct);
            resetForm();
            formik.resetForm()
            setFieldValue('produtoEscaniado', [...updatedValues.produtoEscaniado]);
            setFieldValue('id', updatedValues.id);
            setKey(Math.random())
        }
    }

    function keyPressHandleSubmitForm(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter') handleSubmit()
    }
    useEffect(() => {
        setFieldValue('vlTotal', values.produtoEscaniado.reduce((acc, value) => {
            return acc + (value.vlTotalMult ?? 0);
        }, 0))
    }, [values.produtoEscaniado])
    /**
     * Função para remover um produto do array 'produtoEscaniado'.
     * 
     * @param index - Índice do produto a ser removido.
     */
    function removedProdutoEscaneado(index: number) {
        const remove = values.produtoEscaniado.filter((_, i) => i !== index)
        setFieldValue('produtoEscaniado', remove);
    }
    /**
     * Função para enviar os valores para o banco de dados.
     */
    async function handleSubmitFormComanda(values: TableBillModel) {
        dispatch(setLoading(true))
        delete values.quantidade
        if (values.id) {
            const refID: string = values.id ?? '';
            const refTable = doc(db, TableKey.Comanda, refID);
            await updateDoc(refTable, { ...values })
                .then(() => {
                    dispatch(setLoading(false))
                    setShowTable(false)
                }).catch(() => {
                    dispatch(setLoading(false))
                    dispatch(setError('Erro ao Atualizar Comanda'))
                    setOpenSnackBar(prev => ({ ...prev, error: true }))
                });
        } else {
            await addDoc(collection(db, TableKey.Comanda), {
                ...values
            }).then(() => {
                dispatch(setLoading(false))
                setShowTable(false)
            }).catch(() => {
                dispatch(setLoading(false))
                dispatch(setError('Erro ao Registrar Comanda'))
                setOpenSnackBar(prev => ({ ...prev, error: true }))
            });
        }
    }
    /**
     * Função para enviar os valores para o banco de dados.
     */
    async function closeTableBill(values: TableBillModel) {
        if (produtoEscaniadoList.length > 0) return setOpenDialogVendas(true)
        const objetoVenda: VendaModel = {
            vlTotal: 0,
            dtProduto: null,
            vlRecebido: 0,
            vlTroco: 0,
            produtoEscaniado: values.produtoEscaniado,
            vlLucroTotal: 0
        }
        setFecharComanda(objetoVenda)
        const foundComanda = dataTableComanda.find(comanda => comanda.id === values.id)
        if (foundComanda && foundComanda.id) {
            await deleteDoc(doc(db, TableKey.Comanda, foundComanda.id))
        }
        setShowTable(false)
        setShowTableManegement(false)
    }
    useEffect(() => {
        if (dataTableComanda.length) {
            const foundTable = dataTableComanda.find(table => table.nmTable === nameTable)
            if (foundTable) {
                setFieldValue('id', foundTable.id)
                setFieldValue('produtoEscaniado', [...foundTable.produtoEscaniado])
            }
        }
    }, [dataTableComanda])
    const formik = useFormik<TableBill>({
        initialValues: {
            nmProduto: ''
        },
        onSubmit: () => { }
    })
    const suggestions: ProdutosModel[] = useDebouncedSuggestions<ProdutosModel>(formik.values.nmProduto ?? '', TableKey.Produtos, dispatch, "Produto", undefined, false);
    return (
        <Grow in={true} timeout={500}>
            <Box
                sx={{
                    position: 'absolute',
                    display: 'flex',
                    width: '40%',
                    height: '90%',
                    top: '5%',
                    left: '35%',
                    backgroundColor: '#ffffff',
                    borderRadius: 2,
                    boxShadow: 3,
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    flexDirection: 'column',
                    zIndex: 5,
                }}
            >
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                    <IconButton
                        onClick={() => setShowTable(false)}
                        sx={{ color: 'inherit' }}
                    >
                        <CloseIcon fontSize="medium" />
                    </IconButton>
                </Box>

                <Typography variant="h6" sx={{ mt: '-1rem' }}>{nameTable}</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '90%', mb: 3 }}>
                    <Stack spacing={3} sx={{ width: 250 }}>
                        <Autocomplete
                            freeSolo
                            key={key}
                            options={suggestions}
                            value={suggestions.find((item: any) => item.nmProduto === formik.values.nmProduto) || null}
                            getOptionLabel={(option: any) => option && option.nmProduto ? option.nmProduto : ""}
                            onChange={(_, newValue, reason) => handleAutoComplete(_, newValue, reason)}
                            onKeyUp={keyPressHandleSubmitForm}
                            onInputChange={(_, newInputValue, reason) => {
                                if (reason === 'clear') handleAutoComplete(_, null, 'clear');
                                formik.setFieldValue('nmProduto', newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Buscar Produto"
                                    variant="standard"
                                />
                            )}
                        />
                    </Stack>

                    <TextField
                        value={values.quantidade !== 0 ? values.quantidade : ''}
                        onChange={(e) => { setFieldValue('quantidade', (parseFloat(e.target.value))) }}
                        label="Qntde"
                        variant="standard"
                        onKeyDown={keyPressHandleSubmitForm}
                        error={Boolean(touched.quantidade && errors.quantidade)}
                        InputProps={{
                            sx: { width: '5rem' }
                        }}
                    />
                    <IconButton
                        onClick={() => handleSubmit()}
                        disabled={loading}
                        sx={{ color: 'inherit' }}
                    >
                        <AddIcon fontSize="medium" />
                    </IconButton>
                </Box>

                <Box sx={{ width: '90%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: theme.paletteColor.tertiaryBlue, fontWeight: 'bold' }}>Descrição</Typography>
                        <Typography variant="subtitle2" sx={{ color: theme.paletteColor.tertiaryBlue, fontWeight: 'bold' }}>Quantidade</Typography>
                        <Typography variant="subtitle2" sx={{ color: theme.paletteColor.tertiaryBlue, fontWeight: 'bold' }}>Valor</Typography>
                    </Box>

                    <Box sx={{
                        overflowY: 'auto',
                        width: '100%',
                        height: '13rem',
                    }}>
                        {values.produtoEscaniado.map((prod, index) => (
                            <Box key={index} component="ul" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', color: theme.paletteColor.primaryGreen, fontWeight: 'bold' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={() => removedProdutoEscaneado(index)}>
                                    <IoMdClose color={theme.paletteColor.error} />
                                    <Typography component="li" sx={{ width: '11rem', ml: 1 }}>{prod.nmProduto}</Typography>
                                </Box>
                                <Typography component="li" sx={{ marginLeft: '-6rem' }}>{prod.quantidade}</Typography>
                                <Typography component="li" sx={{ width: '5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    {NumberFormatForBrazilianCurrency(prod.vlTotalMult ?? 0)}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6"><b>Total:</b> {NumberFormatForBrazilianCurrency(values.vlTotal)}</Typography>
                </Box>

                <Dialog open={openDialog}>
                    <Typography variant="body1" component="p" sx={{ p: 3 }}>
                        Ao clicar em <b>&quot;Continuar&quot;</b>, você estará finalizando esta comanda. Não será possível acessá-la novamente. Deseja continuar?
                    </Typography>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                        <MUIButton onClick={() => setOpenDialog(false)}>Cancelar</MUIButton>
                        <MUIButton onClick={() => closeTableBill(values)}>Continuar</MUIButton>
                    </Box>
                </Dialog>

                <Dialog open={openDialogVendas}>
                    <Typography variant="body1" component="p" sx={{ p: 3 }}>
                        Há uma venda em aberto. Você será direcionado para finalizá-la antes de retornar para fechar a comanda.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <MUIButton onClick={() => { setShowTable(false); setShowTableManegement(false); }}>Ok</MUIButton>
                    </Box>
                </Dialog>

                <Box sx={{ height: '25%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', mt: 2 }}>
                    <Button
                        label="Salvar Itens da Comanda"
                        onClick={() => handleSubmitFormComanda(values)}
                        disabled={loading}
                        type='button'
                        style={{ height: 40, width: 310 }}
                    />
                    <Button
                        label="Fechar Comanda"
                        onClick={() => setOpenDialog(true)}
                        style={{ height: 40, width: 310 }}
                        disabled={loading || !values.produtoEscaniado.length}
                        type='button'
                    />
                </Box>
                <CustomSnackBar message={error} open={openSnackBar} setOpen={setOpenSnackBar} />
            </Box>
        </Grow>
    );
}