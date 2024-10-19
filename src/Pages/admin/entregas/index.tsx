import * as Yup from 'yup';
import moment from 'moment';
import { useFormik } from 'formik';
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import { EntregaModel } from "./model/entrega";
import GetData from "../../../firebase/getData";
import Button from "../../../Components/button";
import { AiTwotonePrinter } from 'react-icons/ai';
import { TableKey } from '../../../types/tableName';
import GenericTable from "../../../Components/table";
import { useDispatch } from 'react-redux';
import React, { useState, useEffect } from "react";
import { NotaFiscal } from '../../../Components/notaFiscal';
import ClienteModel from "../cadastroClientes/model/cliente";
import formatDate from "../../../Components/masks/formatDate";
import TelaDashboard from '../../../enumeration/telaDashboard';
import FormAlert from "../../../Components/FormAlert/formAlert";
import { setLoading } from '../../../store/reducer/reducer';
import { addDoc, collection } from "firebase/firestore";
import { Autocomplete, AutocompleteChangeReason, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";

import {
    Box,
    Title,
    DivInputs,
    DivButtons,
    ContainerAll,
    DivButtonAndTable,
    ContainerTableCliente,
} from './style'

//hooks
import useEstoque from '../../../hooks/useEstoque';
import useFormatCurrency from '../../../hooks/formatCurrency';
import useDeleteOldData from '../../../hooks/useDeleteOldData';
import { useCalculateValueDashboard } from '../../../hooks/useCalculateValueDashboard';
import useDebouncedSuggestions from '../../../hooks/useDebouncedSuggestions';



function Entregas() {
    const [key, setKey] = useState<number>(0);
    const [editData, setEditData] = useState<EntregaModel>();
    const [shouldShow, setShouldShow] = useState<boolean>(false);
    const [recarregueDashboard, setRecarregueDashboard] = useState<boolean>(true);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);

    const dispatch = useDispatch();
    const { NumberFormatForBrazilianCurrency, convertToNumber } = useFormatCurrency();
    const { removedStockEntrega } = useEstoque();
    const { calculateValueDashboard } = useCalculateValueDashboard(recarregueDashboard, setRecarregueDashboard);
    const { deleteEntregas } = useDeleteOldData()

    const {
        dataTable: dataTableEntregas,
        setDataTable: setDataTableEntregas
    } = GetData(TableKey.Entregas, true) as { dataTable: EntregaModel[], setDataTable: (data: EntregaModel[]) => void };


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
        removedStockEntrega(values.produtos)
        values.vlEntrega = convertToNumber(values.vlEntrega.toString())
        values.vlLucro = convertToNumber(values.vlLucro.toString())
        calculateValueDashboard(values.vlEntrega, values.dtEntrega, TelaDashboard.ENTREGA, values.vlLucro)
        await addDoc(collection(db, TableKey.Entregas), {
            ...values
        })
            .then(() => {
                dispatch(setLoading(false))
                setSubmitForm(true)
                setDataTableEntregas([...dataTableEntregas, values])
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
                setEditData(values)
            })
            .catch(() => {
                dispatch(setLoading(false))
                setSubmitForm(false)
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            });
        resetForm()
        setKey(Math.random());
        setRecarregueDashboard(true)
    }

    //manupulando evento de onchange do Select
    function handleClienteChange(event: React.SyntheticEvent<Element, Event>, value: any, reason: AutocompleteChangeReason) {
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
    // console.log(values.produtos.length > 0)
    // console.log(values.produtos)
    const suggestions: ClienteModel[] = useDebouncedSuggestions<ClienteModel>(values.nmCliente, TableKey.Clientes, dispatch, 'Cliente');
    return (
        <Box>
            <Title>Cadastro de Novas Entregas</Title>
            <ContainerAll>
                <DivInputs>
                    <div>
                        <Autocomplete
                            id="tags-standard"
                            freeSolo
                            style={{ height: '70px' }}
                            options={suggestions}
                            getOptionLabel={(option: any) => option && option.nmCliente ? option.nmCliente : ""}
                            value={suggestions.find((item: any) => item.nmCliente === (values.cliente ? values.cliente.nmCliente : '')) || null}
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
                    </div>
                    <div>
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
                    </div>
                </DivInputs>
                <DivButtonAndTable>
                    <ContainerTableCliente >

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
                                                <TableCell>{produto.vlUnitario}</TableCell>
                                                <TableCell>{produto.vlVendaProduto}</TableCell>

                                                {/* Célula Editável */}
                                                <TableCell>
                                                    <TextField
                                                        value={produto.quantidade || 0} // Adicionando || 0 para evitar undefined
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
                                                <TableCell>
                                                    {produto.quantidade ? (produto.quantidade * produto.vlVendaProduto).toFixed(2) : 0} {/* Cálculo do total */}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">Selecione um Cliente</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                    </ContainerTableCliente>

                    {shouldShow &&
                        <NotaFiscal
                            values={values}
                            setShouldShow={setShouldShow}
                            handleSubmit={handleSubmit}
                        />}
                    <DivButtons>
                        <Button
                            label={<AiTwotonePrinter size={30} />}
                            type='button'
                            style={{ margin: '0rem 0px 2rem 0px', height: '4rem', width: '5rem' }}
                            disabled={values.dtEntrega ? false : true}
                            onClick={() => setShouldShow(true)}
                        />
                        <Button
                            label='Cadastrar Entrega'
                            type="button"
                            onClick={handleSubmit}
                            disabled={!values.dtEntrega}
                            style={{ margin: '2rem 0px 4rem 0px', height: '4rem', width: '12rem' }}
                        />
                    </DivButtons>
                </DivButtonAndTable>
            </ContainerAll>
            <FormAlert submitForm={submitForm} name={'Entregas'} styleLoadingMarginTop='-12rem' />
            {/*Tabala */}
            <GenericTable<EntregaModel>
                columns={[
                    { label: 'Nome', name: 'nmCliente', shouldApplyFilter: true },
                    { label: 'Data Entrega', name: 'dtEntrega', shouldApplyFilter: true },
                    { label: 'Valor Total', name: 'vlEntrega', isCurrency: true },
                    { label: 'Lucro', name: 'vlLucro', isCurrency: true },
                ]}
                collectionName={TableKey.Entregas}
                isVisibleEdit
                editData={editData}
                setEditData={setEditData}
            />
        </Box>
    );
}

export default Entregas;