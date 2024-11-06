import * as Yup from 'yup';
import moment from 'moment';
import { useFormik } from 'formik';
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import { EntregaModel } from "./model/entrega";
import GetData from "../../../firebase/getData";
import Button from "../../../Components/button";
import { AiTwotonePrinter } from 'react-icons/ai';
import GenericTable from "../../../Components/table";
import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from "react";
import { NotaFiscal } from '../../../Components/notaFiscal';
import ClienteModel from "../cadastroClientes/model/cliente";
import formatDate from "../../../Components/masks/formatDate";
import TelaDashboard from '../../../enumeration/telaDashboard';
import { setError, setLoading } from '../../../store/reducer/reducer';
import { addDoc, collection } from "firebase/firestore";
import { Autocomplete, AutocompleteChangeReason, Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";

//hooks
import useEstoque from '../../../hooks/useEstoque';
import useFormatCurrency from '../../../hooks/formatCurrency';
import useDeleteOldData from '../../../hooks/useDeleteOldData';
import { useCalculateValueDashboard } from '../../../hooks/useCalculateValueDashboard';
import useDebouncedSuggestions from '../../../hooks/useDebouncedSuggestions';
import CustomSnackBar, { StateSnackBar } from '../../../Components/snackBar/customsnackbar';
import { RootState } from '../../../store/reducer/store';
import { useTableKeys } from '../../../hooks/tableKey';
import { formatDescription } from '../../../utils/formattedString';



function Entregas() {
    const [key, setKey] = useState<number>(0);
    const [editData, setEditData] = useState<EntregaModel>();
    const [shouldShow, setShouldShow] = useState<boolean>(false);
    const [recarregueDashboard, setRecarregueDashboard] = useState<boolean>(true);
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const error = useSelector((state: RootState) => state.user.error);

    const dispatch = useDispatch();
    const { NumberFormatForBrazilianCurrency, convertToNumber } = useFormatCurrency();
    const { removedStock } = useEstoque();
    const { calculateValueDashboard } = useCalculateValueDashboard(recarregueDashboard, setRecarregueDashboard);
    const { deleteEntregas } = useDeleteOldData()
    const tableKeys = useTableKeys();

    const {
        dataTable: dataTableEntregas,
        setDataTable: setDataTableEntregas
    } = GetData(tableKeys.Entregas, true) as { dataTable: EntregaModel[], setDataTable: (data: EntregaModel[]) => void };


    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<EntregaModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues: {
            vlLucro: 0,
            vlEntrega: 0,
            dtEntrega: null,
            quantidades: [],
            cliente: null,
            nmCliente: '',
            produtos: [],
        },
        validationSchema: Yup.object().shape({
            vlLucro: Yup.string().optional(),
            vlEntrega: Yup.string().required('Campo obrigatório'),
            dtEntrega: Yup.string().required('Campo obrigatório'),
        }),
        onSubmit: hundleSubmitForm,
    });


    //enviando formulario
    async function hundleSubmitForm() {
        dispatch(setLoading(true))
        removedStock(values.produtos)
        values.vlEntrega = convertToNumber(values.vlEntrega.toString())
        values.vlLucro = convertToNumber(values.vlLucro.toString())
        calculateValueDashboard(values.vlEntrega, values.dtEntrega, TelaDashboard.ENTREGA, values.vlLucro)
        await addDoc(collection(db, tableKeys.Entregas), {
            ...values
        })
            .then(() => {
                dispatch(setLoading(false))
                setDataTableEntregas([...dataTableEntregas, values])
                setEditData(values)
                setOpenSnackBar(prev => ({ ...prev, success: true }))
            })
            .catch(() => {
                dispatch(setLoading(false))
                dispatch(setError('Erro ao Cadastrar Entrega'))
                setOpenSnackBar(prev => ({ ...prev, error: true }))
            });
        resetForm()
        setKey(Math.random());
        setRecarregueDashboard(true)
    }

    //manupulando evento de onchange do Select
    function handleClienteChange(_: React.SyntheticEvent<Element, Event>, value: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            resetForm()
            setFieldValue('produtos', [])
            setKey(Math.random());
        } else {
            setFieldValue('nmCliente', value.nmCliente)
            setFieldValue('produtos', value.produtos)
            setFieldValue('dtEntrega', moment(new Date()).format('DD/MM/YYYY'))
        }
    }

    //fazendo a soma dos lucros e do valor total
    useEffect(() => {
        if (!values.produtos?.length) return;

        const { sumTotal, sumLucro } = values.produtos.reduce(
            (acc, produto) => {
                const quantidade = produto.quantidade || 0;
                const vlVendaProduto = produto.vlVendaProduto || 0;
                const vlUnitario = produto.vlUnitario || 0;

                const totalProduto = quantidade * vlVendaProduto;
                produto.valorItem = totalProduto;
                const lucroProduto = (vlVendaProduto - vlUnitario) * quantidade;

                return {
                    sumTotal: acc.sumTotal + totalProduto,
                    sumLucro: acc.sumLucro + lucroProduto,
                };
            },
            { sumTotal: 0, sumLucro: 0 }
        );

        // Formatar e setar os valores
        setFieldValue('vlEntrega', NumberFormatForBrazilianCurrency(sumTotal));
        setFieldValue('vlLucro', NumberFormatForBrazilianCurrency(sumLucro));
    }, [values.produtos]);

    useEffect(() => {
        if (dataTableEntregas.length)
            deleteEntregas(dataTableEntregas)
    }, [dataTableEntregas])

    const suggestions: ClienteModel[] = useDebouncedSuggestions<ClienteModel>(formatDescription(values.nmCliente), tableKeys.Clientes, dispatch, 'Cliente');
    console.log(values.produtos)
    return (
        <Box sx={{ padding: '5rem' }}>
            <Typography variant="h4" gutterBottom>
                Cadastro de Novas Entregas
            </Typography>
            <Box sx={{ display: "flex" }}>
                <Grid container spacing={2}>
                    <Grid item xs={5} sx={{ paddingRight: 10 }}>
                        <Autocomplete
                            id="tags-standard"
                            freeSolo
                            style={{ height: '70px' }}
                            options={suggestions}
                            getOptionLabel={(option: any) => option && option.nmCliente ? option.nmCliente : ""}
                            value={suggestions.find((item: any) => item.nmCliente === values.nmCliente) || null}
                            onChange={(_, newValue, reason) => handleClienteChange(_, newValue, reason)}
                            onInputChange={(_, newInputValue, reason) => {
                                if (reason === 'clear') handleClienteChange(_, null, 'clear');
                                setFieldValue('nmCliente', newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label="Cliente"
                                    placeholder="Selecione..."
                                />
                            )}
                        />
                        <Input
                            key={`dtEntrega-${key}`}
                            maxLength={10}
                            name="dtEntrega"
                            onBlur={handleBlur}
                            label="Data da Entrega"
                            value={values.dtEntrega ?? ''}
                            onChange={e => setFieldValue(e.target.name, formatDate(e.target.value))}
                            error={touched.dtEntrega && errors.dtEntrega ? errors.dtEntrega : ''}
                        />
                    </Grid>
                    <Grid item xs={5} sx={{ paddingRight: 10 }}>
                        <Input
                            key={`vlEntrega-${key}`}
                            label="Valor Total"
                            name="vlEntrega"
                            onBlur={handleBlur}
                            value={values.vlEntrega !== 0 ? values.vlEntrega : ''}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.vlEntrega && errors.vlEntrega ? errors.vlEntrega : ''}
                            disabled
                        />
                        <Input
                            key={`vlLucro-${key}`}
                            disabled
                            label="Lucro"
                            name="vlLucro"
                            onBlur={handleBlur}
                            value={values.vlLucro !== 0 ? values.vlLucro : ''}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.vlLucro && errors.vlLucro ? errors.vlLucro : ''}
                        />
                    </Grid>
                </Grid>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%", }}>
                    <Box sx={{ height: "19rem", width: "100%", display: "flex", flexDirection: "column", mt: -1 }} >
                        <TableContainer component={Paper} className='style-scrollbar'>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nome Produto</TableCell>
                                        <TableCell>Valor Un.</TableCell>
                                        <TableCell>Valor Venda</TableCell>
                                        <TableCell>Quantidade</TableCell>
                                        <TableCell>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {values.produtos.length > 0 ? (
                                        values.produtos.map((produto, index) => (
                                            <TableRow key={produto.nmProduto}>
                                                <TableCell>{produto.nmProduto}</TableCell>
                                                <TableCell>{NumberFormatForBrazilianCurrency(produto.vlUnitario)}</TableCell>
                                                <TableCell>{NumberFormatForBrazilianCurrency(produto.vlVendaProduto)}</TableCell>

                                                {/* Célula Editável */}
                                                <TableCell>
                                                    <TextField
                                                        value={produto.quantidade || null}
                                                        onChange={(e) => {
                                                            const newQuantity = Number(e.target.value);
                                                            const updatedList = [...values.produtos];
                                                            updatedList[index] = {
                                                                ...produto,
                                                                quantidade: newQuantity
                                                            };
                                                            setFieldValue('produtos', updatedList);
                                                        }}
                                                        variant="outlined"
                                                        size="small"
                                                        type="number"
                                                        sx={{ width: '6rem' }}
                                                        fullWidth
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ width: '7rem', textAlign: 'center' }}>
                                                    {NumberFormatForBrazilianCurrency(produto.quantidade ? (produto.quantidade * produto.vlVendaProduto) : 0)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow >
                                            <TableCell colSpan={5} align="center">Selecione um Cliente</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                    </Box>

                    {shouldShow &&
                        <NotaFiscal
                            values={values}
                            setShouldShow={setShouldShow}
                            handleSubmit={handleSubmit}
                        />}
                    <Box display="flex" justifyContent="flex-end" mt={3}>
                        <Button
                            label={<AiTwotonePrinter size={30} />}
                            type='button'
                            disabled={values.dtEntrega ? false : true}
                            onClick={() => setShouldShow(true)}
                            style={{ width: '6rem', height: '4rem', marginRight: "1rem" }}
                        />
                        <Button
                            label='Cadastrar Entrega'
                            type="button"
                            onClick={handleSubmit}
                            disabled={!values.dtEntrega}
                            style={{ width: '12rem', height: '4rem' }}
                        />
                    </Box>
                </Box>
            </Box>
            {/*Tabala */}
            <GenericTable<EntregaModel>
                columns={[
                    { label: 'Nome', name: 'nmCliente', shouldApplyFilter: true },
                    { label: 'Data Entrega', name: 'dtEntrega', shouldApplyFilter: true },
                    { label: 'Valor Total', name: 'vlEntrega', isCurrency: true },
                    { label: 'Lucro', name: 'vlLucro', isCurrency: true },
                ]}
                collectionName={tableKeys.Entregas}
                isVisibleEdit
                editData={editData}
                setEditData={setEditData}
            />
            <CustomSnackBar
                message={error || "Cadastrado Entrega com sucesso"}
                open={openSnackBar}
                setOpen={setOpenSnackBar}
            />
        </Box>
    );
}

export default Entregas;