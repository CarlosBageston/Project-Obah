/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Yup from 'yup';
import moment from 'moment';
import { isEqual } from 'lodash';
import { useFormik } from 'formik';
import { db } from "../../../firebase";
import ComprasModel from "./model/compras";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import GetData from "../../../firebase/getData";
import { useState, useEffect, lazy } from "react";
import EstoqueModel from '../estoque/model/estoque';
import GenericTable from "../../../Components/table";
import { useDispatch, useSelector } from 'react-redux';
import FiltroGeneric from "../../../Components/filtro";
import formatDate from "../../../Components/masks/formatDate";
import TelaDashboard from '../../../enumeration/telaDashboard';
import ProdutosModel from "../cadastroProdutos/model/produtos";
import CompraHistoricoModel from './model/comprahistoricoModel';
import { InputConfig } from "../../../Components/isEdit/isEdit";
import FormAlert from "../../../Components/FormAlert/formAlert";
import { State, setLoading } from '../../../store/reducer/reducer';
import SituacaoProduto from "../../../enumeration/situacaoProduto";
import ModalDelete from '../../../Components/FormAlert/modalDelete';
import { addDoc, arrayUnion, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Autocomplete, AutocompleteChangeReason, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from "@mui/material";
const IsEdit = lazy(() => import('../../../Components/isEdit/isEdit'));

import {
    Box,
    ContainerInputs,
    DivInput,
    Title,
    ContainerButton,
} from './style'
import { BoxTitleDefault } from "../estoque/style";

//hooks
import useEstoque from '../../../hooks/useEstoque';
import { useUniqueNames } from '../../../hooks/useUniqueName';
import useFormatCurrency from '../../../hooks/formatCurrency';
import { foundKgProduto } from '../../../hooks/useFoundProductKg';
import useHandleInputKeyPress from '../../../hooks/useHandleInputKeyPress';
import { calculateTotalValue } from '../../../hooks/useCalculateTotalValue';
import { useCalculateValueDashboard } from '../../../hooks/useCalculateValueDashboard';


const objClean: ComprasModel = {
    cdProduto: '',
    nmProduto: '',
    vlUnitario: 0,
    dtCompra: null,
    quantidade: 0,
    totalPago: null,
    tpProduto: null,
    qntMinima: null,
    nrOrdem: undefined
}

function AtualizarEstoque() {
    const [key, setKey] = useState<number>(0);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const [selected, setSelected] = useState<ComprasModel | undefined>();
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [selectAutoComplete, setSelectAutoComplete] = useState<boolean>(false);
    const [recarregueDashboard, setRecarregueDashboard] = useState<boolean>(true);
    const [initialValues, setInitialValues] = useState<ComprasModel>({ ...objClean });

    const dispatch = useDispatch();
    const { loading } = useSelector((state: State) => state.user);
    const { convertToNumber, formatCurrency, formatCurrencyRealTime } = useFormatCurrency();
    const { removedStockCompras, updateStock } = useEstoque();
    const { onKeyPressHandleSubmit } = useHandleInputKeyPress();
    const { calculateValueDashboard } = useCalculateValueDashboard(recarregueDashboard, setRecarregueDashboard);

    const inputsConfig: InputConfig[] = [
        { label: 'Nome Do Produto', propertyName: 'nmProduto' },
        { label: 'Código do Produto', propertyName: 'cdProduto' },
        { label: 'Data', propertyName: 'dtCompra' },
        { label: 'Valor Unitário', propertyName: 'vlUnitario', isCurrency: true, isDisable: true },
        { label: 'Quantidade', propertyName: 'quantidade', type: 'number' },
        { label: 'Valor Total', propertyName: 'totalPago', isCurrency: true },
        { label: 'Quant. mínima em estoque', propertyName: 'qntMinima', type: 'number' },
    ];
    //Realizando busca no banco de dados
    const {
        dataTable,
        loading: isLoading,
        setDataTable
    } = GetData('Compras', recarregue) as {
        dataTable: ComprasModel[],
        loading: boolean,
        setDataTable: (data: ComprasModel[]) => void
    };
    const {
        dataTable: produtoDataTable,
    } = GetData('Produtos', recarregue) as { dataTable: ProdutosModel[] };

    const {
        dataTable: dataTableEstoque,
    } = GetData('Estoque', recarregue) as { dataTable: EstoqueModel[] };

    const {
        dataTable: dataTableCompraHistorico,
    } = GetData('Compra Historico', recarregue) as { dataTable: CompraHistoricoModel[] };

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ComprasModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmProduto: Yup.string().required('Campo obrigatório'),
            cdProduto: Yup.string().required('Campo obrigatório'),
            vlUnitario: Yup.string().required('Campo obrigatório').test('vlVendaProduto', 'Campo Obrigatório', (value) => {
                const numericValue = value.replace(/[^\d]/g, '');
                return parseFloat(numericValue) > 0;
            }),
            dtCompra: Yup.string().required('Campo obrigatório'),
            tpProduto: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório'),
            quantidade: Yup.number()
                .transform((value) => (isNaN(value) ? undefined : value))
                .test('stEstoqueInfinito', 'Campo obrigatório', function (value, context) {
                    const { parent } = context;
                    if (parent.stEstoqueInfinito) return true;
                    return value !== undefined && value > 0;
                }),
            qntMinima: Yup.number().required('Campo obrigatório').typeError('Campo obrigatório'),
            nrOrdem: Yup.number().optional().nullable()
        }),
        onSubmit: handleSubmitForm,
    });

    /**
     * Limpa o estado do formulário, resetando os valores e estados relacionados.
     */
    function cleanState() {
        setInitialValues({
            cdProduto: '',
            nmProduto: '',
            vlUnitario: 0,
            dtCompra: null,
            quantidade: 0,
            totalPago: null,
            tpProduto: null,
            qntMinima: null,
            nrOrdem: undefined
        })
        setSelectAutoComplete(false);
        setFieldValue('cdProduto', '');
        setFieldValue('vlUnitario', '');
        setFieldValue('qntMinima', '');
        setFieldValue('dtCompra', null);
        setKey(Math.random());
    }

    /**
     * Deleta uma linha da tabela e do banco de dados.
     * Deleta Da Tabela de Estoque a quantidade e a versao de acordo com o item selecionado
     */
    async function handleDeleteRow() {
        setOpenDelete(false)
        if (selected) {
            const refID: string = selected.id ?? '';
            await deleteDoc(doc(db, "Compras", refID)).then(() => {
                const newDataTable = dataTable.filter(row => row.id !== selected.id);
                setDataTable(newDataTable);
            });
            const versoesValidas = dataTableEstoque.find(stock => stock.nmProduto === selected.nmProduto)
            if (versoesValidas) {
                const refIdEstoque: string = versoesValidas.id ?? ''
                const refTable = doc(db, "Estoque", refIdEstoque);
                const versoes = versoesValidas.versaos.filter(versao => versao.versao !== selected.nrOrdem)
                const totalQuantity = versoes.reduce((accumulator, versao) => accumulator + versao.vrQntd, 0);

                await updateDoc(refTable, {
                    nmProduto: selected.nmProduto,
                    cdProduto: selected.cdProduto,
                    quantidade: totalQuantity,
                    tpProduto: selected.tpProduto,
                    qntMinima: selected.qntMinima,
                    versaos: versoes
                })
            }
        }
        setSelected(undefined)
    }

    /**
     * Retorna o histórico de compra de um produto encontrado.
     * 
     * @param nmProduto - Nome do produto.
     * @returns O histórico de compra do produto.
     */
    function foundProducts(nmProduto: string): CompraHistoricoModel {
        const foundProduct: CompraHistoricoModel = dataTableCompraHistorico.find(history => history.nmProduto === nmProduto) as CompraHistoricoModel;
        return foundProduct;
    }


    /**
     * Recalcula os valores dos produtos que estão sendo atualizados no estoque.
     * 
     * Exemplo: atualizando o chocolate, a moreninha tem em sua composição o chocolate, então se mudou o preço do chocolate,
     * ira mudar o preço da moreninha em consequencia, pois isso precisa recalcular novamente.
     * @param valuesUpdate - Valores atualizados.
     * @param produtosEncontrado - Array onde os produtos encontrados serão armazenados.
     */
    function recalculateProduct(valuesUpdate: ComprasModel, produtosEncontrado: ProdutosModel[]) {
        produtoDataTable.forEach(produto => {
            if (produto.mpFabricado.some(mp => mp.nmProduto === valuesUpdate.nmProduto)) {
                let soma = 0.0;
                // Recalcule a soma dos totalPago após a atualização
                produto.mpFabricado.forEach(item => {
                    const foundProduct = foundProducts(item.nmProduto)
                    if (item.nmProduto !== valuesUpdate.nmProduto) {
                        const foundProductUpdate = foundKgProduto(foundProduct)
                        const totalAtualizado = calculateTotalValue(item, foundProductUpdate)
                        soma += totalAtualizado
                    } else {
                        const totalAtualizado = calculateTotalValue(item, valuesUpdate)
                        soma += totalAtualizado
                    }
                });
                const newProduto = { ...produto, vlUnitario: parseFloat(soma.toFixed(2)) }
                produtosEncontrado.push(newProduto);
            }
        });
    }

    /**
     * Recalcula os preços dos produtos encontrados com base nos registros de compras.
     * 
     * Produtos que são encontrados na função recalculateProduct são recalculados aqui nesse metodo
     * pois la eles atualizam o valor do produto, porem esse produto se relaciona com outros produtos que precisam ser 
     * recalculados
     * @param produtosEncontrado - Array de produtos encontrados.
     * @param produtoAtualizados - Array onde os produtos atualizados serão armazenados.
     */
    function recalculateProductFound(produtosEncontrado: ProdutosModel[]) {
        const produtoAtualizados: ProdutosModel[] = []
        produtosEncontrado.forEach(items => {
            const foundProduct = foundProducts(items.nmProduto)
            const foundProductUpdate = foundKgProduto(foundProduct)
            if (!produtoAtualizados.includes(items)) produtoAtualizados.push(items)
            produtoDataTable.forEach(produto => {
                if (produto.mpFabricado.some(mp => mp.nmProduto.includes(items.nmProduto))) {
                    let soma = 0.0;
                    // Recalcule a soma dos totalPago após a atualização
                    produto.mpFabricado.forEach(item => {
                        if (item.nmProduto.includes(items.nmProduto)) {
                            const totalAtualizado = calculateTotalValue(item, foundProductUpdate as ComprasModel)
                            soma += totalAtualizado
                        } else {
                            const encontrado = foundProducts(item.nmProduto)
                            const totalAtualizado = calculateTotalValue(item, encontrado as ComprasModel)
                            soma += totalAtualizado
                        }
                    });
                    const newProduto = { ...produto, vlUnitario: parseFloat(soma.toFixed(2)) }
                    produtoAtualizados.push(newProduto);
                }
            });
        })
        produtosEncontrado.length = 0;
        produtosEncontrado.push(...produtoAtualizados);
    }

    /**
     * Cria ou atualiza o estoque com base nos valores fornecidos.
     * 
     * @param valuesUpdate - Valores atualizados.
     */
    async function createStock(valuesUpdate: ComprasModel) {
        const estoqueExistente = dataTableEstoque.find(
            estoque => estoque.nmProduto === valuesUpdate.nmProduto
        );
        if (estoqueExistente) {
            const refID: string = estoqueExistente.id ?? '';
            const refTable = doc(db, "Estoque", refID);
            const novaQuantidade = valuesUpdate.quantidade + estoqueExistente.quantidade;
            await updateDoc(refTable, {
                nmProduto: valuesUpdate.nmProduto,
                cdProduto: valuesUpdate.cdProduto,
                tpProduto: valuesUpdate.tpProduto,
                qntMinima: valuesUpdate.qntMinima,
                stEstoqueInfinito: valuesUpdate.stEstoqueInfinito,
                quantidade: novaQuantidade,
                versaos: arrayUnion({ versao: valuesUpdate.nrOrdem, vrQntd: valuesUpdate.quantidade })
            })
        } else {
            await addDoc(collection(db, "Estoque"), {
                nmProduto: valuesUpdate.nmProduto,
                cdProduto: valuesUpdate.cdProduto,
                tpProduto: valuesUpdate.tpProduto,
                qntMinima: valuesUpdate.qntMinima,
                stEstoqueInfinito: valuesUpdate.stEstoqueInfinito,
                quantidade: valuesUpdate.quantidade,
                versaos: [
                    { versao: valuesUpdate.nrOrdem, vrQntd: valuesUpdate.quantidade }
                ]
            })
        }
    }

    /**
     * Salva um Historico de Compras para que essa tabela tenha todos os produtos salvos e com valores atualizados.
     * @param valuesUpdate objeto que ta sendo atualizado o estoque
     */
    async function savePurchaseHistory(valuesUpdate: ComprasModel) {
        const history = dataTableCompraHistorico.find(history => history.nmProduto === valuesUpdate.nmProduto)
        const filteredValuesUpdate: Partial<CompraHistoricoModel> = {
            nmProduto: valuesUpdate.nmProduto,
            cdProduto: valuesUpdate.cdProduto,
            vlUnitario: valuesUpdate.vlUnitario,
            mpFabricado: valuesUpdate.mpFabricado ? valuesUpdate.mpFabricado : [],
            qntMinima: valuesUpdate.qntMinima ? valuesUpdate.qntMinima : null,
            tpProduto: valuesUpdate.tpProduto,
            nrOrdem: valuesUpdate?.nrOrdem
        };

        if (history) {
            const refID: string = history.id ?? '';
            const refTable = doc(db, "Compra Historico", refID);

            const { id, stMateriaPrima, kgProduto, ...historyWithoutId } = history;

            if (!isEqual(filteredValuesUpdate, historyWithoutId)) {
                await updateDoc(refTable, {
                    ...filteredValuesUpdate
                });
            }
        }
    }

    /**
    * Atualiza os valores no banco de dados.
    * @param valuesUpdate - Array de valores a serem atualizados.
    * @param nameCollection - Nome da coleção no banco de dados.
    */
    function updateValue(valuesUpdate: ProdutosModel[], nameCollection: string) {
        valuesUpdate.forEach(async item => {
            const refID: string = item.id ?? '';
            const refTable = doc(db, nameCollection, refID);
            await updateDoc(refTable, { ...item })
        })
    }

    /**
    * Atualiza o valor unitario de compra Historico no banco de dados.
    * @param valuesUpdate - Array de valores a serem atualizados.
    */
    function updateValueCompraHistorico(valuesUpdate: ProdutosModel[]) {
        valuesUpdate.forEach(async item => {
            const history = dataTableCompraHistorico.find(history => history.nmProduto === item.nmProduto)
            if (!history) return;
            const refID: string = history.id ?? '';
            const refTable = doc(db, "Compra Historico", refID);
            const updatedData = { vlUnitario: item.vlUnitario };
            await updateDoc(refTable, updatedData);
        })
    }
    /**
     * Recalcula os produtos e clientes com base nos valores fornecidos.
     * @param valuesUpdate  - Valores atualizados.
     */
    function recalculate(valuesUpdate: ComprasModel) {
        const produtosEncontrado: ProdutosModel[] = [];

        recalculateProduct(valuesUpdate, produtosEncontrado);

        recalculateProductFound(produtosEncontrado);

        updateValue(produtosEncontrado, "Produtos")
        updateValueCompraHistorico(produtosEncontrado)

    }


    /**
     * Envia o formulário para o banco de dados. 
     */
    async function handleSubmitForm() {
        dispatch(setLoading(true))
        const newNrOrdem = values.nrOrdem || values.nrOrdem === 0 ? values.nrOrdem + 1 : 0;
        const valuesUpdate: ComprasModel = {
            ...values,
            nrOrdem: newNrOrdem,
            vlUnitario: convertToNumber(values.vlUnitario.toString()),
            totalPago: values.totalPago && convertToNumber(values.totalPago?.toString())
        };
        savePurchaseHistory(valuesUpdate)
        try {
            if (valuesUpdate.tpProduto === SituacaoProduto.COMPRADO) {
                const product = foundProducts(valuesUpdate.nmProduto);
                if (product) {
                    const needUpdate = product?.vlUnitario !== valuesUpdate.vlUnitario
                    if (needUpdate && product.stMateriaPrima) recalculate(valuesUpdate)
                }
                if (product.stMateriaPrima) {
                    //Necessario atualizar o valor unitario do produto, pois ao cadastrar uma materia prima voce nao seta 
                    //o valor unitario.
                    const foundProduct = produtoDataTable.find(prod => prod.nmProduto === valuesUpdate.nmProduto)
                    if (foundProduct && foundProduct.vlUnitario !== valuesUpdate.vlUnitario) {
                        const refID: string = foundProduct.id ?? '';
                        const refTable = doc(db, "Produtos", refID);
                        const updatedData = { vlUnitario: valuesUpdate.vlUnitario };
                        await updateDoc(refTable, updatedData);
                    }
                }
                createStock(valuesUpdate)
                if (valuesUpdate.totalPago) {
                    calculateValueDashboard(valuesUpdate.totalPago, valuesUpdate.dtCompra, TelaDashboard.COMPRA)
                }
            }
            if (values.tpProduto === SituacaoProduto.FABRICADO) {
                if (valuesUpdate.stEstoqueInfinito) {
                    const infiniteStock = Number.MAX_SAFE_INTEGER
                    valuesUpdate.quantidade = infiniteStock
                } else {
                    await removedStockCompras(valuesUpdate)
                }
                createStock(valuesUpdate)
            }
        } catch (error) {
            dispatch(setLoading(false))
            setSubmitForm(false);
            console.log(error)
            setTimeout(() => { setSubmitForm(undefined) }, 3000);
            return;
        }

        await addDoc(collection(db, "Compras"), {
            ...valuesUpdate
        })
            .then(() => {
                dispatch(setLoading(false))
                setSubmitForm(true)
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
                setDataTable([...dataTable, valuesUpdate])
            })
            .catch(() => {
                dispatch(setLoading(false))
                setSubmitForm(false)
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            });
        resetForm()
        cleanState()
        setSelectAutoComplete(false);
        setRecarregueDashboard(true)
    }

    /**
     * Atualiza o valor pago ou valor Unitario, considerando a quantidade, valor unitário ou Total Pago.
     */
    useEffect(() => {
        if (isEdit && selected) {
            if (!selected.totalPago) return
            const division = convertToNumber(selected.totalPago.toString()) / selected.quantidade
            if (!isNaN(division)) {
                setSelected((prevSelected) => ({
                    ...prevSelected,
                    vlUnitario: formatCurrency(division.toString()) as unknown as number,
                } as ComprasModel | undefined));
            }
        } else {
            if (values.tpProduto === SituacaoProduto.COMPRADO) {
                if (!values.totalPago) return
                const division = convertToNumber(values.totalPago.toString()) / values.quantidade
                if (!isNaN(division)) setFieldValue('vlUnitario', formatCurrency(division.toString()))
                else setFieldValue('vlUnitario', 0)
            } else if (values.tpProduto === SituacaoProduto.FABRICADO) {
                const multiplication = convertToNumber(values.vlUnitario.toString()) * values.quantidade
                if (!isNaN(multiplication)) setFieldValue('totalPago', formatCurrency(multiplication.toString()))
                else setFieldValue('totalPago', 0)
            }
        }
    }, [values.quantidade, values.totalPago, selected?.quantidade, selected?.totalPago])

    /**
     * Edita uma linha da tabela e do banco de dados, atualizando também o estoque correspondente.
     */
    async function handleEditRow() {
        if (selected && selected.totalPago) {
            selected.vlUnitario = convertToNumber(selected.vlUnitario.toString())
            selected.totalPago = convertToNumber(selected.totalPago.toString())
            const refID: string = selected.id ?? '';
            const refTable = doc(db, "Compras", refID);
            const estoque: EstoqueModel = {
                nmProduto: selected.nmProduto,
                cdProduto: selected.cdProduto,
                qntMinima: selected.qntMinima || 0,
                quantidade: selected.quantidade,
                tpProduto: selected.tpProduto || 0,
                versaos: [],
            }
            updateStock(estoque, selected.nrOrdem)
            selected.totalPago = convertToNumber(selected.totalPago?.toString() ?? '')
            selected.vlUnitario = convertToNumber(selected.vlUnitario.toString())

            if (JSON.stringify(selected) !== JSON.stringify(initialValues)) {
                await updateDoc(refTable, { ...selected })
                    .then(() => {
                        const index = dataTable.findIndex((item) => item.id === selected.id);
                        const updatedDataTable = [
                            ...dataTable.slice(0, index),
                            selected,
                            ...dataTable.slice(index + 1)
                        ];
                        setDataTable(updatedDataTable);
                    });
            }
        }
        setIsEdit(false)
        setSelected(undefined)
    }

    /**
     * Manipula a seleção de um valor no campo de autocompletar, preenchendo os campos do formulário com os valores correspondentes.
     * @param newValue  - Novo valor selecionado.
     * @param reason - Razão da mudança.
     */
    function handleAutoComplete(newValue: ComprasModel | null, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            cleanState()
        } else if (newValue) {
            setSelectAutoComplete(true);
            setFieldValue('nrOrdem', newValue.nrOrdem);
            setFieldValue('cdProduto', newValue.cdProduto);
            setFieldValue('vlUnitario', formatCurrency(newValue.vlUnitario.toString()));
            setFieldValue('qntMinima', newValue.qntMinima);
            setFieldValue('nmProduto', newValue.nmProduto);
            setFieldValue('dtCompra', moment(new Date()).format('DD/MM/YYYY'))
            if (newValue.stMateriaPrima) {
                setFieldValue('stMateriaPrima', newValue.stMateriaPrima)
            }
            if (newValue.tpProduto === SituacaoProduto.FABRICADO) {
                setFieldValue('mpFabricado', newValue.mpFabricado)
            }
            if (newValue.stEstoqueInfinito) {
                setFieldValue("stEstoqueInfinito", newValue.stEstoqueInfinito)
            } else {
                setFieldValue("stEstoqueInfinito", false)
            }
        }
    }
    /**
     * Atualiza o Estoque infinito para false e limpa os campos, caso ocorra mudança no tipo produto
     */
    useEffect(() => { cleanState(); setFieldValue("stEstoqueInfinito", false) }, [values.tpProduto])

    return (
        <Box>
            <Title>Atualização de estoque</Title>
            <ContainerInputs>
                <DivInput>
                    <FormControl
                        variant="standard"
                        sx={{ mb: 2, minWidth: 120 }}
                        style={{ width: '13rem' }}
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
                            value={values.tpProduto}
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
                    <Autocomplete
                        options={useUniqueNames(dataTableCompraHistorico, values.tpProduto, values.tpProduto)}
                        getOptionLabel={(option: ComprasModel) => option.nmProduto || ""}
                        onChange={(e, newValue, reason) => handleAutoComplete(newValue, reason)}
                        disabled={values.tpProduto === null}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Nome do Produto"
                                variant="standard"
                                InputLabelProps={{
                                    style: {
                                        color: '#4d68af',
                                        fontSize: '24px',
                                        paddingLeft: 6,
                                    }
                                }}
                                onBlur={handleBlur}
                                onChange={(e) => {
                                    setFieldValue('nmProduto', e.target.value);
                                }}
                            />
                        )}
                        style={{
                            width: '100%',
                            backgroundColor: '#b2beed1a',
                            borderBottom: '1px solid #6e6dc0',
                        }}
                    />
                    <Input
                        key={`cdProduto-${key}`}
                        name="cdProduto"
                        onBlur={handleBlur}
                        label="Código do Produto"
                        value={values.cdProduto}
                        onChange={e => setFieldValue(e.target.name, e.target.value.replace(/[^\d]/g, ''))}
                        error={touched.cdProduto && errors.cdProduto ? errors.cdProduto : ''}
                        raisedLabel={selectAutoComplete}
                    />

                </DivInput>
                <DivInput>
                    <Input
                        key={`dtCompra-${key}`}
                        label="Data"
                        onBlur={handleBlur}
                        name="dtCompra"
                        value={values.dtCompra ?? ''}
                        maxLength={10}
                        onChange={e => setFieldValue(e.target.name, formatDate(e.target.value))}
                        error={touched.dtCompra && errors.dtCompra ? errors.dtCompra : ''}
                        raisedLabel={values.dtCompra ? true : false}
                    />
                    <Input
                        key={`vlUnitario-${key}`}
                        label="Valor Unitário"
                        onBlur={handleBlur}
                        name="vlUnitario"
                        value={values.vlUnitario && values.vlUnitario.toString() !== 'R$ 0,00' ? values.vlUnitario : ''}
                        disabled
                        maxLength={15}
                        onChange={e => setFieldValue(e.target.name, formatCurrencyRealTime(e.target.value))}
                        error={touched.vlUnitario && errors.vlUnitario ? errors.vlUnitario : ''}
                        raisedLabel={values.vlUnitario && values.vlUnitario.toString() !== 'R$ 0,00' ? true : false}
                    />
                </DivInput>
                <DivInput>
                    <Input
                        key={`Quantidade-${key}`}
                        label="Quantidade"
                        onBlur={handleBlur}
                        name="quantidade"
                        value={values.stEstoqueInfinito ? '\u221E' : values.quantidade || ''}
                        maxLength={10}
                        disabled={values.stEstoqueInfinito}
                        raisedLabel={values.stEstoqueInfinito}
                        onKeyPress={e => onKeyPressHandleSubmit(e, handleSubmit)}
                        onChange={e => setFieldValue(e.target.name, parseFloat(e.target.value))}
                        error={touched.quantidade && errors.quantidade ? errors.quantidade : ''}
                    />
                    <Input
                        key={`totalPago-${key}`}
                        label="Valor Total"
                        onBlur={handleBlur}
                        disabled={values.tpProduto === SituacaoProduto.FABRICADO}
                        name="totalPago"
                        value={values.totalPago && values.totalPago.toString() !== 'R$ 0,00' ? values.totalPago : ''}
                        onChange={e => setFieldValue(e.target.name, formatCurrencyRealTime(e.target.value))}
                        maxLength={15}
                        error={''}
                        raisedLabel={values.totalPago && values.totalPago.toString() !== 'R$ 0,00' ? true : false}
                    />
                </DivInput>
            </ContainerInputs>
            <div style={{ width: 200, marginLeft: '4rem' }}>
                <Input
                    key={`qntMinima-${key}`}
                    label="Quant. mínima em estoque"
                    onBlur={handleBlur}
                    name="qntMinima"
                    value={values.qntMinima || ''}
                    onChange={e => setFieldValue(e.target.name, parseFloat(e.target.value.replace(/[^\d]/g, '')))}
                    maxLength={4}
                    error={touched.qntMinima && errors.qntMinima ? errors.qntMinima : ''}
                    style={{ paddingBottom: 0 }}
                    styleLabel={{ fontSize: '0.8rem' }}
                    raisedLabel={values.qntMinima ? true : false}
                    onKeyPress={e => onKeyPressHandleSubmit(e, handleSubmit)}
                />
                {values.tpProduto === SituacaoProduto.FABRICADO ?
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={values.stEstoqueInfinito}
                                onChange={(e) => setFieldValue("stEstoqueInfinito", e.target.checked)}
                            />
                        }
                        label="Estoque infinito?"
                    />
                    : null
                }
            </div>
            {/* Editar Estoque */}
            <IsEdit
                editingScreen='Estoque'
                setSelected={setSelected}
                selected={selected}
                handleEditRow={handleEditRow}
                inputsConfig={inputsConfig}
                isEdit={isEdit}
                products={[]}
                setIsEdit={setIsEdit}
            />
            <ModalDelete open={openDelete} onDeleteClick={handleDeleteRow} onCancelClick={() => setOpenDelete(false)} />
            <ContainerButton>
                <Button
                    label='Cadastrar Estoque'
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    style={{ margin: '1rem 4rem 2rem 95%', height: '4rem', width: '12rem' }}
                />
                <FormAlert submitForm={submitForm} name={'Estoque'} styleLoadingMarginTop='-8rem' />

            </ContainerButton>

            {/*Tabala */}
            <BoxTitleDefault>
                <div>
                    <FiltroGeneric data={dataTable} setFilteredData={setDataTable} carregarDados={setRecarregue} type="produto" />
                </div>
            </BoxTitleDefault>
            <GenericTable
                columns={[
                    { label: 'Código', name: 'cdProduto' },
                    { label: 'Nome', name: 'nmProduto' },
                    { label: 'Data', name: 'dtCompra' },
                    { label: 'Valor Unitario', name: 'vlUnitario', isCurrency: true },
                    { label: 'Quantidade', name: 'quantidade', isInfinite: true },
                    { label: 'Valor Total', name: 'totalPago', isCurrency: true }
                ]}
                data={dataTable}
                isLoading={isLoading}
                isdisabled={selected ? false : true}
                onSelectedRow={setSelected}
                onEdit={() => {
                    if (selected) {
                        setIsEdit(true)
                        setInitialValues(selected)
                    } else {
                        return
                    }
                }}
                onDelete={() => setOpenDelete(true)}
            />
        </Box>
    );
}

export default AtualizarEstoque;