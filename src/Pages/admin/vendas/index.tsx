import * as Yup from 'yup';
import { format } from "date-fns";
import { useFormik } from 'formik';
import { db } from "../../../firebase";
import VendaModel, { ProdutoEscaniado } from "./model/vendas";
import { CgAddR } from 'react-icons/cg';
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import GetData from "../../../firebase/getData";
import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import ProdutosModel from "../cadastroProdutos/model/produtos";
import FormAlert from "../../../Components/FormAlert/formAlert";
import SituacaoProduto from "../../../enumeration/situacaoProduto";
import iceCreamSad from '../../../assets/Image/drawingSadIceCream.png'
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
} from './style'
import useFormatCurrency from '../../../hooks/formatCurrency';
import useEstoque from '../../../hooks/useEstoque';


const objClean: VendaModel = {
    vlTotal: 0,
    dtProduto: '',
    vlRecebido: 0,
    vlTroco: 0,
    produtoEscaniado: []
}
function Vendas() {
    const [key, setKey] = useState<number>(0);
    const [barcode, setBarcode] = useState("");
    const [qntBolas, setQntBolas] = useState<string>('');
    const [ShowSuggestion, setShowSuggestion] = useState(false);
    const [isValidQntBolas, setIsValidQntBolas] = useState<boolean>(false);
    const [produtoNotFound, setProdutoNotFound] = useState<boolean>(false);
    const [multiplica, setMultiplica] = useState<number | undefined>(undefined);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [productSuggestion, setProductSuggestion] = useState<ProdutosModel[]>([]);

    const { NumberFormatForBrazilianCurrency, convertToNumber, formatCurrencyRealTime } = useFormatCurrency();
    const { removedStockVenda } = useEstoque();

    //realizando busca no banco de dados
    const {
        dataTable: dataTableProduto,
    } = GetData('Produtos', true) as { dataTable: ProdutosModel[] };

    const initialValues: VendaModel = ({ ...objClean });

    const { values, handleSubmit, setFieldValue, touched, errors } = useFormik<VendaModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            vlRecebido: Yup.string().required("Campo Obrigatório").test('vlRecebido', 'Campo Obrigatório', (value) => {
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

    function adicionarProdutoAoArray(values: any, novoProduto: ProdutoEscaniado) {
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { mpFabricado, ...rest } = produtoEncontrado;
            const { valorTotal, formatTotalLucro } = calcularTotais(vlVendaProduto, multiplica, produtoEncontrado.vlUnitario);
            const novoProduto: ProdutoEscaniado = { ...rest, vlTotalMult: valorTotal, quantidadeVenda: multiplica, vlLucro: formatTotalLucro };
            adicionarProdutoAoArray(values, novoProduto);
            setBarcode('')
            setMultiplica(undefined)
            setKey(Math.random())
        } else if (isBarcodeNumeric) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { mpFabricado, ...rest } = produtoEncontrado;
            const { formatTotalLucro } = calcularTotais(vlVendaProduto, 1, produtoEncontrado.vlUnitario);
            const novoProduto: ProdutoEscaniado = { ...rest, quantidadeVenda: 1, vlLucro: formatTotalLucro, vlTotalMult: vlVendaProduto };
            adicionarProdutoAoArray(values, novoProduto);
            setBarcode('');
        }
    }, [barcode]);


    //buscando por nome do produto no banco e multiplicando valor caso necessario
    const handleMultiplicaKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const codigoDeBarras = e.currentTarget.value;
        const isLetra = /^(?=\p{L})[\p{L}\d\s]+$/u.test(codigoDeBarras);

        if (e.key === 'Enter' && isLetra) {
            const produtoEncontrado = dataTableProduto.find((p) => p.nmProduto.toLowerCase() === barcode.toLowerCase());
            if (multiplica) {
                if (produtoEncontrado) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            // Certifique-se de que produto seja um número válido antes de adicionar ao total
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
        removedStockVenda(values.produtoEscaniado)
        const valuesUpdate: VendaModel = {
            ...values,
            vlRecebido: convertToNumber(values.vlRecebido.toString())
        };
        await addDoc(collection(db, "Vendas"), {
            ...valuesUpdate
        }).then(() => {
            setSubmitForm(true);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        }).catch(() => {
            setSubmitForm(false);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        });
        clearState();
    }

    //adicionando cascão a lista de compras 
    function cascao() {
        const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === '9788545200345');
        if (produtoEncontrado) {

            const valorPago = produtoEncontrado.vlUnitario
            const totalLucro = produtoEncontrado.vlVendaProduto - valorPago;

            const novoProduto: ProdutoEscaniado = { ...produtoEncontrado, quantidadeVenda: 1, vlLucro: totalLucro, vlTotalMult: produtoEncontrado.vlVendaProduto }
            setFieldValue('produtoEscaniado', values.produtoEscaniado.push(novoProduto));
        }
    }

    //adicionando casquinha a lista de compras
    function casquinha() {
        const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === '9788534508476');
        if (produtoEncontrado) {
            const valorPago = produtoEncontrado.vlUnitario
            const totalLucro = produtoEncontrado.vlVendaProduto - valorPago;

            const novoProduto: ProdutoEscaniado = { ...produtoEncontrado, quantidadeVenda: 1, vlLucro: totalLucro, vlTotalMult: produtoEncontrado.vlVendaProduto }
            setFieldValue('produtoEscaniado', values.produtoEscaniado.push(novoProduto));
        }
    }

    //adicionando taça sundae a lista de compras
    function tacaSundae() {
        if (qntBolas !== '') {
            const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === '9788544001554');

            if (produtoEncontrado) {
                const valorTotal = Number(qntBolas) * produtoEncontrado?.vlVendaProduto;
                const novoProduto = { ...produtoEncontrado, vlVendaProduto: valorTotal, quantidadeVenda: Number(qntBolas) };
                setFieldValue('produtoEscaniado', values.produtoEscaniado.push(novoProduto));
            }

            setQntBolas('');
            setIsValidQntBolas(false)
            setKey(Math.random())
        } else {
            setIsValidQntBolas(true)
        }
    }

    function onKeyPressHandleSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') return handleSubmit;
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
                            styleDiv={{ marginTop: 4, }}
                            styleLabel={{ fontSize: 16, }}
                            onChange={e => setMultiplica(parseFloat(e.target.value))}
                            error={''}
                            onKeyPress={handleMultiplicaKeyPress}
                        />
                    </DivMultiplicar>

                    <Input
                        error={produtoNotFound ? 'Nome não encontrado, verifique o nome e tente novamente' : ''}
                        label="Código do Produto:"
                        name=""
                        onChange={handleInputChange}
                        value={barcode}
                        onKeyPress={handleMultiplicaKeyPress}
                    />
                    {ShowSuggestion && (
                        <DivSuggestions>
                            <Suggestions>
                                {productSuggestion.map((produto) => (
                                    <SuggestionsLi key={produto.id} onClick={() => selectSuggestion(produto)}>
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
                                        onClick={cascao}
                                    />
                                </DivAdicionais>
                                <DivAdicionais>
                                    <TextAdicional>Casquinha</TextAdicional>
                                    <StyleButton
                                        type="button"
                                        startIcon={<CgAddR />}
                                        onClick={casquinha}
                                    />
                                </DivAdicionais>
                                <DivAdicionais>
                                    <div>
                                        <div style={{ display: "flex" }}>
                                            <TextAdicional>Taça Sundae</TextAdicional>
                                            <StyleButton
                                                type="button"
                                                startIcon={<CgAddR />}
                                                onClick={tacaSundae}
                                            />
                                        </div>
                                        <Input
                                            key={`bolasSundae${key}`}
                                            error={isValidQntBolas ? 'Campo Obrigatório' : ''}
                                            label="Qnt. bolas sundae?"
                                            name=""
                                            onChange={e => setQntBolas(e.target.value)}
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
                                value={values.vlRecebido !== 0 ? values.vlRecebido : ''}
                                maxLength={9}
                                onKeyPress={e => onKeyPressHandleSubmit(e)}
                                onChange={e => { setFieldValue('vlRecebido', formatCurrencyRealTime(e.target.value)) }}
                            />
                            <ResultadoTotal>Total: {values.vlTotal ? NumberFormatForBrazilianCurrency(values.vlTotal) : ''}</ResultadoTotal>
                            <ResultadoTotal>Troco: {values.vlTroco ? NumberFormatForBrazilianCurrency(values.vlTroco) : ''}</ResultadoTotal>
                        </div>
                        <div>
                            <Button
                                label='Finalizar venda'
                                disabled={values.produtoEscaniado.length === 0 ? true : false}
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
                                            <TitlePreco>{produto.nmProduto}</TitlePreco>
                                            <TitlePreco>{produto.vlTotalMult ? NumberFormatForBrazilianCurrency(produto.vlTotalMult) : ''}</TitlePreco>
                                        </ContainerPreco>
                                    ))}
                                </>
                            )}
                        </ContainerNota>
                    </ContainerProdutos>
                </BoxProduto>
                <FormAlert submitForm={submitForm} name={'Venda'} />
            </ContainerAll>
        </Box>
    );
}

export default Vendas;