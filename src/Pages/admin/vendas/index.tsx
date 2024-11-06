/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Yup from 'yup';
import { format } from "date-fns";
import { useFormik } from 'formik';
import { db } from "../../../firebase";
import { CgAddR } from 'react-icons/cg';
import { IoMdClose } from "react-icons/io";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import GetData from "../../../firebase/getData";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { addDoc, collection, where } from "firebase/firestore";
import VendaModel from "./model/vendas";
import TelaDashboard from '../../../enumeration/telaDashboard';
import ProdutosModel from "../cadastroProdutos/model/produtos";
import { setError, setLoading } from '../../../store/reducer/reducer';
import SituacaoProduto from "../../../enumeration/situacaoProduto";
import iceCreamSad from '../../../assets/Image/drawingSadIceCream.png';
import MUIButton from "@mui/material/Button";

//hooks
import useEstoque from '../../../hooks/useEstoque';
import useFormatCurrency from '../../../hooks/formatCurrency';
import useHandleInputKeyPress from '../../../hooks/useHandleInputKeyPress';
import { useCalculateValueDashboard } from '../../../hooks/useCalculateValueDashboard';
import useDeleteOldData from '../../../hooks/useDeleteOldData';
import { TableManagement } from './components/tableManagement/tableManagement';
import { RootState } from '../../../store/reducer/store';
import { SubProdutoModel } from '../cadastroProdutos/model/subprodutos';
import CustomSnackBar, { StateSnackBar } from '../../../Components/snackBar/customsnackbar';
import { Autocomplete, AutocompleteChangeReason, Box, Grid, TextField, Typography } from '@mui/material';
import { getSingleItemByQuery } from '../../../hooks/queryFirebase';
import useDebouncedSuggestions from '../../../hooks/useDebouncedSuggestions';
import { useTableKeys } from '../../../hooks/tableKey';
import { formatDescription } from '../../../utils/formattedString';


interface VendaProps {
    qntdBolas?: number
    multiplica?: number
    barcode?: string
    productSelected?: ProdutosModel
}

const objClean: VendaModel = {
    vlTotal: 0,
    dtProduto: null,
    vlRecebido: 0,
    vlTroco: 0,
    produtoEscaniado: [],
    vlLucroTotal: 0
}
function Vendas() {
    const [key, setKey] = useState<number>(0);
    const [recarregueDashboard, setRecarregueDashboard] = useState<boolean>(true);
    const [showTableManegement, setShowTableManegement] = useState<boolean>(false);
    const [fecharComanda, setFecharComanda] = useState<VendaModel>({ ...objClean })
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state: RootState) => state.user);
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const tableKeys = useTableKeys();

    const { removedStock } = useEstoque();
    const { deleteVendas } = useDeleteOldData();
    const { NumberFormatForBrazilianCurrency, convertToNumber, formatCurrencyRealTime } = useFormatCurrency();
    const { calculateValueDashboard } = useCalculateValueDashboard(recarregueDashboard, setRecarregueDashboard);

    const {
        dataTable: dataTableVenda,
    } = GetData(tableKeys.Vendas, true) as { dataTable: VendaModel[] };

    const initialValues: VendaModel = ({ ...objClean });

    const formik = useFormik<VendaProps>({
        initialValues: {
            qntdBolas: undefined,
            multiplica: undefined,
            barcode: '',
            productSelected: undefined
        },
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: () => { }
    })

    const {
        onKeyPressHandleSubmit,
        inputRef,
        inputRefF4,
        inputRefF3
    } = useHandleInputKeyPress(formik.setFieldValue);

    const { values, handleSubmit, setFieldValue, touched, errors, handleBlur, resetForm } = useFormik<VendaModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            vlRecebido: Yup.string().required("Campo Obrigatório")
                .test('vlRecebido', 'Valor Invalido', (value) => {
                    const numericValue = value.replace(/[^\d]/g, '');
                    return parseFloat(numericValue) > 0;
                })
                .test('vlRecebidoMaiorQueVlTotal', 'Valor não deve ser menor que o total', function (value) {
                    const numericValue = parseFloat(value.replace(/[^\d]/g, '')) / 100;
                    let vlTotal = this.parent.vlTotal;
                    if (typeof vlTotal === 'string') {
                        vlTotal = parseFloat(vlTotal.replace(/[^\d]/g, '')) / 100;
                    }
                    if (isNaN(vlTotal)) return true;
                    return numericValue >= vlTotal;
                })
        }),
        onSubmit: handleSubmitForm,
    });
    useEffect(() => {
        if (dataTableVenda.length)
            deleteVendas(dataTableVenda)
    }, [dataTableVenda])
    /**
     * atualizar a data em tempo real.
     * 
     * atualiza o valor do campo 'dtProduto' no formulário com a data e hora atuais 
     * sempre que há uma mudança no valor de 'vlRecebido'.
     */
    useEffect(() => {
        const data = new Date();
        const dataFormatada = format(data, 'dd/MM/yyyy HH:mm');
        setFieldValue('dtProduto', dataFormatada);
    }, [values.vlRecebido]);

    useEffect(() => {
        setFieldValue('produtoEscaniado', fecharComanda.produtoEscaniado);
    }, [fecharComanda])

    /**
     * Função para calcular totais com base nos valores fornecidos.
     * 
     * @param vlVendaProduto - Valor de venda do produto.
     * @param quantidade - Quantidade do produto.
     * @param vlUnitario - Valor unitário do produto.
     * @returns Objeto contendo os valores calculados: valorTotal e formatTotalLucro.
     */
    function calcularTotais(vlVendaProduto: number, quantidade: number, vlUnitario: number) {
        const valorTotal = quantidade * vlVendaProduto;
        const total = vlVendaProduto - vlUnitario;
        const totalLucro = total * quantidade;
        const formatTotalLucro = parseFloat(totalLucro.toFixed(2))

        return { valorTotal, formatTotalLucro };
    }

    /**
     * Função para adicionar um produto ao array 'produtoEscaniado'.
     * 
     * @param values - Valores do formulário.
     * @param novoProduto - Novo produto a ser adicionado.
     */
    function adicionarProdutoAoArray(values: VendaModel, novoProduto: SubProdutoModel) {
        const novoArrayProdutos = [...values.produtoEscaniado, novoProduto];
        setFieldValue('produtoEscaniado', novoArrayProdutos);
    }

    useEffect(() => {
        fetchAndProcessProduct();
    }, [formik.values.productSelected]);

    /**
    * Função chamada ao pressionar Tecla.
    * 
    * @param e - Evento de teclado.
    */
    const handleMultiplicaKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        const isBarcodeNumeric = !isNaN(Number(formik.values.barcode));
        if (isBarcodeNumeric) return;
        fetchAndProcessProduct();
    };

    const fetchAndProcessProduct = async () => {
        formik.setFieldTouched('barcode', true);
        if (formik.values.productSelected)
            processProduct(formik.values.productSelected);
    };


    const processProduct = (produto: ProdutosModel) => {
        const { vlVendaProduto, vlUnitario } = produto;
        const quantidade = formik.values.multiplica ?? 1;
        const { valorTotal, formatTotalLucro } = calcularTotais(vlVendaProduto, quantidade, vlUnitario);

        const novoProduto: SubProdutoModel = {
            ...produto,
            vlTotalMult: valorTotal,
            quantidade,
            vlLucro: formatTotalLucro
        } as SubProdutoModel;

        adicionarProdutoAoArray(values, novoProduto);

        // Reset dos estados
        formik.setFieldValue('barcode', '');
        formik.setFieldValue('multiplica', undefined);
        setKey(Math.random());
    };

    useEffect(() => {
        /**
         * Função auxiliar para calcular o total de um campo específico
         * de produtos escaneados, ignorando valores inválidos.
         */
        const calcularTotal = (campo: keyof SubProdutoModel) => {
            return values.produtoEscaniado
                .map((produto) => produto[campo])
                .reduce((total, valor) => {
                    const valorNumerico = typeof valor === 'number' ? valor : 0;
                    const totalNumerico = typeof total === 'number' ? total : 0;
                    return totalNumerico + parseFloat(valorNumerico.toFixed(2));
                }, 0 as number);
        };

        // Calcula o total de venda e o total de lucro
        const precoTotal = calcularTotal('vlTotalMult');
        const precoTotalLucro = calcularTotal('vlLucro');

        setFieldValue('vlTotal', precoTotal);
        setFieldValue('vlLucroTotal', precoTotalLucro);
    }, [values.produtoEscaniado]);

    /**
     * calcular o troco com base no valor recebido.
     */
    useEffect(() => {
        const vlRecebido = convertToNumber(values.vlRecebido.toString())
        const troco = vlRecebido - values.vlTotal
        setFieldValue('vlTroco', troco)
    }, [values.vlRecebido, values.vlTroco])


    /**
     * Função para enviar os valores para o banco de dados.
     */
    async function handleSubmitForm() {
        dispatch(setLoading(true))
        const valuesUpdate: VendaModel = {
            ...values,
            vlRecebido: convertToNumber(values.vlRecebido.toString())
        };
        calculateValueDashboard(valuesUpdate.vlTotal, valuesUpdate.dtProduto, TelaDashboard.VENDA, valuesUpdate.vlLucroTotal)
        await addDoc(collection(db, tableKeys.Vendas), {
            ...valuesUpdate
        }).then(() => {
            dispatch(setLoading(false))
            removedStock(values.produtoEscaniado)
            setOpenSnackBar(prev => ({ ...prev, success: true }))
        }).catch(() => {
            dispatch(setLoading(false))
            dispatch(setError('Erro ao Cadastrar Venda'))
            setOpenSnackBar(prev => ({ ...prev, error: true }))
        });
        resetForm()
        setRecarregueDashboard(true)
        setKey(Math.random())

    }

    /**
     * adiciona um produto com base no código de barras, quantidade e se é uma taça.
     * 
     * @param nomeProduto - Código do produto.
     * @param quantidade - Quantidade do produto.
     * @param isTaca - Indica se é uma taça.
     */
    async function addProduct(nomeProduto: string, isTaca?: boolean) {
        const produtoEncontrado = await getSingleItemByQuery<ProdutosModel>(
            tableKeys.Produtos,
            [where('nmProduto', '==', nomeProduto)],
            dispatch
        );
        if (produtoEncontrado) {
            const { mpFabricado, ...rest } = produtoEncontrado;
            const novoProduto = createSubProduct(rest, isTaca, formik.values.qntdBolas);
            if (novoProduto) {
                adicionarProdutoAoArray(values, novoProduto);
                if (isTaca) {
                    formik.setFieldValue('qntdBolas', undefined);
                    setKey(Math.random());
                }
            } else {
                formik.setFieldError('qntdBolas', 'Campo Obrigatório para Taça');
                formik.setFieldTouched('qntdBolas', true, false);
            }
        }
    }
    function createSubProduct(produto: Partial<ProdutosModel>, isTaca?: boolean, quantidade?: number): SubProdutoModel | null {
        if (!produto.vlVendaProduto || !produto.vlUnitario) return null;
        if (isTaca && !quantidade) return null;
        const totalLucro = produto.vlVendaProduto - produto.vlUnitario;
        if (!quantidade) {
            return { ...produto, quantidade: 1, vlLucro: totalLucro, vlTotalMult: produto.vlVendaProduto } as SubProdutoModel;
        } else {
            const valorTotal = quantidade * produto.vlVendaProduto;
            return { ...produto, vlLucro: totalLucro, quantidade, vlTotalMult: valorTotal } as SubProdutoModel;
        }
    }
    /**
     * Função chamada ao mudar o valor do input de código de barras.
     * 
     * @param e - Evento de mudança.
     */
    const handleInputChange = async (_: React.SyntheticEvent<Element, Event>, value: any, reason: AutocompleteChangeReason) => {
        if (reason === 'clear' || reason === 'removeOption') {
            formik.resetForm()
            setKey(Math.random());
        } else {
            formik.setFieldValue('productSelected', value)
        }
    };

    /**
     * Função para manipular a mudança no input de quantidade para taça Sundae.
     * 
     * @param e - Evento de mudança.
     */
    function handleChangeTacaSundae(e: React.ChangeEvent<HTMLInputElement>) {
        const inputValue = parseFloat(e.target.value);
        if (!isNaN(inputValue) && inputValue !== 0) {
            formik.setFieldValue('qntdBolas', inputValue);
        } else {
            formik.setFieldValue('qntdBolas', undefined);
            setKey(Math.random())
        }
    }

    /**
     * Função para remover um produto do array 'produtoEscaniado'.
     * 
     * @param index - Índice do produto a ser removido.
     */
    function removedProdutoEscaneado(index: number) {
        const remove = values.produtoEscaniado.filter((_, i) => i !== index)
        setFieldValue('produtoEscaniado', remove);
    }

    const suggestions: ProdutosModel[] = useDebouncedSuggestions<ProdutosModel>(formatDescription(formik.values.barcode ?? ''), tableKeys.Produtos, dispatch, "Produto", undefined, false);

    return (
        <Box sx={{ padding: '5rem 8rem' }}>
            <Typography variant="h4" gutterBottom>Painel de Vendas</Typography>
            <Grid container >
                <Grid item xs={12} >
                    <Grid sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Input
                            key={`multiplica${key}`}
                            label="multiplicar ?"
                            name="quantidadeVenda"
                            value={formik.values.multiplica}
                            type='number'
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => formik.setFieldValue('multiplica', e.target.value)}
                            inputRef={inputRef}
                            onKeyDown={handleMultiplicaKeyPress}
                        />
                        <Button
                            label='Mesas'
                            type="button"
                            onClick={() => { setShowTableManegement(!showTableManegement) }}
                            style={{ height: 40, width: 150 }}
                        />
                    </Grid>
                    {
                        showTableManegement ?
                            <TableManagement
                                showTableManegement={showTableManegement}
                                setFecharComanda={setFecharComanda}
                                setShowTableManegement={setShowTableManegement}
                                produtoEscaniadoList={values.produtoEscaniado}
                            />
                            : null
                    }
                    <Autocomplete
                        freeSolo
                        key={key}
                        options={suggestions}
                        value={suggestions.find((item: any) => item.nmProduto === formik.values.barcode) || null}
                        getOptionLabel={(option: any) => option && option.nmProduto ? option.nmProduto : ""}
                        onChange={(_, newValue, reason) => handleInputChange(_, newValue, reason)}

                        onKeyUp={handleMultiplicaKeyPress}
                        onInputChange={(_, newInputValue, reason) => {
                            if (reason === 'clear') handleInputChange(_, null, 'clear');
                            formik.setFieldValue('barcode', newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                inputRef={inputRefF3}
                                label="Buscar Produto"
                                variant="standard"
                                error={Boolean(formik.touched.barcode && formik.errors.barcode)}
                                helperText={formik.touched.barcode && formik.errors.barcode ? formik.errors.barcode : ""}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} mt={2}>
                    <Grid sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Grid item xs={2}>
                            <Grid>
                                <Grid container direction="column" spacing={2}>
                                    <Grid item>
                                        <MUIButton variant="contained" startIcon={<CgAddR />} onClick={() => addProduct('cascao')}>
                                            Cascão
                                        </MUIButton>
                                    </Grid>
                                    <Grid item>
                                        <MUIButton variant="contained" startIcon={<CgAddR />} onClick={() => addProduct('casquinha')}>
                                            Casquinha
                                        </MUIButton>
                                    </Grid>
                                    <Grid item>
                                        <MUIButton
                                            sx={{ minWidth: '11rem', justifyContent: 'flex-start' }}
                                            variant="contained"
                                            startIcon={<CgAddR />}
                                            onClick={() => addProduct('taçasundae', true)}
                                        >
                                            Taça Sundae
                                        </MUIButton>
                                        <Input
                                            name="qntdBolas"
                                            key={`bolasSundae${key}`}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.qntdBolas && formik.errors.qntdBolas ? formik.errors.qntdBolas : ""}
                                            label="Qnt. bolas sundae?"
                                            onChange={handleChangeTacaSundae}
                                            value={formik.values.qntdBolas}
                                        />
                                    </Grid>
                                </Grid>
                                <Input
                                    key={`valorRecebido${key}`}
                                    label="Valor Pago"
                                    error={touched.vlRecebido && errors.vlRecebido ? errors.vlRecebido : ''}
                                    name="vlRecebido"
                                    heightDiv={'85px'}
                                    onBlur={handleBlur}
                                    inputRef={inputRefF4}
                                    value={values.vlRecebido !== 0 ? values.vlRecebido : ''}
                                    onKeyDown={e => onKeyPressHandleSubmit(e, handleSubmit)}
                                    onChange={e => { setFieldValue('vlRecebido', formatCurrencyRealTime(e.target.value)) }}
                                />
                                <Typography variant="h6">Total: {values.vlTotal ? NumberFormatForBrazilianCurrency(values.vlTotal) : ''}</Typography>
                                <Typography variant="h6">Troco: {values.vlTroco ? NumberFormatForBrazilianCurrency(values.vlTroco) : ' -'}</Typography>
                            </Grid>
                            <Grid mt={2}>
                                <Button
                                    label='Finalizar venda'
                                    disabled={values.produtoEscaniado.length === 0 || loading}
                                    type="button"
                                    onClick={handleSubmit}
                                    style={{ height: 80, width: 200 }}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={6}
                            sx={{
                                height: '25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                marginTop: 2,
                                borderRadius: '0px 0px 8px 8px',
                                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                            }}>
                            <Box
                                sx={{
                                    width: '100%',
                                    padding: 1,
                                    backgroundColor: '#3d6aff',
                                    color: 'white',
                                    textAlign: 'center',
                                    borderRadius: '8px 8px 0px 0px',
                                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.192)',
                                }}>
                                <Typography variant="h6">Produtos</Typography>
                            </Box>
                            <Box
                                className='style-scrollbar'
                                sx={{ width: '100%', overflow: 'auto', height: '23rem', padding: 1 }}
                            >
                                <Typography padding={1} variant="body1" fontWeight={600} fontSize={'18px'}>{`Data: ${values.dtProduto}`}</Typography>
                                {values.produtoEscaniado.length === 0 ? (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <img src={iceCreamSad} alt="" width={250} />
                                        <Typography variant="body1" fontStyle="italic">Nenhum Sorvetinho incluido</Typography>
                                    </Box>
                                ) : (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 1 }}>
                                            <Typography sx={{ width: '200px', overflow: 'hidden', fontWeight: 'bold', color: '#0a0269' }} variant="body1">Descrição do Produto</Typography>
                                            <Typography sx={{ width: '100px', textAlign: 'center', fontWeight: 'bold', color: '#0a0269' }} variant="body1">Quantidade</Typography>
                                            <Typography sx={{ width: '150px', textAlign: 'right', fontWeight: 'bold', color: '#0a0269' }} variant="body1">Valor do Produto</Typography>
                                        </Box>
                                        {values.produtoEscaniado.map((produto, index) => (
                                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', padding: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <IoMdClose
                                                        color="red"
                                                        onClick={() => removedProdutoEscaneado(index)}
                                                        style={{ marginRight: 7, cursor: 'pointer' }}
                                                    />
                                                    <Typography sx={{ width: '150px', overflow: 'hidden', fontWeight: 'bold' }}>
                                                        {produto.nmProduto}
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{ width: '100px', textAlign: 'center', fontWeight: 'bold' }}>{produto.quantidade}</Typography>
                                                <Typography sx={{ width: '150px', textAlign: 'right', fontWeight: 'bold' }}>
                                                    {produto.vlTotalMult ? NumberFormatForBrazilianCurrency(produto.vlTotalMult) : ''}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <CustomSnackBar message={error ? error : "Cadastrado Venda com sucesso"} open={openSnackBar} setOpen={setOpenSnackBar} />
        </Box>
    );
}

export default Vendas;