import * as Yup from 'yup';
import { format } from "date-fns";
import { useFormik } from 'formik';
import { db } from "../../../firebase";
import VendaModel from "./model/vendas";
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
} from './style'


const objClean: VendaModel = {
    vlTotal: null,
    dtProduto: '',
    vlRecebido: '',
    vlTroco: null,
    produtoEscaniado: []
}
export default function Vendas() {
    const [barcode, setBarcode] = useState("");
    const [qntBolas, setQntBolas] = useState<string>('');
    const [key, setKey] = useState<number>(0);
    const [multiplica, setMultiplica] = useState<number | undefined>(undefined);
    const [recarregue, setRecarregue] = useState<boolean>(true);


    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);

    const [isValid, setIsValid] = useState<boolean>(false);
    const [isValidQntBolas, setIsValidQntBolas] = useState<boolean>(false);
    const [produtoNotFound, setProdutoNotFound] = useState<boolean>(false);

    //realizando busca no banco de dados
    const {
        dataTable: dataTableProduto,
    } = GetData('Produtos', recarregue) as { dataTable: ProdutosModel[] };

    const initialValues: VendaModel = ({ ...objClean });

    const { values, handleSubmit, setFieldValue } = useFormik<VendaModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
        }),
        onSubmit: handleSubmitForm,
    });

    //intervalo para que mostre as horas em tempo real
    useEffect(() => {
        const intervalId = setInterval(() => {
            const data = new Date();
            const dataFormatada = format(data, 'dd/MM/yyyy HH:mm');
            setFieldValue('dtProduto', dataFormatada);
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    //lendo codigo de barras em tempo real, fazendo busca no banco e multiplicando valor caso necessario
    useEffect(() => {
        const isBarcodeNumeric = !isNaN(Number(barcode));
        if (multiplica && isBarcodeNumeric) {
            const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === barcode);
            if (produtoEncontrado) {
                //calculando total da venda
                const valorFormat = produtoEncontrado.vlVendaProduto.match(/\d+/g)?.join('.');
                const valorTotal = multiplica * Number(valorFormat);

                //calculando total de lucro
                const valorVenda = Number(produtoEncontrado.vlVendaProduto.match(/\d+/g)?.join('.'));
                const valorPago = Number(produtoEncontrado.vlPagoProduto.match(/\d+/g)?.join('.'));
                const total = valorVenda - valorPago;
                const totalLucro = total * multiplica

                const novoProduto = { ...produtoEncontrado, vlTotalMult: `R$ ${valorTotal},00`, quantidadeVenda: multiplica, vlLucro: totalLucro.toString() };
                setFieldValue('produtoEscaniado', values.produtoEscaniado.concat(novoProduto));
            }
            setBarcode('')
            setMultiplica(undefined)
            setKey(Math.random())
        } else if (isBarcodeNumeric) {
            const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === barcode);
            if (produtoEncontrado) {
                //calculando total de lucro
                const valorVenda = Number(produtoEncontrado.vlVendaProduto.match(/\d+/g)?.join('.'));
                const valorPago = Number(produtoEncontrado.vlPagoProduto.match(/\d+/g)?.join('.'));
                const totalLucro = valorVenda - valorPago;

                const novoProduto = { ...produtoEncontrado, quantidadeVenda: 1, vlLucro: totalLucro.toString(), vlTotalMult: `R$ ${valorVenda},00` }
                setFieldValue('produtoEscaniado', values.produtoEscaniado.concat(novoProduto));
                setBarcode('')
            }
        }
    }, [barcode]);


    //buscando por nome do produto no banco e multiplicando valor caso necessario
    const handleMultiplicaKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const codigoDeBarras = e.currentTarget.value;
        let isLetra = /^(?=\p{L})[\p{L}\d\s]+$/u.test(codigoDeBarras);

        if (e.key === 'Enter' && isLetra) {
            if (multiplica) {
                const produtoEncontrado = dataTableProduto.find((p) => p.nmProduto.toLowerCase() === barcode.toLowerCase());
                if (produtoEncontrado) {

                    //calculando total da venda
                    const valorFormat = produtoEncontrado.vlVendaProduto.match(/\d+/g)?.join('.');
                    const valorTotal = multiplica * Number(valorFormat);

                    //calculando total de lucro
                    const valorVenda = Number(produtoEncontrado.vlVendaProduto.match(/\d+/g)?.join('.'));
                    const valorPago = Number(produtoEncontrado.vlPagoProduto.match(/\d+/g)?.join('.'));
                    const total = valorVenda - valorPago;
                    const totalLucro = total * multiplica

                    const novoProduto = { ...produtoEncontrado, vlTotalMult: `R$ ${valorTotal},00`, quantidadeVenda: multiplica, vlLucro: totalLucro.toString() };
                    setFieldValue('produtoEscaniado', values.produtoEscaniado.concat(novoProduto));
                    setBarcode('');
                    setMultiplica(undefined);
                    setKey(Math.random())
                    setProdutoNotFound(false)
                } else {
                    setProdutoNotFound(true)
                }
            } else {
                const produtoEncontrado = dataTableProduto.find((p) => p.nmProduto.toLowerCase() === barcode.toLowerCase());
                if (produtoEncontrado) {
                    //calculando total de lucro
                    const valorVenda = Number(produtoEncontrado.vlVendaProduto.match(/\d+/g)?.join('.'));
                    const valorPago = Number(produtoEncontrado.vlPagoProduto.match(/\d+/g)?.join('.'));
                    const totalLucro = valorVenda - valorPago;

                    const novoProduto = { ...produtoEncontrado, quantidadeVenda: 1, vlLucro: totalLucro.toString(), vlTotalMult: `R$ ${valorVenda},00` }
                    setFieldValue('produtoEscaniado', values.produtoEscaniado.concat(novoProduto));
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
            setIsValid(false),
            setKey(Math.random()),
            setIsValidQntBolas(false)
    }

    //busca o valor de todos os produtos adicionados e soma todos eles
    useEffect(() => {
        //calculando todos os valores de total de venda
        const precoFiltrado = values.produtoEscaniado.map(scanner => Number(scanner.vlTotalMult?.match(/\d+/g)?.join(".")))
            .filter(valor => !isNaN(valor));
        const precoTotal = precoFiltrado.reduce((total, produto) => {
            return total + produto;
        }, 0);

        //calculando todos os valores de total de lucro
        const precoFiltradoLucro = values.produtoEscaniado.map(scanner => Number(scanner.vlLucro?.match(/\d+/g)?.join(".")))
            .filter(valor => !isNaN(valor));
        const precoTotalLucro = precoFiltradoLucro.reduce((total, produto) => {
            return total + produto;
        }, 0);

        setFieldValue('vlTotal', precoTotal);
        setFieldValue('vlLucroTotal', precoTotalLucro);
    }, [values.produtoEscaniado]);

    //faz o calculo do troco
    useEffect(() => {
        const valorFormat = values.vlRecebido.match(/\d+/g)?.join('.')
        const troco = Number(valorFormat) - Number(values.vlTotal)
        setFieldValue('vlTroco', troco)
    }, [values.vlRecebido])

    //envia os valor pro banco
    async function handleSubmitForm() {

        if (values.vlRecebido !== '') {
            await addDoc(collection(db, "Vendas"), {
                ...values
            }).then(() => {
                setSubmitForm(true);
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            }).catch(() => {
                setSubmitForm(false);
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            });
            clearState();
        } else {
            setIsValid(true);
        }
    }

    //adicionando cascão a lista de compras 
    function cascao() {
        const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === '9788545200345');
        if (produtoEncontrado) {

            const valorVenda = Number(produtoEncontrado.vlVendaProduto.match(/\d+/g)?.join('.'));
            const valorPago = Number(produtoEncontrado.vlPagoProduto.match(/\d+/g)?.join('.'));
            const totalLucro = valorVenda - valorPago;

            const novoProduto = { ...produtoEncontrado, quantidadeVenda: 1, vlLucro: totalLucro.toString(), vlTotalMult: `R$ ${valorVenda},00` }
            setFieldValue('produtoEscaniado', values.produtoEscaniado.concat(novoProduto));
        }
    }

    //adicionando casquinha a lista de compras
    function casquinha() {
        const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === '9788534508476');
        if (produtoEncontrado) {
            const valorVenda = Number(produtoEncontrado.vlVendaProduto.match(/\d+/g)?.join('.'));
            const valorPago = Number(produtoEncontrado.vlPagoProduto.match(/\d+/g)?.join('.'));
            const totalLucro = valorVenda - valorPago;

            const novoProduto = { ...produtoEncontrado, quantidadeVenda: 1, vlLucro: totalLucro.toString(), vlTotalMult: `R$ ${valorVenda},00` }
            setFieldValue('produtoEscaniado', values.produtoEscaniado.concat(novoProduto));
        }
    }

    //adicionando taça sundae a lista de compras
    function tacaSundae() {
        if (qntBolas !== '') {
            const produtoEncontrado = dataTableProduto.find((p) => p.cdProduto === '9788544001554');
            const valor = produtoEncontrado?.vlVendaProduto;
            const valorFormat = valor?.match(/\d+/g)?.join('.');
            const valorTotal = Number(qntBolas) * Number(valorFormat);

            if (produtoEncontrado) {
                const novoProduto = { ...produtoEncontrado, vlVendaProduto: `R$ ${valorTotal},00`, quantidadeVenda: Number(qntBolas) };
                setFieldValue('produtoEscaniado', values.produtoEscaniado.concat(novoProduto));
            }

            setQntBolas('');
            setIsValidQntBolas(false)
            setKey(Math.random())
        } else {
            setIsValidQntBolas(true)
        }
    }

    //função que formata o valor do input 
    function formatarValor(valor: string) {
        const inputText = valor.replace(/\D/g, "");
        let formattedText = "";
        if (inputText.length <= 2) {
            formattedText = inputText;
        } else {
            const regex = /^(\d*)(\d{2})$/;
            formattedText = inputText.replace(regex, '$1,$2');
        }
        return inputText ? "R$ " + formattedText : "";
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
                        onChange={e => setBarcode(e.currentTarget.value)}
                        value={barcode}
                        onKeyPress={handleMultiplicaKeyPress}
                    />
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
                                            <TextAdicional >Taça Sundae</TextAdicional>
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
                                error={isValid ? 'Campo Obrigatório' : ''}
                                name="valorRecebido"
                                value={values.vlRecebido}
                                maxLength={9}
                                onChange={e => setFieldValue('vlRecebido', formatarValor(e.target.value))}
                            />
                            <ResultadoTotal>Total: {values.vlTotal ? `R$ ${values.vlTotal.toFixed(2).replace(".", ",")}` : ''}</ResultadoTotal>
                            <ResultadoTotal>Troco: {values.vlTroco ? `R$ ${values.vlTroco.toFixed(2).replace(".", ",")}` : ''}</ResultadoTotal>
                        </div>
                        <div>
                            <Button
                                children='Finalizar venda'
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
                                    {values.produtoEscaniado.map(produto => (
                                        <ContainerPreco key={produto.cdProduto}>
                                            <TitlePreco>{produto.nmProduto}</TitlePreco>
                                            <TitlePreco>{produto.vlTotalMult}</TitlePreco>
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