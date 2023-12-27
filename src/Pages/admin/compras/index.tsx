import * as Yup from 'yup';
import moment from 'moment';
import { useFormik } from 'formik';
import { db } from "../../../firebase";
import ComprasModel from "./model/compras";
import { useState, useEffect } from "react";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import GetData from "../../../firebase/getData";
import GenericTable from "../../../Components/table";
import FiltroGeneric from "../../../Components/filtro";
import ClienteModel from '../cadastroClientes/model/cliente';
import { useUniqueNames } from '../../../hooks/useUniqueName';
import formatDate from "../../../Components/masks/formatDate";
import ProdutosModel from "../cadastroProdutos/model/produtos";
import EstoqueModel, { Versao } from '../estoque/model/estoque';
import FormAlert from "../../../Components/FormAlert/formAlert";
import DashboardCompras from '../dashboard/model/dashboardCompra';
import SituacaoProduto from "../../../enumeration/situacaoProduto";
import { InputConfig, IsEdit } from "../../../Components/isEdit/isEdit";
import { calculateTotalValue } from '../../../hooks/useCalculateTotalValue';
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Autocomplete, AutocompleteChangeReason, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";

import {
    Box,
    ContainerInputs,
    DivInput,
    Title,
    ContainerButton,
} from './style'
import { BoxTitleDefault } from "../estoque/style";


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

export default function AtualizarEstoque() {
    const [key, setKey] = useState<number>(0);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [initialValues, setInitialValues] = useState<ComprasModel>({ ...objClean });
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [recarregueDashboard, setRecarregueDashboard] = useState<boolean>(true);
    const [selectAutoComplete, setSelectAutoComplete] = useState<boolean>(false);
    const [selected, setSelected] = useState<ComprasModel | undefined>();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const inputsConfig: InputConfig[] = [
        { label: 'Nome Do Produto', propertyName: 'nmProduto' },
        { label: 'Código do Produto', propertyName: 'cdProduto' },
        { label: 'Data', propertyName: 'dtCompra' },
        { label: 'Valor Unitário', propertyName: 'vlUnitario', type: 'number' },
        { label: 'Quantidade', propertyName: 'quantidade', type: 'number' },
        { label: 'Valor Total', propertyName: 'totalPago', type: 'number' },
        { label: 'Quant. mínima em estoque', propertyName: 'qntMinima', type: 'number' },
        { label: 'Quantidade na Caixa', propertyName: 'cxProduto', type: 'number' },
        { label: 'Quantidade KG', propertyName: 'kgProduto', type: 'number' },
    ];
    //Realizando busca no banco de dados
    const {
        dataTable,
        loading,
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
            vlUnitario: Yup.string().required('Campo obrigatório'),
            dtCompra: Yup.string().required('Campo obrigatório'),
            cxProduto: Yup.number().optional().nullable(),
            tpProduto: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório'),
            quantidade: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório'),
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
        }
        setSelected(undefined)
    }

    // Este método recalcula os preços dos produtos para um cliente específico, com base nos valores fornecidos e nas compras registradas.
    function recalculateProductPricesClient(valuesUpdate: ComprasModel, clienteEncontrado: ClienteModel[]) {
        dataTableCliente.forEach(cliente => {
            // Filtrar produtos do cliente que contêm a matéria-prima (MP) em questão
            const produtosComMPEncontrada = cliente.produtos.filter(produto =>
                produto.mpFabricado.some(mp => mp.nmProduto === valuesUpdate.nmProduto)
            );

            if (produtosComMPEncontrada.length > 0) {
                let result = 0.0;
                // Iterar pelos produtos do cliente que contêm a MP em questão
                const produtosAtualizados = produtosComMPEncontrada.map(produto => {
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
            }
        });
    }
    // Este método recalcula os preços dos produtos com base nos valores fornecidos e nos registros de compras.
    function recalculateProduct(valuesUpdate: ComprasModel, produtosEncontrado: ProdutosModel[]) {
        produtoDataTable.forEach(produto => {
            if (produto.mpFabricado.some(mp => mp.nmProduto === valuesUpdate.nmProduto)) {
                let soma = 0.0;

                // Recalcule a soma dos totalPago após a atualização
                produto.mpFabricado.forEach(item => {
                    if (item.nmProduto !== valuesUpdate.nmProduto) {
                        const encontrado = dataTable.find(compra => compra.nmProduto === item.nmProduto)
                        const totalAtualizado = calculateTotalValue(item, encontrado as ComprasModel)
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

    // Este método recalcula os preços dos produtos encontrados com base nos registros de compras.
    function recalculateProductFound(produtosEncontrado: ProdutosModel[], produtoAtualizados: ProdutosModel[]) {
        produtosEncontrado.forEach(items => {
            const foundProduct = dataTable.find(produto => produto.nmProduto === items.nmProduto)
            const updateValueProduct = { ...foundProduct, vlUnitario: items.vlUnitario }
            produtoDataTable.forEach(produto => {
                if (produto.mpFabricado.some(mp => mp.nmProduto.includes(items.nmProduto))) {
                    let soma = 0.0;
                    // Recalcule a soma dos totalPago após a atualização
                    produto.mpFabricado.forEach(item => {
                        if (item.nmProduto.includes(items.nmProduto)) {
                            const totalAtualizado = calculateTotalValue(item, updateValueProduct as ComprasModel)
                            soma += totalAtualizado
                        } else {
                            const encontrado = dataTable.find(compra => compra.nmProduto === item.nmProduto)
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
                quantidade: quantidadeTotal,
                versaos: [
                    { versao: valuesUpdate.nrOrdem, vrQntd: quantidadeTotal }
                ]
            })
        }
    }

    async function updateRemovedStock(estoque: EstoqueModel) {
        const estoqueExistente = dataTableEstoque.find(
            estoques => estoques.nmProduto === estoque.nmProduto
        );
        if (estoqueExistente) {
            const refID: string = estoqueExistente.id ?? '';
            const refTable = doc(db, "Estoque", refID);
            for (const versao of estoqueExistente.versaos) {
                if (versao.vrQntd <= 0) {
                    const compraCorrespondente = dataTable.find(compra =>
                        compra.nmProduto === estoqueExistente.nmProduto && compra.nrOrdem === versao.versao
                    );
                    if (compraCorrespondente && compraCorrespondente.id) {
                        await deleteDoc(doc(db, "Compras", compraCorrespondente.id));
                    }

                }
            }
            const versoesValidas = estoque.versaos.filter(versao => versao.vrQntd > 0);
            await updateDoc(refTable, {
                nmProduto: estoque.nmProduto,
                cdProduto: estoque.cdProduto,
                quantidade: estoque.quantidade,
                versaos: versoesValidas
            })
        }
    }

    async function removedStock(values: ComprasModel) {
        values.mpFabricado?.forEach(async mp => {
            const estoqueMP = dataTableEstoque.find(estoque => estoque.nmProduto === mp.nmProduto);
            if (estoqueMP) {
                let qntdUsadaProducao = values.quantidade * mp.quantidade;
                const listVersaoComQntd: Versao[] = [...estoqueMP.versaos];
                const versoesOrdenadas = estoqueMP.versaos.sort((a, b) => a.versao - b.versao);

                versoesOrdenadas.forEach(versao => {
                    if (qntdUsadaProducao > 0) {
                        const qntdMinima = Math.min(qntdUsadaProducao, versao.vrQntd)
                        const novaQuantidade = estoqueMP.quantidade - qntdMinima;
                        const novaQntdPorVersao = versao.vrQntd - qntdMinima
                        if (novaQuantidade > 0) {
                            versao.vrQntd = novaQntdPorVersao;
                        } else {
                            versao.vrQntd = 0
                        }

                        estoqueMP.quantidade = novaQuantidade
                        qntdUsadaProducao -= qntdMinima;
                    }
                })
                await updateRemovedStock({
                    nmProduto: estoqueMP.nmProduto,
                    cdProduto: estoqueMP.cdProduto,
                    quantidade: estoqueMP.quantidade,
                    versaos: listVersaoComQntd,
                });
            }
        })
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
        const newNrOrdem = values.nrOrdem || values.nrOrdem === 0 ? values.nrOrdem + 1 : 0;
        const valuesUpdate: ComprasModel = { ...values, nrOrdem: newNrOrdem, vlUnitario: parseFloat(values.vlUnitario.toString().replace(',', '.')) };
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
                createStock(valuesUpdate)
                removedStock(valuesUpdate)
            }
        } catch (error) {
            setSubmitForm(false);
            setTimeout(() => { setSubmitForm(undefined) }, 3000);
            console.error("Erro durante o processamento:", error);
            return;
        }

        await addDoc(collection(db, "Compras"), {
            ...valuesUpdate
        })
            .then(() => {
                setSubmitForm(true)
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
                setDataTable([...dataTable, valuesUpdate])
            })
            .catch(() => {
                setSubmitForm(false)
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            });
        resetForm()
        cleanState()
        setSelectAutoComplete(false);
        setRecarregueDashboard(true)
    }

    // Este useEffect é responsável por calcular e atualizar o campo 'totalPago' com base nas quantidades e valores unitários,
    // considerando a formatação monetária, tanto para o modo de edição (isEdit e selected) quanto para o modo de criação (values).
    // O cálculo é realizado multiplicando a quantidade pelo valor unitário, formatando o resultado e atualizando o estado correspondente.
    useEffect(() => {
        if (isEdit && selected) {
            const multiplication = selected.quantidade * selected.vlUnitario
            if (!isNaN(multiplication)) {
                setSelected((prevSelected) => ({
                    ...prevSelected,
                    totalPago: parseFloat(multiplication.toFixed(2)) || 0,
                } as ComprasModel | undefined));
            }
        } else {
            const multiplication = values.quantidade * parseFloat(values.vlUnitario.toString().replace(',', '.'))
            if (!isNaN(multiplication)) {
                setFieldValue('totalPago', parseFloat(multiplication.toFixed(2)))
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
            setSelectAutoComplete(false);
            setFieldValue('cdProduto', '');
            setFieldValue('vlUnitario', '');
            setFieldValue('qntMinima', '');
            setFieldValue('cxProduto', '');
            setFieldValue('kgProduto', '');
        } else if (newValue) {
            setSelectAutoComplete(true);
            setFieldValue('nrOrdem', newValue.nrOrdem);
            setFieldValue('cdProduto', newValue.cdProduto);
            setFieldValue('vlUnitario', newValue.vlUnitario);
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
                        options={useUniqueNames(dataTable, produtoDataTable, values.tpProduto, values.tpProduto)}
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
                        value={values.vlUnitario ? `R$ ${values.vlUnitario.toString().replace('.', ',')}` : ''}
                        disabled={values.tpProduto === SituacaoProduto.FABRICADO}
                        maxLength={9}
                        onChange={e => {
                            const inputValue = e.target.value.replace(/[^\d.,-]/g, '');
                            setFieldValue(e.target.name, inputValue.replace(',', '.'));
                        }}
                        error={touched.vlUnitario && errors.vlUnitario ? errors.vlUnitario : ''}
                        raisedLabel={selectAutoComplete || values.vlUnitario ? true : false}
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
                        onChange={e => setFieldValue(e.target.name, parseFloat(e.target.value))}
                        error={touched.quantidade && errors.quantidade ? errors.quantidade : ''}
                    />
                    <Input
                        key={`totalPago-${key}`}
                        label="Valor Total"
                        onBlur={handleBlur}
                        disabled
                        name="totalPago"
                        value={values.totalPago ? `R$ ${values.totalPago.toFixed(2).replace('.', ',')}` : ''}
                        onChange={() => { }}
                        maxLength={9}
                        error={''}
                        raisedLabel={values.totalPago ? true : false}
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
                />
            </div>
            {/* Editar Estoque */}
            <IsEdit
                editingScreen='Estoque'
                setSelected={setSelected}
                data={selected}
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
                    onClick={handleSubmit}
                    style={{ margin: '1rem 4rem 2rem 95%', height: '4rem', width: '12rem' }}
                />
                <FormAlert submitForm={submitForm} name={'Estoque'} />
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
                    { label: 'Valor', name: 'vlUnitario' },
                    { label: 'Quantidade', name: 'quantidade' },
                    { label: 'Quantidade na Caixa', name: 'cxProduto' },
                    { label: 'Quantidade KG', name: 'kgProduto' },
                    { label: 'Valor Total', name: 'totalPago' }
                ]}
                data={dataTable}
                isLoading={loading}
                isDisabled={selected ? false : true}
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