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
import { TableKey } from '../../../types/tableName';
import { useDispatch, useSelector } from 'react-redux';
import { addDoc, collection } from "firebase/firestore";
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
import { Box, Grid, ListItem, ListItemText, Paper, Typography } from '@mui/material';


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
    const [barcode, setBarcode] = useState("");
    const [ShowSuggestion, setShowSuggestion] = useState(false);
    const [isValidQntBolas, setIsValidQntBolas] = useState<boolean>(false);
    const [produtoNotFound, setProdutoNotFound] = useState<boolean>(false);
    const [qntBolas, setQntBolas] = useState<number | undefined>(undefined);
    const [multiplica, setMultiplica] = useState<number | undefined>(undefined);
    const [recarregueDashboard, setRecarregueDashboard] = useState<boolean>(true);
    const [productSuggestion, setProductSuggestion] = useState<ProdutosModel[]>([]);
    const [showTableManegement, setShowTableManegement] = useState<boolean>(false);
    const [fecharComanda, setFecharComanda] = useState<VendaModel>({ ...objClean })
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state: RootState) => state.user);
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });

    const { removedStock } = useEstoque();
    const { deleteVendas } = useDeleteOldData();
    const { NumberFormatForBrazilianCurrency, convertToNumber, formatCurrencyRealTime } = useFormatCurrency();
    const { calculateValueDashboard } = useCalculateValueDashboard(recarregueDashboard, setRecarregueDashboard);
    const {
        handleInputKeyDown,
        suggestionsRef,
        selectedSuggestionIndex,
        onKeyPressHandleSubmit,
        inputRef,
        inputRefF3,
        inputRefF4
    } = useHandleInputKeyPress(setShowSuggestion);

    //realizando busca no banco de dados
    const {
        dataTable: dataTableProduto,
    } = GetData(TableKey.Produtos, true) as { dataTable: ProdutosModel[] };

    const {
        dataTable: dataTableVenda,
    } = GetData(TableKey.Vendas, true) as { dataTable: VendaModel[] };

    const initialValues: VendaModel = ({ ...objClean });

    const { values, handleSubmit, setFieldValue, touched, errors, handleBlur, resetForm } = useFormik<VendaModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            vlRecebido: Yup.string().required("Campo Obrigatório").test('vlRecebido', 'Valor Invalido', (value) => {
                const numericValue = value.replace(/[^\d]/g, '');
                return parseFloat(numericValue) > 0;
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

    /**
     * ler código de barras em tempo real, buscar no banco e multiplicar o valor, se necessário.
     * 
     * verifica se o código de barras é numérico, busca o produto correspondente no banco de dados e realiza 
     * operações como multiplicação do valor de venda, adicionando o produto escaniado ao array 'produtoEscaniado'.
     */
    useEffect(() => {
        const isBarcodeNumeric = !isNaN(Number(barcode));
        const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === barcode);
        if (!produtoEncontrado) return;

        const vlVendaProduto = produtoEncontrado.vlVendaProduto

        if (multiplica && isBarcodeNumeric) {
            const { mpFabricado, ...rest } = produtoEncontrado;
            const { valorTotal, formatTotalLucro } = calcularTotais(vlVendaProduto, multiplica, produtoEncontrado.vlUnitario);
            const novoProduto: SubProdutoModel = { ...rest, vlTotalMult: valorTotal, quantidade: multiplica, vlLucro: formatTotalLucro } as SubProdutoModel;
            adicionarProdutoAoArray(values, novoProduto);
            setBarcode('')
            setMultiplica(undefined)
            setKey(Math.random())
        } else if (isBarcodeNumeric) {
            const { mpFabricado, ...rest } = produtoEncontrado;
            const { formatTotalLucro } = calcularTotais(vlVendaProduto, 1, produtoEncontrado.vlUnitario);
            const novoProduto: SubProdutoModel = { ...rest, quantidade: 1, vlLucro: formatTotalLucro, vlTotalMult: vlVendaProduto } as SubProdutoModel;
            adicionarProdutoAoArray(values, novoProduto);
            setBarcode('');
        }
    }, [barcode]);


    /**
     * Função chamada ao pressionar Tecla.
     * 
     * @param e - Evento de teclado.
     */
    const handleMultiplicaKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const isBarcodeNumeric = !isNaN(Number(barcode));
        if (e.key === 'Enter' && !isBarcodeNumeric) {
            const produtoEncontrado = dataTableProduto.find((p) => p.nmProduto.toLowerCase() === barcode.toLowerCase());
            if (multiplica) {
                if (produtoEncontrado) {
                    const { mpFabricado, ...rest } = produtoEncontrado;
                    const { valorTotal, formatTotalLucro } = calcularTotais(produtoEncontrado.vlVendaProduto, multiplica, produtoEncontrado.vlUnitario);
                    const novoProduto: SubProdutoModel = { ...rest, vlTotalMult: valorTotal, quantidade: multiplica, vlLucro: formatTotalLucro } as SubProdutoModel;
                    adicionarProdutoAoArray(values, novoProduto);

                    setBarcode('');
                    setMultiplica(undefined);
                    setKey(Math.random())
                    setProdutoNotFound(false)
                } else {
                    setProdutoNotFound(true)
                }
            } else {
                if (produtoEncontrado) {
                    const { mpFabricado, ...rest } = produtoEncontrado;
                    const { formatTotalLucro } = calcularTotais(produtoEncontrado.vlVendaProduto, 1, produtoEncontrado.vlUnitario);
                    const novoProduto: SubProdutoModel = { ...rest, quantidade: 1, vlLucro: formatTotalLucro, vlTotalMult: produtoEncontrado.vlVendaProduto } as SubProdutoModel;
                    adicionarProdutoAoArray(values, novoProduto);

                    setBarcode('');
                    setProdutoNotFound(false)
                } else {
                    setProdutoNotFound(true)
                }
            }
        }
    };

    /**
     * Função para limpar o estado do formulário.
     */
    function clearState() {
        setFieldValue('vlTotal', null)
        setFieldValue('dtProduto', '')
        setFieldValue('vlRecebido', '')
        setFieldValue('vlTroco', null)
        setFieldValue('produtoEscaniado', [])
        setFieldValue('tpProduto', SituacaoProduto.FABRICADO)
        setKey(Math.random())
        setIsValidQntBolas(false)
    }

    /**
     * calcular o valor total e o lucro total de todos os produtos adicionados.
     */
    useEffect(() => {
        //calculando todos os valores de total de venda
        const precoFiltrado = values.produtoEscaniado.map(scanner => scanner.vlTotalMult);
        const precoTotal = precoFiltrado.reduce((total, produto) => {
            if (typeof produto === 'number' && !isNaN(produto) && typeof total === 'number' && !isNaN(total)) {
                const produtoArredondado = parseFloat(produto.toFixed(2));
                return total + produtoArredondado;
            }
            return total;
        }, 0);

        //calculando todos os valores de total de lucro
        const precoFiltradoLucro = values.produtoEscaniado.map(scanner => scanner.vlLucro)
        const precoTotalLucro = precoFiltradoLucro.reduce((total, produto) => {
            if (typeof produto === 'number' && !isNaN(produto) && typeof total === 'number' && !isNaN(total)) {
                const produtoArredondado = parseFloat(produto.toFixed(2));
                return total + produtoArredondado;
            }
            return total;
        }, 0);

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
        await addDoc(collection(db, TableKey.Vendas), {
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
        clearState();
        resetForm()
        setRecarregueDashboard(true)
    }

    /**
     * adiciona um produto com base no código de barras, quantidade e se é uma taça.
     * 
     * @param cdProduto - Código do produto.
     * @param quantidade - Quantidade do produto.
     * @param isTaca - Indica se é uma taça.
     */
    function addProduct(cdProduto: string, quantidade?: number | undefined, isTaca?: boolean) {
        const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === cdProduto);
        if (produtoEncontrado) {
            const { mpFabricado, ...rest } = produtoEncontrado;
            let novoProduto: SubProdutoModel;
            if (!isTaca) {
                const valorPago = rest.vlUnitario;
                const totalLucro = rest.vlVendaProduto - valorPago;
                novoProduto = { ...rest, quantidade: 1, vlLucro: totalLucro, vlTotalMult: rest.vlVendaProduto } as SubProdutoModel;
                adicionarProdutoAoArray(values, novoProduto)
            } else {
                if (quantidade) {
                    const valorTotal = quantidade * rest?.vlVendaProduto;
                    novoProduto = { ...rest, vlVendaProduto: valorTotal, quantidade: quantidade, vlTotalMult: valorTotal } as SubProdutoModel;
                    adicionarProdutoAoArray(values, novoProduto)
                    setQntBolas(undefined);
                    setIsValidQntBolas(false)
                    setKey(Math.random())
                } else {
                    setIsValidQntBolas(true)
                }
            }
        }
    }

    /**
     * Função chamada ao mudar o valor do input de código de barras.
     * 
     * @param e - Evento de mudança.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const codigoDeBarras = e.currentTarget.value;
        setBarcode(codigoDeBarras);

        const resultados = dataTableProduto.filter(
            cod => cod.nmProduto.toLowerCase().includes(codigoDeBarras.toLowerCase()) &&
                (cod.stMateriaPrima === undefined || cod.stMateriaPrima === false)
        );

        if (resultados.length > 0) {
            setShowSuggestion(true);
            setProductSuggestion(resultados);
        } else {
            setShowSuggestion(false);
            setProductSuggestion([]);
        }
    };

    /**
     * Função para selecionar uma sugestão de produto.
     * 
     * @param produto - Produto selecionado.
     */
    const selectSuggestion = (produto: ProdutosModel) => {
        setBarcode(produto.nmProduto);
        setProductSuggestion([]);
        setShowSuggestion(false);
    };

    /**
     * Função para manipular a mudança no input de quantidade para taça Sundae.
     * 
     * @param e - Evento de mudança.
     */
    function handleChangeTacaSundae(e: React.ChangeEvent<HTMLInputElement>) {
        const inputValue = parseFloat(e.target.value);
        if (!isNaN(inputValue) && inputValue !== 0) {
            setQntBolas(inputValue);
        } else {
            setQntBolas(undefined);
            setKey(Math.random())
        }
    }

    /**
     * Função para remover um produto do array 'produtoEscaniado'.
     * 
     * @param index - Índice do produto a ser removido.
     */
    function removedProdutoEscaneado(index: number) {
        const remove = values.produtoEscaniado.filter((product, i) => i !== index)
        setFieldValue('produtoEscaniado', remove);
    }
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
                            value={multiplica}
                            style={{ fontSize: 14 }}
                            styleLabel={{ fontSize: 16 }}
                            onChange={(e) => setMultiplica(isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value))}
                            error={''}
                            inputRef={inputRef}
                            onKeyPress={handleMultiplicaKeyPress}
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
                                dataTableProduto={dataTableProduto}
                                setFecharComanda={setFecharComanda}
                                setShowTableManegement={setShowTableManegement}
                                produtoEscaniadoList={values.produtoEscaniado}
                            />
                            : null
                    }
                    <Input
                        error={produtoNotFound ? 'Nome não encontrado, verifique o nome e tente novamente' : ''}
                        label="Código do Produto:"
                        name=""
                        onChange={handleInputChange}
                        value={barcode}
                        inputRef={inputRefF3}
                        onKeyDown={(e) => handleInputKeyDown(e, productSuggestion, selectSuggestion)}
                        onKeyPress={handleMultiplicaKeyPress}
                        heightDiv={'50px'}
                    />
                    {ShowSuggestion && (
                        <Box sx={{ position: 'relative' }}>
                            <Paper
                                className='style-scrollbar'
                                sx={{
                                    position: 'absolute',
                                    width: '100%',
                                    maxHeight: 200,
                                    overflow: 'auto',
                                    zIndex: 2
                                }}
                                ref={suggestionsRef}
                            >
                                {productSuggestion.map((produto, index) => (
                                    <ListItem
                                        key={produto.id}
                                        onClick={() => selectSuggestion(produto)}
                                        sx={{
                                            backgroundColor: index === selectedSuggestionIndex ? 'primary.light' : 'inherit',
                                        }}
                                    >
                                        <ListItemText primary={produto.nmProduto} />
                                    </ListItem>
                                ))}
                            </Paper>
                        </Box>
                    )}
                </Grid>
                <Grid item xs={12} mt={2}>
                    <Grid sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Grid item xs={2}>
                            <Grid>
                                <Grid container direction="column" spacing={2}>
                                    <Grid item>
                                        <MUIButton variant="contained" startIcon={<CgAddR />} onClick={() => addProduct('12')}>
                                            Cascão
                                        </MUIButton>
                                    </Grid>
                                    <Grid item>
                                        <MUIButton variant="contained" startIcon={<CgAddR />} onClick={() => addProduct('13')}>
                                            Casquinha
                                        </MUIButton>
                                    </Grid>
                                    <Grid item>
                                        <MUIButton sx={{ minWidth: '11rem', justifyContent: 'flex-start' }} variant="contained" startIcon={<CgAddR />} onClick={() => addProduct('14', qntBolas, true)}>
                                            Taça Sundae
                                        </MUIButton>
                                        <Input
                                            name=""
                                            key={`bolasSundae${key}`}
                                            error={isValidQntBolas ? 'Campo Obrigatório' : ''}
                                            label="Qnt. bolas sundae?"
                                            onChange={handleChangeTacaSundae}
                                            value={qntBolas}
                                        />
                                    </Grid>
                                </Grid>
                                <Input
                                    key={`valorRecebido${key}`}
                                    label="Valor Pago"
                                    error={touched.vlRecebido && errors.vlRecebido ? errors.vlRecebido : ''}
                                    name="vlRecebido"
                                    onBlur={handleBlur}
                                    inputRef={inputRefF4}
                                    value={values.vlRecebido !== 0 ? values.vlRecebido : ''}
                                    maxLength={9}
                                    onKeyPress={e => onKeyPressHandleSubmit(e, handleSubmit)}
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