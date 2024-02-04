import * as Yup from 'yup';
import moment from 'moment';
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
import ClienteModel from '../cadastroClientes/model/cliente';
import formatDate from "../../../Components/masks/formatDate";
import ProdutosModel from "../cadastroProdutos/model/produtos";
import { InputConfig } from "../../../Components/isEdit/isEdit";
import FormAlert from "../../../Components/FormAlert/formAlert";
import DashboardCompras from '../dashboard/model/dashboardCompra';
import { State, setLoading } from '../../../store/reducer/reducer';
import SituacaoProduto from "../../../enumeration/situacaoProduto";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Autocomplete, AutocompleteChangeReason, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
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
import AlertDialog from '../../../Components/FormAlert/dialogForm';
import useHandleInputKeyPress from '../../../hooks/useHandleInputKeyPress';
import { calculateTotalValue } from '../../../hooks/useCalculateTotalValue';


const objClean: ComprasModel = {
    cdProduto: '',
    nmProduto: '',
    vlUnitario: 0,
    dtCompra: null,
    quantidade: 0,
    totalPago: null,
    tpProduto: null,
    cxProduto: null,
    kgProduto: null,
    qntMinima: null,
    nrOrdem: undefined
}

function AtualizarEstoque() {
    const [key, setKey] = useState<number>(0);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [initialValues, setInitialValues] = useState<ComprasModel>({ ...objClean });
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [recarregueDashboard, setRecarregueDashboard] = useState<boolean>(true);
    const [selectAutoComplete, setSelectAutoComplete] = useState<boolean>(false);
    const [selected, setSelected] = useState<ComprasModel | undefined>();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [estoqueVazio, setEstoqueVazio] = useState<boolean>(false);
    const [nmProduto, setNmProduto] = useState<string>('');
    const [produtosProcessados, setProdutosProcessados] = useState(new Set<string>());
    const dispatch = useDispatch();
    const { loading } = useSelector((state: State) => state.user);

    const { convertToNumber, formatCurrency, formatCurrencyRealTime } = useFormatCurrency();
    const { removedStockCompras, updateStock } = useEstoque();
    const { onKeyPressHandleSubmit } = useHandleInputKeyPress();

    const inputsConfig: InputConfig[] = [
        { label: 'Nome Do Produto', propertyName: 'nmProduto' },
        { label: 'Código do Produto', propertyName: 'cdProduto' },
        { label: 'Data', propertyName: 'dtCompra' },
        { label: 'Valor Unitário', propertyName: 'vlUnitario', isCurrency: true },
        { label: 'Quantidade', propertyName: 'quantidade', type: 'number' },
        { label: 'Valor Total', propertyName: 'totalPago', isCurrency: true, isDisable: true },
        { label: 'Quant. mínima em estoque', propertyName: 'qntMinima', type: 'number' },
        { label: 'Quantidade na Caixa', propertyName: 'cxProduto', type: 'number' },
        { label: 'Quantidade KG', propertyName: 'kgProduto', type: 'number' },
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
    } = GetData('Produtos', recarregue) as {
        dataTable: ProdutosModel[],
    };
    const {
        dataTable: dataTableCliente,
    } = GetData('Clientes', recarregue) as { dataTable: ClienteModel[] };

    const {
        dataTable: dataTableEstoque,
    } = GetData('Estoque', recarregue) as { dataTable: EstoqueModel[] };

    const {
        dataTable: dataTableDashboard,
    } = GetData('Dados Dashboard', recarregueDashboard) as { dataTable: DashboardCompras[] };

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
            cxProduto: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).optional().nullable(),
            tpProduto: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório'),
            quantidade: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório').test('vlVendaProduto', 'Campo Obrigatório', (value) => {
                return value > 0;
            }),
            qntMinima: Yup.number().required('Campo obrigatório').typeError('Campo obrigatório'),
            nrOrdem: Yup.number().optional().nullable()
        }),
        onSubmit: handleSubmitForm,
    });

    //Limpa formulario
    function cleanState() {
        setInitialValues({
            cdProduto: '',
            nmProduto: '',
            vlUnitario: 0,
            dtCompra: null,
            quantidade: 0,
            totalPago: null,
            tpProduto: null,
            cxProduto: null,
            kgProduto: null,
            qntMinima: null,
            nrOrdem: undefined
        })
        setSelectAutoComplete(false);
        setFieldValue('cdProduto', '');
        setFieldValue('vlUnitario', '');
        setFieldValue('qntMinima', '');
        setFieldValue('cxProduto', '');
        setFieldValue('kgProduto', '');
        setKey(Math.random());
    }

    //deleta uma linha da tabela e do banco de dados
    async function handleDeleteRow() {
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

    // Este método recalcula os preços dos produtos para um cliente específico, com base nos valores fornecidos e nas compras registradas.
    function recalculateProductPricesClient(valuesUpdate: ComprasModel, clienteEncontrado: ClienteModel[]) {
        dataTableCliente.forEach(cliente => {
            let result = 0.0;
            // Iterar pelos produtos do cliente que contêm a MP em questão
            const produtosAtualizados = cliente.produtos.map(produto => {
                produto.mpFabricado.forEach(item => {
                    // Verificar se é a MP em questão
                    if (item.nmProduto !== valuesUpdate.nmProduto) {
                        const encontrado = dataTable.find(compra => compra.nmProduto === item.nmProduto);
                        if (encontrado) {
                            const totalAtualizado = calculateTotalValue(item, encontrado);
                            result += totalAtualizado;
                        }
                    } else {
                        const totalAtualizado = calculateTotalValue(item, valuesUpdate);
                        result += totalAtualizado;
                    }
                });
                // Atualizar o valor no produto do cliente
                const productUpdate = { ...produto, vlUnitario: parseFloat(result.toFixed(2)) }
                result = 0.0
                return productUpdate;
            });
            // Construir um novo objeto cliente com produtos atualizados
            const clienteAtualizado: ClienteModel = { ...cliente, produtos: produtosAtualizados };
            clienteEncontrado.push(clienteAtualizado);
        });
    }
    function foundProducts(item: ComprasModel) {
        let versao = 0;
        let encontrado: ComprasModel | null = null;
        for (const compra of dataTable) {
            if (compra.nrOrdem === undefined || compra.nmProduto !== item.nmProduto) continue;
            if (compra.nrOrdem >= versao) {
                versao = compra.nrOrdem;
                encontrado = compra;
            }
        }
        return encontrado
    }
    // Este método recalcula os preços dos produtos com base nos valores fornecidos e nos registros de compras.
    function recalculateProduct(valuesUpdate: ComprasModel, produtosEncontrado: ProdutosModel[]) {
        produtoDataTable.forEach(produto => {
            if (produto.mpFabricado.some(mp => mp.nmProduto === valuesUpdate.nmProduto)) {
                let soma = 0.0;

                // Recalcule a soma dos totalPago após a atualização
                try {
                    produto.mpFabricado.forEach(item => {
                        if (!produtosProcessados.has(item.nmProduto)) {
                            if (item.nmProduto !== valuesUpdate.nmProduto) {
                                const encontrado = foundProducts(item)
                                if (encontrado) {
                                    const totalAtualizado = calculateTotalValue(item, encontrado)
                                    soma += totalAtualizado
                                } else {
                                    setOpenDialog(true);
                                    setNmProduto(item.nmProduto)
                                    setProdutosProcessados(new Set(produtosProcessados.add(valuesUpdate.nmProduto)))
                                    throw new Error("Produto não encontrado");
                                }
                            } else {
                                const totalAtualizado = calculateTotalValue(item, valuesUpdate)
                                soma += totalAtualizado
                            }
                        }
                    });
                } catch (error) {
                    throw new Error("Produto não encontrado no estoque");
                }
                produto.nrOrdem += 1
                const newProduto = { ...produto, vlUnitario: parseFloat(soma.toFixed(2)) }
                produtosEncontrado.push(newProduto);
            }
        });
    }

    // Este método recalcula os preços dos produtos encontrados com base nos registros de compras.
    function recalculateProductFound(produtosEncontrado: ProdutosModel[], produtoAtualizados: ProdutosModel[]) {
        produtosEncontrado.forEach(items => {
            let updateValueProduct: ComprasModel = objClean;
            try {
                const foundProduct = dataTable.find(produto => produto.nmProduto === items.nmProduto)
                if (foundProduct) {
                    updateValueProduct = { ...foundProduct, vlUnitario: items.vlUnitario };
                } else {
                    throw new Error("Produto não encontrado");
                }
            } catch (error) {
                setOpenDialog(true);
                setNmProduto(items.nmProduto)
                throw error;
            }
            produtoDataTable.forEach(produto => {
                if (produto.mpFabricado.some(mp => mp.nmProduto.includes(items.nmProduto))) {
                    let soma = 0.0;
                    // Recalcule a soma dos totalPago após a atualização
                    produto.mpFabricado.forEach(item => {
                        if (item.nmProduto.includes(items.nmProduto)) {
                            const totalAtualizado = calculateTotalValue(item, updateValueProduct as ComprasModel)
                            soma += totalAtualizado
                        } else {
                            const encontrado = foundProducts(item)
                            const totalAtualizado = calculateTotalValue(item, encontrado as ComprasModel)
                            soma += totalAtualizado
                        }
                    });
                    const newProduto = { ...produto, vlUnitario: parseFloat(soma.toFixed(2)) }
                    produtoAtualizados.push(newProduto);
                } else {
                    produtoAtualizados.push(items)
                }
            });
        })
        produtosEncontrado.length = 0;
        produtosEncontrado.push(...produtoAtualizados);
    }

    function calculateQuantity(values: ComprasModel) {
        let quantidadeTotal: number = 0;
        if (values.cxProduto) {
            quantidadeTotal = values.quantidade * values.cxProduto;
        } else if (values.kgProduto) {
            quantidadeTotal = values.quantidade * values.kgProduto;
        } else {
            quantidadeTotal = values.quantidade
        }
        return quantidadeTotal;
    }

    async function createStock(valuesUpdate: ComprasModel) {
        const estoqueExistente = dataTableEstoque.find(
            estoque => estoque.nmProduto === valuesUpdate.nmProduto
        );
        if (estoqueExistente) {
            const refID: string = estoqueExistente.id ?? '';
            const refTable = doc(db, "Estoque", refID);
            const quantidadeTotal = calculateQuantity(valuesUpdate)
            const novaQuantidade = quantidadeTotal + estoqueExistente.quantidade;
            await updateDoc(refTable, {
                nmProduto: valuesUpdate.nmProduto,
                cdProduto: valuesUpdate.cdProduto,
                tpProduto: valuesUpdate.tpProduto,
                qntMinima: valuesUpdate.qntMinima,
                quantidade: novaQuantidade,
                versaos: [
                    ...estoqueExistente.versaos,
                    { versao: valuesUpdate.nrOrdem, vrQntd: quantidadeTotal }
                ]
            })
        } else {
            const quantidadeTotal = calculateQuantity(valuesUpdate)
            await addDoc(collection(db, "Estoque"), {
                nmProduto: valuesUpdate.nmProduto,
                cdProduto: valuesUpdate.cdProduto,
                tpProduto: valuesUpdate.tpProduto,
                qntMinima: valuesUpdate.qntMinima,
                quantidade: quantidadeTotal,
                versaos: [
                    { versao: valuesUpdate.nrOrdem, vrQntd: quantidadeTotal }
                ]
            })
        }
    }

    async function calculateValueTotal(valueCurrent: number, dateBuy: Date | null) {
        let sumValue: number = 0
        const mesAtual = moment(dateBuy, "DD/MM/YYYY").format("DD/MM/YYYY");
        const existingMonth = dataTableDashboard.find(compraMes => compraMes.mes === moment(mesAtual, "DD/MM/YYYY").month() + 1)
        const valueCurrentFormatado = valueCurrent.toString().match(/\d+/g)?.join('.')

        if (existingMonth && valueCurrentFormatado) {
            sumValue += existingMonth.qntdComprada;
            sumValue += parseFloat(valueCurrentFormatado);

            const refID: string = existingMonth.id ?? '';
            const refTable = doc(db, "Dados Dashboard", refID);
            await updateDoc(refTable, {
                totalCompras: existingMonth.totalCompras + 1,
                qntdComprada: parseFloat(sumValue.toFixed(2))
            })
        } else {
            if (valueCurrentFormatado) {
                sumValue = parseFloat(valueCurrentFormatado)
            }
            await addDoc(collection(db, "Dados Dashboard"), {
                qntdComprada: parseFloat(sumValue.toFixed(2)),
                mes: moment(mesAtual, "DD/MM/YYYY").month() + 1,
                totalCompras: 1
            })
        }
        setRecarregueDashboard(false)
    }

    async function updateValue(valuesUpdate: any[], nameCollection: string) {
        valuesUpdate.forEach(async item => {
            const refID: string = item.id ?? '';
            const refTable = doc(db, nameCollection, refID);
            await updateDoc(refTable, { ...item })
        })
    }

    //enviando formulario
    async function handleSubmitForm() {
        dispatch(setLoading(true))
        const newNrOrdem = values.nrOrdem || values.nrOrdem === 0 ? values.nrOrdem + 1 : 0;
        const valuesUpdate: ComprasModel = {
            ...values,
            nrOrdem: newNrOrdem,
            vlUnitario: convertToNumber(values.vlUnitario.toString()),
            totalPago: values.totalPago && convertToNumber(values.totalPago?.toString())
        };
        try {
            if (valuesUpdate.tpProduto === SituacaoProduto.COMPRADO) {
                const produtosEncontrado: ProdutosModel[] = [];
                const produtoAtualizados: ProdutosModel[] = [];
                const clienteEncontrado: ClienteModel[] = [];
                recalculateProductPricesClient(valuesUpdate, clienteEncontrado);

                recalculateProduct(valuesUpdate, produtosEncontrado);

                recalculateProductFound(produtosEncontrado, produtoAtualizados);

                updateValue(clienteEncontrado, "Clientes")
                updateValue(produtosEncontrado, "Produtos")
                createStock(valuesUpdate)
                if (valuesUpdate.totalPago) {
                    calculateValueTotal(valuesUpdate.totalPago, valuesUpdate.dtCompra)
                }
            }
            if (values.tpProduto === SituacaoProduto.FABRICADO) {
                await removedStockCompras(valuesUpdate, setOpenDialog, setEstoqueVazio, setNmProduto)
                createStock(valuesUpdate)
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("estoque")) {
                    dispatch(setLoading(false))
                    setEstoqueVazio(false)
                    return;
                }
            }
            dispatch(setLoading(false))
            setSubmitForm(false);
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
    const handleOKClick = () => {
        setOpenDialog(false);
    };
    // Este useEffect é responsável por calcular e atualizar o campo 'totalPago' com base nas quantidades e valores unitários,
    // considerando a formatação monetária, tanto para o modo de edição (isEdit e selected) quanto para o modo de criação (values).
    // O cálculo é realizado multiplicando a quantidade pelo valor unitário, formatando o resultado e atualizando o estado correspondente.
    useEffect(() => {
        if (isEdit && selected) {
            const multiplication = selected.quantidade * convertToNumber(selected.vlUnitario.toString())
            if (!isNaN(multiplication)) {
                setSelected((prevSelected) => ({
                    ...prevSelected,
                    totalPago: formatCurrency(multiplication.toString()) as unknown as number,
                } as ComprasModel | undefined));
            }
        } else {
            const multiplication = values.quantidade * convertToNumber(values.vlUnitario.toString())
            if (!isNaN(multiplication)) {
                setFieldValue('totalPago', formatCurrency(multiplication.toString()))
            } else {
                setFieldValue('totalPago', 0)
            }
        }
    }, [values.quantidade, values.vlUnitario, selected?.quantidade, selected?.vlUnitario])

    //Editando linha da tabela e do banco de dados
    async function handleEditRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            const refTable = doc(db, "Compras", refID);
            const estoque: EstoqueModel = {
                nmProduto: selected.nmProduto,
                cdProduto: selected.cdProduto,
                qntMinima: selected.qntMinima || 0,
                quantidade: calculateQuantity(selected),
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

    function handleAutoComplete(newValue: ComprasModel, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            cleanState()
        } else if (newValue) {
            setSelectAutoComplete(true);
            setFieldValue('nrOrdem', newValue.nrOrdem);
            setFieldValue('cdProduto', newValue.cdProduto);
            setFieldValue('vlUnitario', formatCurrency(newValue.vlUnitario.toString()));
            setFieldValue('qntMinima', newValue.qntMinima);
            setFieldValue('nmProduto', newValue.nmProduto);
            if (newValue.cxProduto) {
                setFieldValue('cxProduto', newValue.cxProduto);
            }
            if (newValue.kgProduto) {
                setFieldValue('kgProduto', newValue.kgProduto);
            }
            if (newValue.tpProduto === SituacaoProduto.FABRICADO) {
                setFieldValue('mpFabricado', newValue.mpFabricado)
            }
        }
    }

    useEffect(() => { cleanState() }, [values.tpProduto])

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
                        options={useUniqueNames(dataTable, values.tpProduto, values.tpProduto, produtoDataTable, dataTableEstoque)}
                        getOptionLabel={(option) => option.nmProduto || ""}
                        onChange={(e, newValue, reason) => handleAutoComplete(newValue, reason)}
                        disabled={values.tpProduto === null}
                        freeSolo
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
                        value={values.dtCompra!}
                        maxLength={10}
                        onChange={e => setFieldValue(e.target.name, formatDate(e.target.value))}
                        error={touched.dtCompra && errors.dtCompra ? errors.dtCompra : ''}
                    />
                    <Input
                        key={`vlUnitario-${key}`}
                        label="Valor Unitário"
                        onBlur={handleBlur}
                        name="vlUnitario"
                        value={values.vlUnitario && values.vlUnitario.toString() !== 'R$ 0,00' ? values.vlUnitario : ''}
                        disabled={values.tpProduto === SituacaoProduto.FABRICADO}
                        maxLength={15}
                        onChange={e => setFieldValue(e.target.name, formatCurrencyRealTime(e.target.value))}
                        error={touched.vlUnitario && errors.vlUnitario ? errors.vlUnitario : ''}
                        raisedLabel={values.vlUnitario && values.vlUnitario.toString() !== 'R$ 0,00' ? true : false}
                    />
                </DivInput>
                <DivInput>
                    <div style={{ display: 'flex' }}>
                        <Input
                            key={`cxProduto-${key}`}
                            name="cxProduto"
                            onBlur={handleBlur}
                            label="Quantidade na Caixa ?"
                            value={values.cxProduto ? values.cxProduto.toString().replace('.', ',') : ''}
                            onChange={e => setFieldValue(e.target.name, parseFloat(e.target.value.replace(',', '.')))}
                            error={touched.cxProduto && errors.cxProduto ? errors.cxProduto : ''}
                            style={{ paddingBottom: 0 }}
                            styleDiv={{ paddingRight: 8 }}
                            styleLabel={{ fontSize: '0.8rem' }}
                            raisedLabel={values.cxProduto ? true : false}
                        />
                        <Input
                            key={`kgProduto-${key}`}
                            name="kgProduto"
                            onBlur={handleBlur}
                            label="Quantidade KG ?"
                            value={values.kgProduto ? values.kgProduto.toString().replace('.', ',') : ''}
                            onChange={e => setFieldValue(e.target.name, parseFloat(e.target.value.replace(',', '.')))}
                            error={touched.kgProduto && errors.kgProduto ? errors.kgProduto : ''}
                            style={{ paddingBottom: 0 }}
                            styleLabel={{ fontSize: '0.8rem' }}
                            raisedLabel={values.kgProduto ? true : false}
                        />
                    </div>
                    <Input
                        key={`Quantidade-${key}`}
                        label="Quantidade"
                        onBlur={handleBlur}
                        name="quantidade"
                        value={values.quantidade || ''}
                        maxLength={10}
                        onKeyPress={e => onKeyPressHandleSubmit(e, handleSubmit)}
                        onChange={e => setFieldValue(e.target.name, parseFloat(e.target.value))}
                        error={touched.quantidade && errors.quantidade ? errors.quantidade : ''}
                    />
                    <Input
                        key={`totalPago-${key}`}
                        label="Valor Total"
                        onBlur={handleBlur}
                        disabled
                        name="totalPago"
                        value={values.totalPago && values.totalPago.toString() !== 'R$ 0,00' ? values.totalPago : ''}
                        onChange={() => { }}
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
            <ContainerButton>
                <Button
                    label='Cadastrar Estoque'
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    style={{ margin: '1rem 4rem 2rem 95%', height: '4rem', width: '12rem' }}
                />
                <FormAlert submitForm={submitForm} name={'Estoque'} styleLoadingMarginTop='-8rem' />

                <AlertDialog open={openDialog} onOKClick={handleOKClick} nmProduto={nmProduto} estoqueVazio={estoqueVazio} />
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
                    { label: 'Valor', name: 'vlUnitario', isCurrency: true },
                    { label: 'Quantidade', name: 'quantidade' },
                    { label: 'Quantidade na Caixa', name: 'cxProduto' },
                    { label: 'Quantidade KG', name: 'kgProduto' },
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
                onDelete={handleDeleteRow}
            />
        </Box>
    );
}

export default AtualizarEstoque;