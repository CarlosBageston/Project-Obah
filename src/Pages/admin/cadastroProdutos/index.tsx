/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Yup from 'yup';
import { db } from "../../../firebase";
import ProdutoModel from "./model/produtos";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import { useFormik } from 'formik';
import { useState, useEffect } from "react";
import EstoqueModel from '../estoque/model/estoque';
import ComprasModel from '../compras/model/compras';
import GenericTable from "../../../Components/table";
import { useDispatch, useSelector } from 'react-redux';
import { setMessage } from '../../../store/reducer/reducer';
import SituacaoProduto from "../../../enumeration/situacaoProduto";
import { addDoc, collection, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import { Box, Checkbox, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Typography, } from "@mui/material";


//hooks
import { useNavigate } from 'react-router-dom';
import AlertDialog from '../../../Components/FormAlert/dialogForm';
import { ProdutosSemQuantidadeError, calculateTotalValue } from '../../../hooks/useCalculateTotalValue';
import { RootState } from '../../../store/reducer/store';
import { getItemsByQuery, getSingleItemByQuery } from '../../../hooks/queryFirebase';
import CollapseListProduct from '../../../Components/collapse/collapseListProduct';
import CustomSnackBar, { StateSnackBar } from '../../../Components/snackBar/customsnackbar';
import { formatDescription } from '../../../utils/formattedString';
import { useTableKeys } from '../../../hooks/tableKey';
import { setLoadingGlobal } from '../../../store/reducer/loadingSlice';
import { convertToNumber, formatCurrency, formatCurrencyRealTime, NumberFormatForBrazilianCurrency } from '../../../hooks/formatCurrency';


function CadastroProduto() {
    const [key, setKey] = useState<number>(0);
    const [errorQuantidade, setErrorQuantidade] = useState<string>();
    const [editData, setEditData] = useState<ProdutoModel>();
    const [isVisibleTpProuto, setIsVisibleTpProduto] = useState<boolean>(false);
    const [deleteData, setDeleteData] = useState<boolean>();
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const loadingGlobal = useSelector((state: RootState) => state.loading.loadingGlobal);
    const tableKeys = useTableKeys();

    const history = useNavigate();
    const dispatch = useDispatch();
    const { message: error } = useSelector((state: RootState) => state.user);



    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ProdutoModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues: {
            cdProduto: '',
            nmProduto: '',
            vlUnitario: 0,
            vlVendaProduto: 0,
            tpProduto: null,
            stEntrega: false,
            mpFabricado: [],
            stMateriaPrima: false,
            kgProduto: 1,
            nmProdutoFormatted: ''
        },
        validationSchema: Yup.object().shape({
            nmProduto: Yup.string().required('Campo obrigatório'),
            cdProduto: Yup.string()
                .required('Campo obrigatório')
                .test('valueUnique', 'Esse código já está cadastrado', async (value) => {
                    if (editData) return true;
                    if (!value) return false;
                    const { data } = await getItemsByQuery(tableKeys.Produtos, [where('cdProduto', '==', value)], dispatch);
                    if (data && data.length > 0) return false;
                    return true;
                }),
            vlUnitario: Yup.string().required('Campo obrigatório').test('stMateriaPrima1', 'Campo obrigatório', function (value, context) {
                const { parent } = context;
                if (parent.stMateriaPrima) return true
                const numericValue = value.replace(/[^\d]/g, '');
                return parseFloat(numericValue) > 0
            }),
            vlVendaProduto: Yup.string().required('Campo obrigatório').test('stMateriaPrima', 'Campo obrigatório', function (value, context) {
                const { parent } = context;
                if (parent.stMateriaPrima) return true
                const numericValue = value.replace(/[^\d]/g, '');
                return parseFloat(numericValue) > 0
            }),
            tpProduto: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório'),
            mpFabricado: Yup.array().test("array vazio", 'Campo obrigatório', function (value) {
                const tpProduto = this.resolve(Yup.ref('tpProduto'));
                if (tpProduto === SituacaoProduto.FABRICADO && (!value || value.length === 0)) return false;
                return true;
            }).nullable()
        }),
        onSubmit: editData ? handleEditRow : handleSubmitForm,
    });
    /**
     * Envia o formulário, realizando a lógica de conversão de moeda e atualizando o histórico de compras.
     */
    async function handleSubmitForm() {
        dispatch(setLoadingGlobal(true))
        values.vlVendaProduto = convertToNumber(values.vlVendaProduto.toString())
        values.vlUnitario = convertToNumber(values.vlUnitario.toString())
        if (values.mpFabricado.length > 0) {
            values.mpFabricado.forEach(mp => {
                const quantidade = mp.quantidade ? parseFloat(mp.quantidade.toString().replace(',', '.')) : 0;
                return mp.quantidade = quantidade;
            });
        }
        await addDoc(collection(db, tableKeys.Produtos), {
            ...values
        })
            .then(() => {
                setOpenSnackBar(prev => ({ ...prev, success: true }))
                setEditData(values)
            })
            .catch(() => {
                dispatch(setMessage('Erro ao Cadastrar Produto'))
                setOpenSnackBar(prev => ({ ...prev, error: true }))
            })
            .finally(() => dispatch(setLoadingGlobal(false)));
        resetForm()
        setFieldValue('tpProduto', null)
        setKey(Math.random());
    }

    /**
     * Exclui uma linha da tabela e do banco de dados.
     * 
     * Este método exclui a entrada correspondente na coleção "Produtos" e, se aplicável, na coleção "Estoque".
     * Após a exclusão, atualiza o estado da tabela.
     */
    async function handleDeleteRow(selected: ProdutoModel | undefined) {
        if (selected) {
            dispatch(setLoadingGlobal(true))
            const refID: string = selected.id ?? '';
            await deleteDoc(doc(db, tableKeys.Produtos, refID));
            const stock = await getSingleItemByQuery<EstoqueModel>(tableKeys.Estoque, [where('nmProduto', '==', selected.nmProduto)], dispatch)
            if (stock) {
                const refIdEstoque: string = stock.id ?? ''
                await deleteDoc(doc(db, tableKeys.Estoque, refIdEstoque))
            }
            setDeleteData(true)
            dispatch(setLoadingGlobal(false))
        }
    }
    /**
     * Edita uma linha da tabela e do banco de dados.
     * 
     * Este método atualiza o documento correspondente na coleção "Produtos" com os dados da linha editada.
     * Após a edição, atualiza o estado da tabela.
     */
    async function handleEditRow() {
        dispatch(setLoadingGlobal(true))
        const refID: string = values.id ?? '';
        const refTable = doc(db, tableKeys.Produtos, refID);
        if (typeof values.vlUnitario === 'string') {
            values.vlUnitario = convertToNumber(values.vlUnitario)
        }
        values.vlVendaProduto = convertToNumber(values.vlVendaProduto.toString())
        await updateDoc(refTable, { ...values })
            .then(() => {
                setEditData(values)
            });
        resetForm()
        setFieldValue('tpProduto', null)
        setKey(Math.random());
        dispatch(setLoadingGlobal(false))
    }

    /**
     * calcular o valor total e atualizar o estado durante a edição ou criação.
     * 
     * calcula e atualiza o valor total com base nos dados fornecidos, considerando se é uma edição ou criação.
     * Se ocorrer um erro durante o cálculo, como a ausência de quantidade em produtos, ele captura e trata a exceção.
     */
    useEffect(() => {
        const calcularValorTotal = async () => {
            let somaFormat = 0.00;
            try {
                if (editData && values.mpFabricado.length > 0) {
                    somaFormat = await calculateTotalValue(values.mpFabricado, dispatch, tableKeys);
                    setFieldValue('vlUnitario', formatCurrency(somaFormat.toString()));
                } else if (values.mpFabricado.length > 0) {
                    somaFormat = await calculateTotalValue(values.mpFabricado, dispatch, tableKeys);
                    setFieldValue('vlUnitario', formatCurrency(somaFormat.toString()));
                }
            } catch (error) {
                if (error instanceof ProdutosSemQuantidadeError) {
                    setErrorQuantidade(error.produtosSemQuantidade);
                }
            }
        };

        calcularValorTotal();
    }, [values.mpFabricado, editData]);

    /**
     * controla a visibilidade do tipo de produto.
     * 
     * atualiza o estado para controlar a visibilidade do tipo de produto com base no valor selecionado.
     */
    useEffect(() => {
        if (values.tpProduto === SituacaoProduto.FABRICADO) return setIsVisibleTpProduto(true)
        return setIsVisibleTpProduto(false)
    }, [values.tpProduto])

    /**
     * ajusta o tipo de produto com base no status de matéria-prima.
     * 
     * ajusta dinamicamente o tipo de produto com base no status de matéria-prima, 
     * atualizando o campo correspondente no formulário.
     */
    useEffect(() => {
        if (values.tpProduto === SituacaoProduto.FABRICADO) return;
        if (values.stMateriaPrima) { setFieldValue('tpProduto', SituacaoProduto.COMPRADO); }
    }, [values.stMateriaPrima])


    return (
        <Box sx={{ padding: '5rem' }}>
            <Typography variant="h4" gutterBottom>Cadastro de Novos Produtos</Typography>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Input
                        key={`nmProduto-${key}`}
                        label="Nome"
                        name="nmProduto"
                        onBlur={handleBlur}
                        value={values.nmProduto}
                        onChange={e => {
                            setFieldValue(e.target.name, e.target.value)
                            setFieldValue('nmProdutoFormatted', formatDescription(e.target.value));
                        }}
                        error={touched.nmProduto && errors.nmProduto ? errors.nmProduto : ''}
                    />
                </Grid>
                <Grid item xs={2}>
                    <Input
                        key={`cdProduto-${key}`}
                        name="cdProduto"
                        onBlur={handleBlur}
                        label="Código do Produto"
                        value={values.cdProduto}
                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                        error={touched.cdProduto && errors.cdProduto ? errors.cdProduto : ''}
                    />
                </Grid>


                <Grid item xs={3}>
                    <Input
                        key={`vlUnitario-${key}`}
                        label="Valor Pago"
                        onBlur={handleBlur}
                        name="vlUnitario"
                        disabled={values.tpProduto === SituacaoProduto.FABRICADO || values.stMateriaPrima}
                        value={values.vlUnitario && values.vlUnitario.toString() !== "R$ 0,00" ? values.vlUnitario : ''}
                        onChange={e => setFieldValue(e.target.name, formatCurrencyRealTime(e.target.value))}
                        error={touched.vlUnitario && errors.vlUnitario ? errors.vlUnitario : ''}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Input
                        key={`vlVendaProduto-${key}`}
                        label="Valor Venda"
                        onBlur={handleBlur}
                        name="vlVendaProduto"
                        value={values.vlVendaProduto ? values.vlVendaProduto : ''}
                        onChange={e => setFieldValue(e.target.name, formatCurrencyRealTime(e.target.value))}
                        error={touched.vlVendaProduto && errors.vlVendaProduto ? errors.vlVendaProduto : ''}
                        disabled={values.stMateriaPrima}
                    />
                </Grid>
                <Grid item xs={2}>
                    <FormControl fullWidth variant="standard">
                        <InputLabel id="standard-label">Situação produto</InputLabel>
                        <Select
                            key={`tpProduto-${key}`}
                            name='tpProduto'
                            id="standard"
                            onBlur={handleBlur}
                            label="Selecione..."
                            labelId="standard-label"
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            value={values.tpProduto ?? ''}
                        >
                            <MenuItem value={SituacaoProduto.FABRICADO}>Fabricado</MenuItem>
                            <MenuItem value={SituacaoProduto.COMPRADO}>Comprado</MenuItem>
                        </Select>
                        {touched.tpProduto && errors.tpProduto && (
                            <div style={{ color: 'red' }}>{errors.tpProduto}</div>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={2} >
                    <FormControl fullWidth variant="standard">
                        <InputLabel>Rendimento Em Kg</InputLabel>
                        <Select
                            disabled={values.tpProduto === null || values.tpProduto === SituacaoProduto.COMPRADO}
                            value={values.kgProduto}
                            onChange={e => setFieldValue('kgProduto', e.target.value)}
                        >
                            {Array.from({ length: 15 }, (_, index) => index + 1).map(value => (
                                <MenuItem key={value} value={value}>{`${value} Kg`}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={5} >
                    <FormControlLabel
                        style={{ height: '70px' }}
                        control={<Checkbox checked={values.stEntrega} onChange={(e) => setFieldValue("stEntrega", e.target.checked)} />}
                        label="Venda atacado?"
                    />
                    <FormControlLabel
                        style={{ height: '70px' }}
                        control={<Checkbox checked={values.stMateriaPrima} onChange={(e) => setFieldValue("stMateriaPrima", e.target.checked)} />}
                        label="Matéria-Prima ?"
                    />
                </Grid>
            </Grid>

            <CollapseListProduct<ComprasModel>
                isVisible={isVisibleTpProuto}
                searchMateriaPrima
                nameArray='mpFabricado'
                collectionName={tableKeys.Produtos}
                initialItems={values.mpFabricado}
                labelAutoComplete='Materia-Prima'
                setFieldValueExterno={setFieldValue}
                typeValueInput='number'
            />

            <AlertDialog
                open={errorQuantidade ? true : false}
                messege={<p>Produtos <b>{errorQuantidade}</b> estão com o estoque vazio. Por favor, Atualize o estoque desses produtos antes de continuar.</p>}
                labelButtonOk='Ok'
                title='Alerta'
                onOKClick={() => { setErrorQuantidade(undefined); history('/atualizar-estoque') }}
            />

            <Box mt={4} display="flex" justifyContent="flex-end">
                <Button
                    label={editData ? 'Atualizar' : 'Cadastrar'}
                    type="button"
                    disabled={loadingGlobal}
                    onClick={handleSubmit}
                    style={{ width: '12rem', height: '4rem' }}
                />
            </Box>

            <GenericTable<ProdutoModel>
                columns={[
                    { label: 'Código', name: 'cdProduto', shouldApplyFilter: true },
                    { label: 'Nome', name: 'nmProduto', shouldApplyFilter: true },
                    { label: 'Valor Venda', name: 'vlVendaProduto', isCurrency: true },
                    { label: 'Valor Pago', name: 'vlUnitario', isCurrency: true },
                ]}
                collectionName={tableKeys.Produtos}
                onEdit={(row: ProdutoModel | undefined) => {
                    if (!row) return;
                    setEditData(row);
                    setFieldValue('cdProduto', row.cdProduto);
                    setFieldValue('nmProduto', row.nmProduto);
                    setFieldValue('vlVendaProduto', NumberFormatForBrazilianCurrency(row.vlVendaProduto));
                    setFieldValue('vlUnitario', row.mpFabricado.length > 0 ? row.vlUnitario : NumberFormatForBrazilianCurrency(row.vlUnitario));
                    setFieldValue('kgProduto', row.kgProduto);
                    setFieldValue('tpProduto', row.tpProduto);
                    setFieldValue('stMateriaPrima', row.stMateriaPrima);
                    setFieldValue('mpFabricado', row.mpFabricado);
                    setFieldValue('id', row.id);
                    setFieldValue('nmProdutoFormatted', row.nmProdutoFormatted);
                }}
                editData={editData}
                setEditData={setEditData}
                deleteData={deleteData}
                onDelete={(selected: ProdutoModel | undefined) => handleDeleteRow(selected)}
            />
            <CustomSnackBar message={error ? error : "Cadastrado Produto com sucesso"} open={openSnackBar} setOpen={setOpenSnackBar} />
        </Box>
    );
}

export default CadastroProduto;