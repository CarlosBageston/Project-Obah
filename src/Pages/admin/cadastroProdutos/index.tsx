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
import { TableKey } from '../../../types/tableName';
import GenericTable from "../../../Components/table";
import { useDispatch, useSelector } from 'react-redux';
import FormAlert from "../../../Components/FormAlert/formAlert";
import { setLoading } from '../../../store/reducer/reducer';
import SituacaoProduto from "../../../enumeration/situacaoProduto";
import CompraHistoricoModel from '../compras/model/comprahistoricoModel';
import { addDoc, collection, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, } from "@mui/material";


import {
    Box,
    Title,
    DivInput,
    ContainerInputs,
    ContainerButton,
    DivSituacaoProduto,
} from './style';

//hooks
import { useNavigate } from 'react-router-dom';
import useFormatCurrency from '../../../hooks/formatCurrency';
import AlertDialog from '../../../Components/FormAlert/dialogForm';
import { ProdutosSemQuantidadeError, calculateTotalValue } from '../../../hooks/useCalculateTotalValue';
import { RootState } from '../../../store/reducer/store';
import { getItemsByQuery, getSingleItemByQuery } from '../../../hooks/queryFirebase';
import CollapseListProduct from '../../../Components/collapse/collapseListProduct';

const objClean: ProdutoModel = {
    cdProduto: '',
    nmProduto: '',
    vlUnitario: 0,
    vlVendaProduto: 0,
    tpProduto: null,
    stEntrega: false,
    mpFabricado: [],
    stMateriaPrima: false,
    kgProduto: 1
}

function CadastroProduto() {
    const [key, setKey] = useState<number>(0);
    const [error, setError] = useState<string>();
    const [editData, setEditData] = useState<ProdutoModel>();
    const [isVisibleTpProuto, setIsVisibleTpProduto] = useState<boolean>(false);
    const [submitForm, setSubmitForm] = useState<boolean>();
    const [initialValues, setInitialValues] = useState<ProdutoModel>({ ...objClean });
    const [deleteData, setDeleteData] = useState<boolean>();

    const history = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state: RootState) => state.user);
    const { convertToNumber, formatCurrency, formatCurrencyRealTime, NumberFormatForBrazilianCurrency } = useFormatCurrency();



    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ProdutoModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmProduto: Yup.string().required('Campo obrigatório'),
            cdProduto: Yup.string()
                .required('Campo obrigatório')
                .test('valueUnique', 'Esse código já está cadastrado', async (value) => {
                    if (editData) return true;
                    if (!value) return false;
                    const { data } = await getItemsByQuery(TableKey.Produtos, [where('cdProduto', '==', value)], dispatch);
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
     * Limpa o estado, redefinindo os valores iniciais e gerando uma nova chave aleatória.
     */
    function cleanState() {
        setInitialValues({
            cdProduto: '',
            nmProduto: '',
            vlUnitario: 0,
            vlVendaProduto: 0,
            tpProduto: null,
            stEntrega: false,
            mpFabricado: [],
            stMateriaPrima: false,
            kgProduto: 1
        })
        setKey(Math.random());
    }

    /**
     * Salva um Historico de Compras para que essa tabela tenha todos os produtos salvos e com valores atualizados.
     * @param valuesUpdate objeto que ta sendo atualizado o estoque
     */
    async function savePurchaseHistory(valuesUpdate: ProdutoModel) {
        const filteredValuesUpdate: CompraHistoricoModel = {
            nmProduto: valuesUpdate.nmProduto,
            cdProduto: valuesUpdate.cdProduto,
            vlUnitario: valuesUpdate.vlUnitario,
            mpFabricado: valuesUpdate.mpFabricado ? valuesUpdate.mpFabricado : [],
            qntMinima: null,
            tpProduto: valuesUpdate.tpProduto,
            stMateriaPrima: valuesUpdate.stMateriaPrima,
            kgProduto: valuesUpdate.kgProduto,
            nrOrdem: 1
        }
        await addDoc(collection(db, TableKey.CompraHistorico), {
            ...filteredValuesUpdate
        })
    }

    /**
     * Envia o formulário, realizando a lógica de conversão de moeda e atualizando o histórico de compras.
     */
    async function handleSubmitForm() {
        dispatch(setLoading(true))
        values.vlVendaProduto = convertToNumber(values.vlVendaProduto.toString())
        values.vlUnitario = convertToNumber(values.vlUnitario.toString())
        if (values.mpFabricado.length > 0) {
            values.mpFabricado.forEach(mp => {
                const quantidade = mp.quantidade ? parseFloat(mp.quantidade.toString().replace(',', '.')) : 0;
                return mp.quantidade = quantidade;
            });
        }
        savePurchaseHistory(values)
        await addDoc(collection(db, TableKey.Produtos), {
            ...values
        })
            .then(() => {
                dispatch(setLoading(false))
                setSubmitForm(true);
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            })
            .catch(() => {
                dispatch(setLoading(false))
                setSubmitForm(false);
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            });
        resetForm()
        setFieldValue('tpProduto', null)
        cleanState()
    }

    /**
     * Exclui uma linha da tabela e do banco de dados.
     * 
     * Este método exclui a entrada correspondente na coleção "Produtos" e, se aplicável, na coleção "Estoque".
     * Após a exclusão, atualiza o estado da tabela.
     */
    async function handleDeleteRow(selected: ProdutoModel | undefined, data: ProdutoModel[]) {
        if (selected) {
            const refID: string = selected.id ?? '';
            await deleteDoc(doc(db, TableKey.Produtos, refID));
            const stock = await getSingleItemByQuery<EstoqueModel>(TableKey.Estoque, [where('nmProduto', '==', selected.nmProduto)], dispatch)
            if (stock) {
                const refIdEstoque: string = stock.id ?? ''
                await deleteDoc(doc(db, TableKey.Estoque, refIdEstoque))
            }
            const historyCompra = await getSingleItemByQuery<ComprasModel>(TableKey.CompraHistorico, [where('nmProduto', '==', selected.nmProduto)], dispatch)
            if (historyCompra) {
                const refIdHistory: string = historyCompra.id ?? ''
                await deleteDoc(doc(db, TableKey.CompraHistorico, refIdHistory))
            }
            setDeleteData(true)
        }
    }

    /**
     * Edita uma linha da tabela e do banco de dados.
     * 
     * Este método atualiza o documento correspondente na coleção "Produtos" com os dados da linha editada.
     * Após a edição, atualiza o estado da tabela.
     */
    async function handleEditRow() {
        const refID: string = values.id ?? '';
        const refTable = doc(db, TableKey.Produtos, refID);

        if (JSON.stringify(values) !== JSON.stringify(initialValues)) {
            if (typeof values.vlUnitario === 'string') {
                values.vlUnitario = convertToNumber(values.vlUnitario)
            }
            values.vlVendaProduto = convertToNumber(values.vlVendaProduto.toString())
            await updateDoc(refTable, { ...values })
                .then(() => {
                    setEditData(values)
                });
        }
        resetForm()
        setFieldValue('tpProduto', null)
        cleanState()
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
                    somaFormat = await calculateTotalValue(values.mpFabricado, dispatch);
                    setFieldValue('vlUnitario', formatCurrency(somaFormat.toString()));
                } else if (values.mpFabricado.length > 0) {
                    somaFormat = await calculateTotalValue(values.mpFabricado, dispatch);
                    setFieldValue('vlUnitario', formatCurrency(somaFormat.toString()));
                }
            } catch (error) {
                if (error instanceof ProdutosSemQuantidadeError) {
                    setError(error.produtosSemQuantidade);
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

    const handleAddItem = (item: ComprasModel) => {
        setFieldValue('mpFabricado', [...values.mpFabricado, item]);
    };

    const handleRemoveItem = (item: ComprasModel) => {
        setFieldValue('mpFabricado', values.mpFabricado.filter(i => i.nmProduto !== item.nmProduto));
    };
    const handleEditItem = (item: ComprasModel) => {
        setFieldValue('mpFabricado', values.mpFabricado.map(i => i.nmProduto === item.nmProduto ? item : i));
    }
    console.log(values.mpFabricado)
    return (
        <Box>
            <Title>Cadastro de Novos Produtos</Title>
            <ContainerInputs>
                <DivInput>
                    <Input
                        key={`nmProduto-${key}`}
                        label="Nome"
                        name="nmProduto"
                        onBlur={handleBlur}
                        value={values.nmProduto}
                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                        error={touched.nmProduto && errors.nmProduto ? errors.nmProduto : ''}
                    />
                    <Input
                        key={`cdProduto-${key}`}
                        name="cdProduto"
                        onBlur={handleBlur}
                        label="Código do Produto"
                        value={values.cdProduto}
                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                        error={touched.cdProduto && errors.cdProduto ? errors.cdProduto : ''}
                    />
                    <DivSituacaoProduto>
                        <FormControl
                            variant="standard"
                            sx={{ mb: 2, minWidth: 120 }}
                            style={{ width: '13rem', display: 'flex', justifyContent: 'center', marginRight: '12px' }}
                        >
                            <InputLabel style={{ color: '#4d68af', fontWeight: 'bold', paddingLeft: 4 }} id="standard-label">Situação do produto</InputLabel>
                            <Select
                                key={`tpProduto-${key}`}
                                name='tpProduto'
                                id="standard"
                                onBlur={handleBlur}
                                label="Selecione..."
                                labelId="standard-label"
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                value={values.tpProduto ?? ''}
                                style={{ borderBottom: '1px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            >
                                <MenuItem
                                    value={SituacaoProduto.FABRICADO}
                                >
                                    Fabricado
                                </MenuItem>
                                <MenuItem
                                    value={SituacaoProduto.COMPRADO}
                                >
                                    Comprado
                                </MenuItem>
                            </Select>
                            {touched.tpProduto && errors.tpProduto && (
                                <div style={{ color: 'red' }}>{errors.tpProduto}</div>
                            )}
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={values.stEntrega}
                                    onChange={(e) => setFieldValue("stEntrega", e.target.checked)}
                                />
                            }
                            label="Venda no atacado?"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={values.stMateriaPrima}
                                    onChange={(e) => setFieldValue("stMateriaPrima", e.target.checked)}
                                />
                            }
                            label="Matéria-Prima ?"
                        />
                    </DivSituacaoProduto>
                </DivInput>
                <DivInput>
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
                    <Input
                        key={`vlUnitario-${key}`}
                        label="Valor Pago"
                        onBlur={handleBlur}
                        name="vlUnitario"
                        disabled={values.tpProduto === SituacaoProduto.FABRICADO || values.stMateriaPrima}
                        value={values.vlUnitario && values.vlUnitario.toString() !== "R$ 0,00" ? values.vlUnitario : ''}
                        onChange={e => setFieldValue(e.target.name, formatCurrencyRealTime(e.target.value))}
                        error={touched.vlUnitario && errors.vlUnitario ? errors.vlUnitario : ''}
                    />
                    {values.tpProduto === SituacaoProduto.FABRICADO ?
                        <FormControl
                            variant="standard"
                            style={{ width: '13rem', display: 'flex', justifyContent: 'center', marginTop: '10px' }}
                        >
                            <InputLabel style={{ color: '#4d68af', fontWeight: 'bold' }}>Redimento Em Kg</InputLabel>
                            <Select
                                style={{ borderBottom: '1px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                                value={values.kgProduto}
                                label="Age"
                                onChange={e => setFieldValue('kgProduto', e.target.value)}
                            >
                                {Array.from({ length: 15 }, (_, index) => index + 1).map(value => (
                                    <MenuItem key={value} value={value}>{`${value} Kg`}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        : null
                    }
                </DivInput>
            </ContainerInputs>
            <CollapseListProduct<ComprasModel>
                isVisible={isVisibleTpProuto}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onEditItem={handleEditItem}
                collectionName={TableKey.Produtos}
                initialItems={values.mpFabricado}
            />
            <AlertDialog
                open={error ? true : false}
                messege={
                    <p>
                        Produtos <b>{error}</b> estão com o estoque vazio. Por favor, Atualize o estoque desses produtos antes de continuar.
                    </p>
                }
                labelButtonOk='Ok'
                title='Alerta'
                onOKClick={() => { setError(undefined); history('/atualizar-estoque') }}
            />
            <ContainerButton>
                <Button
                    label={editData ? 'Atualizar' : 'Cadastrar'}
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    style={{ margin: '1rem 4rem 2rem 95%', height: '4rem', width: '12rem' }}
                />

                <FormAlert submitForm={submitForm} name={'Produto'} styleLoadingMarginTop='-7rem' />
            </ContainerButton>

            {/*Tabala */}
            <GenericTable<ProdutoModel>
                columns={[
                    { label: 'Código', name: 'cdProduto', shouldApplyFilter: true },
                    { label: 'Nome', name: 'nmProduto', shouldApplyFilter: true },
                    { label: 'Valor Venda', name: 'vlVendaProduto', isCurrency: true },
                    { label: 'Valor Pago', name: 'vlUnitario', isCurrency: true },
                ]}
                setEditData={setEditData}
                collectionName={TableKey.Produtos}
                onEdit={(row: ProdutoModel | undefined) => {
                    if (!row) return;
                    setEditData(row);
                    setFieldValue('cdProduto', row.cdProduto);
                    setFieldValue('nmProduto', row.nmProduto);
                    setFieldValue('vlVendaProduto', row.vlVendaProduto);
                    setFieldValue('vlUnitario',
                        row.mpFabricado.length > 0 ?
                            row.vlUnitario
                            :
                            NumberFormatForBrazilianCurrency(row.vlUnitario));
                    setFieldValue('kgProduto', row.kgProduto);
                    setFieldValue('tpProduto', row.tpProduto);
                    setFieldValue('stMateriaPrima', row.stMateriaPrima);
                    setFieldValue('mpFabricado', row.mpFabricado);
                    setFieldValue('id', row.id);
                }}
                editData={editData}
                deleteData={deleteData}
                onDelete={(selected: ProdutoModel | undefined, data: any[]) => handleDeleteRow(selected, data)}
            />
        </Box>
    );
}

export default CadastroProduto;