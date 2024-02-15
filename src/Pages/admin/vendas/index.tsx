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
import { addDoc, collection } from "firebase/firestore";
import VendaModel, { ProdutoEscaniado } from "./model/vendas";
import ProdutosModel from "../cadastroProdutos/model/produtos";
import FormAlert from "../../../Components/FormAlert/formAlert";
import { State, setLoading } from '../../../store/reducer/reducer';
import SituacaoProduto from "../../../enumeration/situacaoProduto";
import iceCreamSad from '../../../assets/Image/drawingSadIceCream.png';
import {
    Box,
    Title,
    DivTitle,
    DivEmpty,
    DateStyle,
    TextEmpty,
    TitleNota,
    TitlePreco,
    BoxProduto,
    StyleButton,
    TitleProduto,
    ContainerAll,
    DivAdicionais,
    TextAdicional,
    ContainerNota,
    ContainerInput,
    ResultadoTotal,
    ContainerPreco,
    DivMultiplicar,
    BoxButtonInput,
    ContainerProdutos,
    ContainerDescricao,
    DivSuggestions,
    Suggestions,
    SuggestionsLi,
    DivIcon,
} from './style'

//hooks
import useEstoque from '../../../hooks/useEstoque';
import useFormatCurrency from '../../../hooks/formatCurrency';
import useHandleInputKeyPress from '../../../hooks/useHandleInputKeyPress';


const objClean: VendaModel = {
    vlTotal: 0,
    dtProduto: '',
    vlRecebido: 0,
    vlTroco: 0,
    produtoEscaniado: [],
    vlLucroTotal: 0
}
function Vendas() {
    const [key, setKey] = useState<number>(0);
    const [barcode, setBarcode] = useState("");
    const [qntBolas, setQntBolas] = useState<number | undefined>(undefined);
    const [ShowSuggestion, setShowSuggestion] = useState(false);
    const [isValidQntBolas, setIsValidQntBolas] = useState<boolean>(false);
    const [produtoNotFound, setProdutoNotFound] = useState<boolean>(false);
    const [multiplica, setMultiplica] = useState<number | undefined>(undefined);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [productSuggestion, setProductSuggestion] = useState<ProdutosModel[]>([]);
    const dispatch = useDispatch();
    const { loading } = useSelector((state: State) => state.user);

    const { NumberFormatForBrazilianCurrency, convertToNumber, formatCurrencyRealTime } = useFormatCurrency();
    const { handleInputKeyDown, suggestionsRef, selectedSuggestionIndex, onKeyPressHandleSubmit, inputRef } = useHandleInputKeyPress();
    const { removedStockVenda } = useEstoque();

    //realizando busca no banco de dados
    const {
        dataTable: dataTableProduto,
    } = GetData('Produtos', true) as { dataTable: ProdutosModel[] };

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

    //intervalo para que mostre as horas em tempo real
    useEffect(() => {
        const data = new Date();
        const dataFormatada = format(data, 'dd/MM/yyyy HH:mm');
        setFieldValue('dtProduto', dataFormatada);
    }, [values.vlRecebido]);

    function calcularTotais(vlVendaProduto: number, quantidade: number, vlUnitario: number) {
        const valorTotal = quantidade * vlVendaProduto;
        const total = vlVendaProduto - vlUnitario;
        const totalLucro = total * quantidade;
        const formatTotalLucro = parseFloat(totalLucro.toFixed(2))

        return { valorTotal, formatTotalLucro };
    }

    function adicionarProdutoAoArray(values: VendaModel, novoProduto: ProdutoEscaniado) {
        const novoArrayProdutos = [...values.produtoEscaniado, novoProduto];
        setFieldValue('produtoEscaniado', novoArrayProdutos);
    }
    //lendo codigo de barras em tempo real, fazendo busca no banco e multiplicando valor caso necessario
    useEffect(() => {
        const isBarcodeNumeric = !isNaN(Number(barcode));
        const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === barcode);
        if (!produtoEncontrado) return;

        const vlVendaProduto = produtoEncontrado.vlVendaProduto

        if (multiplica && isBarcodeNumeric) {
            const { mpFabricado, ...rest } = produtoEncontrado;
            const { valorTotal, formatTotalLucro } = calcularTotais(vlVendaProduto, multiplica, produtoEncontrado.vlUnitario);
            const novoProduto: ProdutoEscaniado = { ...rest, vlTotalMult: valorTotal, quantidadeVenda: multiplica, vlLucro: formatTotalLucro };
            adicionarProdutoAoArray(values, novoProduto);
            setBarcode('')
            setMultiplica(undefined)
            setKey(Math.random())
        } else if (isBarcodeNumeric) {
            const { mpFabricado, ...rest } = produtoEncontrado;
            const { formatTotalLucro } = calcularTotais(vlVendaProduto, 1, produtoEncontrado.vlUnitario);
            const novoProduto: ProdutoEscaniado = { ...rest, quantidadeVenda: 1, vlLucro: formatTotalLucro, vlTotalMult: vlVendaProduto };
            adicionarProdutoAoArray(values, novoProduto);
            setBarcode('');
        }
    }, [barcode]);


    //buscando por nome do produto no banco e multiplicando valor caso necessario
    const handleMultiplicaKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const produtoEncontrado = dataTableProduto.find((p) => p.nmProduto.toLowerCase() === barcode.toLowerCase());
            if (multiplica) {
                if (produtoEncontrado) {
                    const { mpFabricado, ...rest } = produtoEncontrado;
                    const { valorTotal, formatTotalLucro } = calcularTotais(produtoEncontrado.vlVendaProduto, multiplica, produtoEncontrado.vlUnitario);
                    const novoProduto: ProdutoEscaniado = { ...rest, vlTotalMult: valorTotal, quantidadeVenda: multiplica, vlLucro: formatTotalLucro };
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
                    const novoProduto: ProdutoEscaniado = { ...rest, quantidadeVenda: 1, vlLucro: formatTotalLucro, vlTotalMult: produtoEncontrado.vlVendaProduto };
                    adicionarProdutoAoArray(values, novoProduto);

                    setBarcode('');
                    setProdutoNotFound(false)
                } else {
                    setProdutoNotFound(true)
                }
            }
        }
    };

    //function clear state
    function clearState() {
        setFieldValue('vlTotal', null),
            setFieldValue('dtProduto', ''),
            setFieldValue('vlRecebido', ''),
            setFieldValue('vlTroco', null),
            setFieldValue('produtoEscaniado', []),
            setFieldValue('tpProduto', SituacaoProduto.FABRICADO),
            setKey(Math.random()),
            setIsValidQntBolas(false)
    }

    //busca o valor de todos os produtos adicionados e soma todos eles
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

    //faz o calculo do troco
    useEffect(() => {
        const vlRecebido = convertToNumber(values.vlRecebido.toString())
        const troco = vlRecebido - values.vlTotal
        setFieldValue('vlTroco', troco)
    }, [values.vlRecebido, values.vlTroco])


    //envia os valor pro banco
    async function handleSubmitForm() {
        dispatch(setLoading(true))
        removedStockVenda(values.produtoEscaniado)
        const valuesUpdate: VendaModel = {
            ...values,
            vlRecebido: convertToNumber(values.vlRecebido.toString())
        };
        await addDoc(collection(db, "Vendas"), {
            ...valuesUpdate
        }).then(() => {
            dispatch(setLoading(false))
            setSubmitForm(true);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        }).catch(() => {
            dispatch(setLoading(false))
            setSubmitForm(false);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        });
        clearState();
        resetForm()
    }
    function addProduct(cdProduto: string, quantidade: number | undefined, isTaca: boolean) {
        const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === cdProduto);
        if (produtoEncontrado) {
            let novoProduto: ProdutoEscaniado;
            if (!isTaca) {
                const valorPago = produtoEncontrado.vlUnitario;
                const totalLucro = produtoEncontrado.vlVendaProduto - valorPago;
                novoProduto = { ...produtoEncontrado, quantidadeVenda: 1, vlLucro: totalLucro, vlTotalMult: produtoEncontrado.vlVendaProduto };
                adicionarProdutoAoArray(values, novoProduto)
            } else {
                if (quantidade) {
                    const valorTotal = quantidade * produtoEncontrado?.vlVendaProduto;
                    novoProduto = { ...produtoEncontrado, vlVendaProduto: valorTotal, quantidadeVenda: quantidade, vlTotalMult: valorTotal };
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const codigoDeBarras = e.currentTarget.value;
        setBarcode(codigoDeBarras);

        // Realize a busca no banco de dados
        const resultados = dataTableProduto.filter(
            cod => cod.nmProduto.toLowerCase().includes(codigoDeBarras.toLowerCase())
        );

        if (resultados.length > 0) {
            setShowSuggestion(true);
            setProductSuggestion(resultados);
        } else {
            setShowSuggestion(false);
            setProductSuggestion([]);
        }
    };
    const selectSuggestion = (produto: ProdutosModel) => {
        setBarcode(produto.nmProduto);
        setProductSuggestion([]);
        setShowSuggestion(false);
    };
    function handleChangeTacaSundae(e: React.ChangeEvent<HTMLInputElement>) {
        const inputValue = parseFloat(e.target.value);
        if (!isNaN(inputValue) && inputValue !== 0) {
            setQntBolas(inputValue);
        } else {
            setQntBolas(undefined);
            setKey(Math.random())
        }
    }
    function removedProdutoEscaneado(index: number) {
        const remove = values.produtoEscaniado.filter((product, i) => i !== index)
        setFieldValue('produtoEscaniado', remove);
    }
    return (
        <Box>
            <Title>Painel de Vendas</Title>
            <ContainerAll>
                <ContainerInput>
                    <DivMultiplicar>
                        <Input
                            key={`multiplica${key}`}
                            label="multiplicar ?"
                            name="quantidadeVenda"
                            value={multiplica}
                            style={{ fontSize: 14 }}
                            styleDiv={{ marginTop: 4 }}
                            styleLabel={{ fontSize: 16 }}
                            onChange={(e) => setMultiplica(isNaN(parseFloat(e.target.value)) ? undefined : parseFloat(e.target.value))}
                            error={''}
                            inputRef={inputRef}
                            onKeyPress={handleMultiplicaKeyPress}
                        />
                    </DivMultiplicar>

                    <Input
                        error={produtoNotFound ? 'Nome não encontrado, verifique o nome e tente novamente' : ''}
                        label="Código do Produto:"
                        name=""
                        onChange={handleInputChange}
                        value={barcode}
                        onKeyDown={(e) => handleInputKeyDown(e, productSuggestion, selectSuggestion)}
                        onKeyPress={handleMultiplicaKeyPress}
                    />
                    {ShowSuggestion && (
                        <DivSuggestions>
                            <Suggestions ref={suggestionsRef}>
                                {productSuggestion.map((produto, index) => (
                                    <SuggestionsLi
                                        isSelected={index === selectedSuggestionIndex}
                                        key={produto.id}
                                        onClick={() => selectSuggestion(produto)}
                                    >
                                        {produto.nmProduto}
                                    </SuggestionsLi>
                                ))}
                            </Suggestions>
                        </DivSuggestions>
                    )}
                </ContainerInput>
                <BoxProduto>
                    <BoxButtonInput>
                        <div>
                            <div>
                                <DivAdicionais>
                                    <TextAdicional>Cascão</TextAdicional>
                                    <StyleButton
                                        type="button"
                                        startIcon={<CgAddR />}
                                        onClick={() => addProduct('12', undefined, false)}
                                    />
                                </DivAdicionais>
                                <DivAdicionais>
                                    <TextAdicional>Casquinha</TextAdicional>
                                    <StyleButton
                                        type="button"
                                        startIcon={<CgAddR />}
                                        onClick={() => addProduct('13', undefined, false)}
                                    />
                                </DivAdicionais>
                                <DivAdicionais>
                                    <div>
                                        <div style={{ display: "flex" }}>
                                            <TextAdicional>Taça Sundae</TextAdicional>
                                            <StyleButton
                                                type="button"
                                                startIcon={<CgAddR />}
                                                onClick={() => addProduct('14', qntBolas, true)}
                                            />
                                        </div>
                                        <Input
                                            key={`bolasSundae${key}`}
                                            error={isValidQntBolas ? 'Campo Obrigatório' : ''}
                                            label="Qnt. bolas sundae?"
                                            name=""
                                            onChange={handleChangeTacaSundae}
                                            value={qntBolas}
                                            style={{ fontSize: 14, }}
                                            styleDiv={{ marginTop: 4, paddingTop: 5 }}
                                            styleLabel={{ fontSize: 16, marginTop: '-10px', }}
                                        />
                                    </div>

                                </DivAdicionais>
                            </div>
                            <Input
                                key={`valorRecebido${key}`}
                                label="Valor Pago"
                                error={touched.vlRecebido && errors.vlRecebido ? errors.vlRecebido : ''}
                                name="vlRecebido"
                                onBlur={handleBlur}
                                value={values.vlRecebido !== 0 ? values.vlRecebido : ''}
                                maxLength={9}
                                onKeyPress={e => onKeyPressHandleSubmit(e, handleSubmit)}
                                onChange={e => { setFieldValue('vlRecebido', formatCurrencyRealTime(e.target.value)) }}
                            />
                            <ResultadoTotal>Total: {values.vlTotal ? NumberFormatForBrazilianCurrency(values.vlTotal) : ''}</ResultadoTotal>
                            <ResultadoTotal>Troco: {values.vlTroco ? NumberFormatForBrazilianCurrency(values.vlTroco) : ''}</ResultadoTotal>
                        </div>
                        <div>
                            <Button
                                label='Finalizar venda'
                                disabled={values.produtoEscaniado.length === 0 || loading}
                                type="button"
                                onClick={handleSubmit}
                                style={{ height: 80, width: 200 }}
                            />
                        </div>
                    </BoxButtonInput>
                    <ContainerProdutos>

                        <DivTitle>
                            <TitleProduto>Produtos</TitleProduto>
                        </DivTitle>
                        <ContainerNota>
                            <DateStyle>{`Data: ${values.dtProduto}`}</DateStyle>
                            {values.produtoEscaniado.length === 0 ? (
                                <DivEmpty>
                                    <img src={iceCreamSad} alt="" width={250} />
                                    <TextEmpty>Nenhum Sorvetinho incluido</TextEmpty>
                                </DivEmpty>
                            ) : (
                                <>
                                    <ContainerDescricao>
                                        <TitleNota>Descrição do Produto</TitleNota>
                                        <TitleNota>Valor do Produto</TitleNota>
                                    </ContainerDescricao>
                                    {values.produtoEscaniado.map((produto, index) => (
                                        <ContainerPreco key={index}>
                                            <TitlePreco>
                                                <DivIcon onClick={() => removedProdutoEscaneado(index)}>
                                                    <IoMdClose />
                                                </DivIcon>
                                                <div>
                                                    <p>{produto.nmProduto}</p>
                                                </div>
                                            </TitlePreco>
                                            <TitlePreco>{produto.vlTotalMult ? NumberFormatForBrazilianCurrency(produto.vlTotalMult) : ''}</TitlePreco>
                                        </ContainerPreco>
                                    ))}
                                </>
                            )}
                        </ContainerNota>
                    </ContainerProdutos>
                </BoxProduto>
                <FormAlert submitForm={submitForm} name={'Venda'} styleLoadingMarginTop='-5rem' styleLoadingMarginLeft='-25rem' />
            </ContainerAll>
        </Box>
    );
}

export default Vendas;