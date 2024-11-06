/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Yup from 'yup';
import moment from 'moment';
import { useFormik } from 'formik';
import { db } from "../../../firebase";
import ComprasModel from "./model/compras";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import { useState, useEffect } from "react";
import EstoqueModel, { Versao } from '../estoque/model/estoque';
import GenericTable from "../../../Components/table";
import { useDispatch, useSelector } from 'react-redux';
import formatDate from "../../../Components/masks/formatDate";
import TelaDashboard from '../../../enumeration/telaDashboard';
import ProdutosModel from "../cadastroProdutos/model/produtos";
import SituacaoProduto from "../../../enumeration/situacaoProduto";
import { addDoc, arrayUnion, collection, deleteDoc, doc, serverTimestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { Autocomplete, AutocompleteChangeReason, Box, FormControlLabel, Grid, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

//hooks
import useEstoque from '../../../hooks/useEstoque';
import useFormatCurrency from '../../../hooks/formatCurrency';
import { foundKgProduto } from '../../../hooks/useFoundProductKg';
import useHandleInputKeyPress from '../../../hooks/useHandleInputKeyPress';
import { useCalculateValueDashboard } from '../../../hooks/useCalculateValueDashboard';
import useDebouncedSuggestions from '../../../hooks/useDebouncedSuggestions';
import { getItemsByQuery, getSingleItemByQuery } from '../../../hooks/queryFirebase';
import CustomSnackBar, { StateSnackBar } from '../../../Components/snackBar/customsnackbar';
import { RootState } from '../../../store/reducer/store';
import { setError } from '../../../store/reducer/reducer';
import { useTableKeys } from '../../../hooks/tableKey';
import { formatDescription } from '../../../utils/formattedString';
import { setLoadingGlobal } from '../../../store/reducer/loadingSlice';



function AtualizarEstoque() {
    const [key, setKey] = useState<number>(0);
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const error = useSelector((state: RootState) => state.user.error);
    const loadingGlobal = useSelector((state: RootState) => state.loading.loadingGlobal);
    const [recarregueDashboard, setRecarregueDashboard] = useState<boolean>(true);
    const [deleteData, setDeleteData] = useState<boolean>();
    const [editData, setEditData] = useState<ComprasModel>();
    const tableKeys = useTableKeys();
    const dispatch = useDispatch();
    const { convertToNumber, formatCurrency, formatCurrencyRealTime, NumberFormatForBrazilianCurrency } = useFormatCurrency();
    const { removedStockCompras, updateStock } = useEstoque();
    const { onKeyPressHandleSubmit } = useHandleInputKeyPress();
    const { calculateValueDashboard } = useCalculateValueDashboard(recarregueDashboard, setRecarregueDashboard);

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ComprasModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues: {
            cdProduto: '',
            nmProduto: '',
            vlUnitario: 0,
            dtCompra: null,
            quantidade: 0,
            totalPago: null,
            tpProduto: null,
            qntMinima: null,
        },
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
        onSubmit: editData ? handleEditRow : handleSubmitForm,
    });

    /**
     * Deleta uma linha da tabela e do banco de dados.
     * Deleta Da Tabela de Estoque a quantidade e a versao de acordo com o item selecionado
     */
    async function handleDeleteRow(selected: ComprasModel | undefined) {
        if (selected) {
            dispatch(setLoadingGlobal(true))
            const refID: string = selected.id ?? '';
            await deleteDoc(doc(db, tableKeys.Compras, refID));
            const versoesValidas = await getSingleItemByQuery<EstoqueModel>(tableKeys.Estoque, [where('nmProduto', '==', selected.nmProduto)], dispatch)
            //TODO: atualizar para id. ja alterei preciso testar

            if (versoesValidas) {
                const refIdEstoque: string = versoesValidas.id ?? ''
                const refTable = doc(db, tableKeys.Estoque, refIdEstoque);
                const versoes = versoesValidas.versaos.filter(versao => versao.idVersao !== selected.id)
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
            setDeleteData(true)
            dispatch(setLoadingGlobal(false))
        }
    }

    /**
     * Recalcula os valores dos produtos que estão sendo atualizados no estoque.
     * 
     * Exemplo: atualizando o chocolate, a moreninha tem em sua composição o chocolate, então se mudou o preço do chocolate,
     * ira mudar o preço da moreninha em consequencia, pois isso precisa recalcular novamente.
     * @param valuesUpdate - Valores atualizados.
     * @param produtosEncontrado - Array onde os produtos encontrados serão armazenados.
     */
    async function recalculateProduct(valuesUpdate: ComprasModel, produtosEncontrado: ProdutosModel[], todosProdutos: ProdutosModel[]) {
        const produtosQueUsamProdutoEditado = todosProdutos.filter(produto =>
            produto.mpFabricado.some(mp => mp.nmProduto === valuesUpdate.nmProduto)
        );

        produtosQueUsamProdutoEditado.forEach(produto => {
            const novoValorUnitario = calculateNewUnitario(valuesUpdate, produto);
            const newProduto = { ...produto, vlUnitario: novoValorUnitario };
            produtosEncontrado.push(newProduto);
        })
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
    async function recalculateProductFound(produtosEncontrado: ProdutosModel[], todosProdutos: ProdutosModel[]) {
        await Promise.all(
            produtosEncontrado.map(async (item) => {
                if (item.tpProduto === SituacaoProduto.FABRICADO && item.stMateriaPrima) {
                    const foundProductUpdate = foundKgProduto(item);
                    if (!produtosEncontrado.includes(item)) produtosEncontrado.push(item);

                    const produtosQueUsamProdutoEditado = todosProdutos.filter(produto =>
                        produto.mpFabricado.some(mp => mp.nmProduto === item.nmProduto)
                    );

                    // Para cada produto que utiliza o item editado
                    produtosQueUsamProdutoEditado.forEach(produto => {
                        const novoValorUnitario = calculateNewUnitario(item, produto, foundProductUpdate);
                        const newProduto = { ...produto, vlUnitario: novoValorUnitario };
                        produtosEncontrado.push(newProduto);
                    });
                }
            })
        );
    }
    function calculateNewUnitario(item: ProdutosModel | ComprasModel, produto: ProdutosModel, itemAtualizando?: ProdutosModel): number {
        let soma = 0.0;
        produto.mpFabricado.forEach(mp => {
            const unitario = mp.nmProduto === item.nmProduto
                ? (itemAtualizando ? itemAtualizando.vlUnitario : item.vlUnitario)
                : mp.vlUnitario;

            if (mp.nmProduto === item.nmProduto) mp.vlUnitario = item.vlUnitario
            soma += unitario * mp.quantidade;
        });
        return parseFloat(soma.toFixed(2));
    }
    /**
     * Cria ou atualiza o estoque com base nos valores fornecidos.
     * 
     * @param valuesUpdate - Valores atualizados.
     */
    async function createStock(valuesUpdate: ComprasModel, idCompra: string | undefined) {
        const estoqueExistente = await getSingleItemByQuery<EstoqueModel>(tableKeys.Estoque, [where('nmProduto', '==', valuesUpdate.nmProduto)], dispatch);
        const novaVersao = criarNovaVersao(idCompra ?? '', valuesUpdate.quantidade);

        if (estoqueExistente) {
            const refID: string = estoqueExistente.id ?? '';
            const refTable = doc(db, tableKeys.Estoque, refID);
            let quantidadeKg = valuesUpdate.quantidade;
            if (valuesUpdate.kgProduto && valuesUpdate.kgProduto !== 1) {
                quantidadeKg = valuesUpdate.kgProduto * valuesUpdate.quantidade;
            }
            const novaQuantidade = quantidadeKg + estoqueExistente.quantidade;

            // Atualizando o estoque com a nova quantidade e as novas versões
            await updateDoc(refTable, {
                quantidade: novaQuantidade,
                versaos: arrayUnion(novaVersao),
                idsVersoes: arrayUnion(novaVersao.idVersao),
                nmProduto: valuesUpdate.nmProduto,
                cdProduto: valuesUpdate.cdProduto,
                qntMinima: valuesUpdate.qntMinima,
                tpProduto: valuesUpdate.tpProduto,
                stEstoqueInfinito: valuesUpdate.stEstoqueInfinito
            });
        } else {
            await addDoc(collection(db, tableKeys.Estoque), {
                nmProduto: valuesUpdate.nmProduto,
                cdProduto: valuesUpdate.cdProduto,
                qntMinima: valuesUpdate.qntMinima,
                tpProduto: valuesUpdate.tpProduto,
                stEstoqueInfinito: valuesUpdate.stEstoqueInfinito,
                quantidade: valuesUpdate.quantidade,
                versaos: [novaVersao],
                idsVersoes: [novaVersao.idVersao]
            });
        }
    }

    function criarNovaVersao(id: string, quantidade: number): Versao {
        return {
            idVersao: id,
            vrQntd: quantidade
        };
    }
    /**
    * Atualiza os valores no banco de dados.
    * @param valuesUpdate - Array de valores a serem atualizados.
    * @param nameCollection - Nome da coleção no banco de dados.
    */
    function updateValuesInBatch(valuesUpdate: ProdutosModel[], nameCollection: string) {
        const batch = writeBatch(db);
        valuesUpdate.forEach(item => {
            const refID: string = item.id ?? '';
            const refTable = doc(db, nameCollection, refID);
            batch.update(refTable, { ...item });
        });
        return batch.commit();
    }

    /**
     * Recalcula os produtos e clientes com base nos valores fornecidos.
     * @param valuesUpdate  - Valores atualizados.
     */
    async function recalculate(valuesUpdate: ComprasModel) {
        const produtosEncontrado: ProdutosModel[] = [];
        const { data: todosProdutos } = await getItemsByQuery<ProdutosModel>(
            tableKeys.Produtos,
            [where('tpProduto', '==', SituacaoProduto.FABRICADO)],
            dispatch
        );
        await recalculateProduct(valuesUpdate, produtosEncontrado, todosProdutos);
        await recalculateProductFound(produtosEncontrado, todosProdutos);
        updateValuesInBatch(produtosEncontrado, tableKeys.Produtos);
    }


    /**
     * Envia o formulário para o banco de dados. 
     */
    async function handleSubmitForm() {
        dispatch(setLoadingGlobal(true));
        const valuesUpdate: ComprasModel = {
            ...values,
            vlUnitario: convertToNumber(values.vlUnitario.toString()),
            totalPago: values.totalPago && convertToNumber(values.totalPago?.toString())
        };
        try {
            if (valuesUpdate.tpProduto === SituacaoProduto.COMPRADO) {

                const product = await getSingleItemByQuery<ProdutosModel>(tableKeys.Produtos, [where('nmProduto', '==', valuesUpdate.nmProduto)], dispatch);
                if (product) {
                    const needUpdate = product?.vlUnitario !== valuesUpdate.vlUnitario
                    if (needUpdate && product.stMateriaPrima) {
                        recalculate(valuesUpdate)
                        const refID: string = product.id ?? '';
                        const refTable = doc(db, tableKeys.Produtos, refID);
                        const updatedData = { vlUnitario: valuesUpdate.vlUnitario };
                        await updateDoc(refTable, updatedData);
                    }
                }
                if (valuesUpdate.totalPago) {
                    calculateValueDashboard(valuesUpdate.totalPago, valuesUpdate.dtCompra, TelaDashboard.COMPRA)
                }
            }
            if (values.tpProduto === SituacaoProduto.FABRICADO) {
                if (valuesUpdate.stEstoqueInfinito) {
                    valuesUpdate.quantidade = Number.MAX_SAFE_INTEGER
                } else {
                    await removedStockCompras(valuesUpdate.mpFabricado, valuesUpdate.quantidade)
                }
            }
            const compraRef = await addDoc(collection(db, tableKeys.Compras), {
                ...valuesUpdate
            })
            await createStock(valuesUpdate, compraRef.id);
            setEditData(valuesUpdate)
            setOpenSnackBar(prev => ({ ...prev, success: true }))
            dispatch(setLoadingGlobal(false))
        } catch (error) {
            dispatch(setError("Erro ao Atualizar Estoque"))
            setOpenSnackBar(prev => ({ ...prev, error: true }))
            return;
        }
        resetForm()
        setKey(Math.random());
        setRecarregueDashboard(true)
    }

    /**
     * Atualiza o valor pago ou valor Unitario, considerando a quantidade, valor unitário ou Total Pago.
     */
    useEffect(() => {
        if (editData) return;
        else {
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
    }, [values.quantidade, values.totalPago, editData?.quantidade, editData?.totalPago])
    /**
     * Edita uma linha da tabela e do banco de dados, atualizando também o estoque correspondente.
     */
    async function handleEditRow() {
        dispatch(setLoadingGlobal(true))
        if (values.totalPago) {
            values.vlUnitario = convertToNumber(values.vlUnitario.toString())
            values.totalPago = convertToNumber(values.totalPago.toString())
            const refID: string = values.id ?? '';
            const refTable = doc(db, tableKeys.Compras, refID);
            const estoque: EstoqueModel = {
                nmProduto: values.nmProduto,
                cdProduto: values.cdProduto,
                qntMinima: values.qntMinima || 0,
                quantidade: values.quantidade,
                tpProduto: values.tpProduto || 0,
                versaos: [],
            }
            updateStock(estoque, values.id)
            values.totalPago = convertToNumber(values.totalPago?.toString() ?? '')
            values.vlUnitario = convertToNumber(values.vlUnitario.toString())

            await updateDoc(refTable, { ...values })
                .then(() => {
                    setEditData(values)
                });
        }
        resetForm()
        dispatch(setLoadingGlobal(false))
    }

    /**
     * Manipula a seleção de um valor no campo de autocompletar, preenchendo os campos do formulário com os valores correspondentes.
     * @param newValue  - Novo valor selecionado.
     * @param reason - Razão da mudança.
     */
    function handleAutoComplete(_: React.SyntheticEvent<Element, Event>, newValue: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            resetForm();
            setKey(Math.random());
        } else if (newValue) {
            setFieldValue('nrOrdem', newValue.nrOrdem);
            setFieldValue('cdProduto', newValue.cdProduto);
            setFieldValue('vlUnitario', formatCurrency(newValue.vlUnitario.toString()));
            setFieldValue('qntMinima', newValue.qntMinima);
            setFieldValue('nmProduto', newValue.nmProduto);
            setFieldValue('kgProduto', newValue.kgProduto);
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
    useEffect(() => { setFieldValue("stEstoqueInfinito", false) }, [values.tpProduto])

    //TODO: Testar novamente todos os passar do atualizar o estoque. ta faltando verificar se ele ta descontando e acrescentando no estoque
    const suggestions: ComprasModel[] = useDebouncedSuggestions<ComprasModel>(formatDescription(values.nmProduto), tableKeys.Produtos, dispatch, 'Produto', values.tpProduto ?? 0);

    return (
        <Box sx={{ padding: '5rem' }}>
            <Typography variant="h4" gutterBottom>Atualização de estoque</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="body1">Situação do produto</Typography>
                    <ToggleButtonGroup
                        exclusive
                        value={values.tpProduto}
                        onChange={(e, newValue) => setFieldValue('tpProduto', newValue)}
                    >
                        <ToggleButton value={SituacaoProduto.FABRICADO}>Fabricado</ToggleButton>
                        <ToggleButton value={SituacaoProduto.COMPRADO}>Comprado</ToggleButton>
                    </ToggleButtonGroup>
                    {touched.tpProduto && errors.tpProduto && (
                        <Typography color="error">{errors.tpProduto}</Typography>
                    )}
                </Grid>

                <Grid item xs={3} >
                    <Autocomplete
                        freeSolo
                        key={key}
                        options={suggestions}
                        value={suggestions.find((item: any) => item.nmProduto === values.nmProduto) || null}
                        getOptionLabel={(option: any) => option && option.nmProduto ? option.nmProduto : ""}
                        onChange={(_, newValue, reason) => handleAutoComplete(_, newValue, reason)}
                        onInputChange={(_, newInputValue, reason) => {
                            if (reason === 'clear') handleAutoComplete(_, null, 'clear');
                            setFieldValue('nmProduto', newInputValue);
                        }}
                        disabled={values.tpProduto === null}
                        renderInput={(params) => (
                            <TextField {...params} label="Nome do Produto" variant="standard" />
                        )}
                    />
                </Grid>

                <Grid item xs={3}>
                    <Input
                        key={`Quantidade-${key}`}
                        label="Quantidade"
                        name="quantidade"
                        disabled={values.stEstoqueInfinito}
                        value={values.stEstoqueInfinito ? '\u221E' : values.quantidade || ''}
                        onChange={e => setFieldValue(e.target.name, parseFloat(e.target.value))}
                        error={touched.quantidade && errors.quantidade ? errors.quantidade : ''}
                    />
                </Grid>
                <Grid item xs={3}>
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
                    />
                </Grid>
                <Grid item xs={3}>
                    <Input
                        key={`totalPago-${key}`}
                        label="Valor Total"
                        onBlur={handleBlur}
                        disabled={values.tpProduto === SituacaoProduto.FABRICADO}
                        name="totalPago"
                        value={values.totalPago && values.totalPago.toString() !== 'R$ 0,00' ? values.totalPago : ''}
                        onChange={e => setFieldValue(e.target.name, formatCurrencyRealTime(e.target.value))}
                        maxLength={15}
                    />
                </Grid>

                <Grid item xs={3}>
                    <Input
                        key={`cdProduto-${key}`}
                        name="cdProduto"
                        label="Código do Produto"
                        value={values.cdProduto}
                        onChange={e => setFieldValue(e.target.name, e.target.value.replace(/[^\d]/g, ''))}
                        error={touched.cdProduto && errors.cdProduto ? errors.cdProduto : ''}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Input
                        key={`dtCompra-${key}`}
                        label="Data"
                        name="dtCompra"
                        value={values.dtCompra ?? ''}
                        onChange={e => setFieldValue(e.target.name, formatDate(e.target.value))}
                        error={touched.dtCompra && errors.dtCompra ? errors.dtCompra : ''}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Input
                        key={`qntMinima - ${key}`}
                        label="Quant. mínima em estoque"
                        onBlur={handleBlur}
                        name="qntMinima"
                        value={values.qntMinima || ''}
                        onChange={e => setFieldValue(e.target.name, parseFloat(e.target.value.replace(/[^\d]/g, '')))}
                        maxLength={4}
                        error={touched.qntMinima && errors.qntMinima ? errors.qntMinima : ''}
                        onKeyPress={e => onKeyPressHandleSubmit(e, handleSubmit)}
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControlLabel
                        style={{ height: '70px' }}
                        disabled={values.tpProduto === SituacaoProduto.COMPRADO}
                        control={
                            <Switch
                                checked={values.stEstoqueInfinito}
                                onChange={(e) => setFieldValue("stEstoqueInfinito", e.target.checked)}
                                color="primary" // Você pode mudar a cor para "secondary" se preferir
                            />
                        }
                        label="Estoque infinito?"
                    />
                </Grid>
            </Grid>

            {/* Botão de submissão */}
            <Box mt={4} display="flex" justifyContent="flex-end">
                <Button
                    type='button'
                    label={editData ? 'Atualizar' : 'Cadastrar'}
                    onClick={handleSubmit}
                    disabled={loadingGlobal}
                    style={{ width: '12rem', height: '4rem' }}
                />
            </Box>


            {/* Tabela de produtos */}
            <GenericTable
                columns={[
                    { label: 'Código', name: 'cdProduto', shouldApplyFilter: true },
                    { label: 'Nome', name: 'nmProduto', shouldApplyFilter: true },
                    { label: 'Data', name: 'dtCompra', shouldApplyFilter: true },
                    { label: 'Valor Unitario', name: 'vlUnitario', isCurrency: true },
                    { label: 'Quantidade', name: 'quantidade', isInfinite: true },
                    { label: 'Valor Total', name: 'totalPago', isCurrency: true }
                ]}
                onEdit={(row: ComprasModel | undefined) => {
                    if (!row) return;
                    setEditData(row)
                    setFieldValue('cdProduto', row.cdProduto);
                    setFieldValue('nmProduto', row.nmProduto);
                    setFieldValue('dtCompra', row.dtCompra);
                    setFieldValue('vlUnitario', NumberFormatForBrazilianCurrency(row.vlUnitario));
                    setFieldValue('quantidade', row.quantidade);
                    setFieldValue('totalPago', NumberFormatForBrazilianCurrency(row.totalPago ?? 0));
                    setFieldValue('qntMinima', row.qntMinima);
                    setFieldValue('stEstoqueInfinito', row.stEstoqueInfinito);
                    setFieldValue('tpProduto', row.tpProduto);
                    setFieldValue('id', row.id);
                }}
                deleteData={deleteData}
                collectionName={tableKeys.Compras}
                setEditData={setEditData}
                editData={editData}
                onDelete={(selected: ComprasModel | undefined) => { handleDeleteRow(selected) }}
            />
            <CustomSnackBar message={error ? error : "Atualizado Estoque com sucesso"} open={openSnackBar} setOpen={setOpenSnackBar} />
        </Box>
    );
}

export default AtualizarEstoque;