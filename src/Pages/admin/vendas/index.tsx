import { addDoc, collection, CollectionReference, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import VendaModel from "./model/vendas";
import {
    Box,
    ContainerAll,
    ContainerInput,
    ContainerProdutos,
    ResultadoTotal,
    DateStyle,
    ContainerNota,
    ContainerDescricao,
    TitleNota,
    ContainerPreco,
    TitlePreco,
    BoxProduto,
    DivTitle,
    TitleProduto,
    BoxButtonInput,
    DivEmpty,
    TextEmpty,
    StyleButton,
    DivAdicionais,
    TextAdicional,
    DivMultiplicar,
    Title
} from './style'
import Button from "../../../Components/button";
import { Alert, AlertTitle } from "@mui/material";
import { ContainerAlert } from "../cadastroClientes/style";
import iceCreamSad from '../../../assets/Image/drawingSadIceCream.png'
import { CgAddR } from 'react-icons/cg'
import * as Yup from 'yup';
import { useFormik } from 'formik';
import ProdutosModel from "../cadastroProdutos/model/produtos";
import { format } from "date-fns";
import SituacaoProduto from "../compras/enumeration/situacaoProduto";


const objClean: VendaModel = {
    vlTotal: null,
    dtProduto: '',
    vlRecebido: '',
    vlTroco: null,
    produtoEscaniado: []
}
export default function Vendas() {
    const [barcode, setBarcode] = useState("");
    const [produto, setProduto] = useState<ProdutosModel[]>([]);
    const [qntBolas, setQntBolas] = useState<string>('');
    const [key, setKey] = useState<number>(0);
    const [multiplica, setMultiplica] = useState<string>('');


    const [fail, setFail] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const [isValid, setIsValid] = useState<boolean>(false);
    const [isValidQntBolas, setIsValidQntBolas] = useState<boolean>(false);
    const [produtoNotFound, setProdutoNotFound] = useState<boolean>(false);

    const _collection = collection(db, 'Produtos') as CollectionReference<ProdutosModel>;

    const [initialValues, setInitialValues] = useState<VendaModel>({ ...objClean });

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<VendaModel>({
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

    //buscando os dados no banco 
    useEffect(() => {
        const getRelatorio = async () => {
            const data = await getDocs<ProdutosModel>(_collection);
            setProduto(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        };
        getRelatorio();
    }, []);

    //lendo codigo de barras em tempo real, fazendo busca no banco e multiplicando valor caso necessario
    useEffect(() => {
        const isBarcodeNumeric = !isNaN(Number(barcode));
        if (multiplica !== '' && isBarcodeNumeric) {
            const produtoEncontrado = produto.find((p) => p.cdProduto === barcode);
            const valor = produtoEncontrado?.vlVendaProduto;
            const valorFormat = valor?.match(/\d+/g)?.join('.');
            const valorTotal = Number(multiplica) * Number(valorFormat);
            if (produtoEncontrado) {
                const novoProduto = { ...produtoEncontrado, vlVendaProduto: `R$ ${valorTotal},00`, quantidadeVenda: Number(multiplica) };
                setFieldValue('produtoEscaniado', values.produtoEscaniado.concat(novoProduto));
            }
            setBarcode('')
            setMultiplica('')
            setKey(Math.random())
        } else if (isBarcodeNumeric) {
            const produtoEncontrado = produto.find((p) => p.cdProduto === barcode);
            if (produtoEncontrado) {
                const novoProduto = { ...produtoEncontrado, quantidadeVenda: 1 }
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
            if (multiplica !== '') {
                const produtoEncontrado = produto.find((p) => p.nmProduto.toLowerCase() === barcode.toLowerCase());
                if (produtoEncontrado !== undefined) {
                    const valor = produtoEncontrado.vlVendaProduto;
                    const valorFormat = valor.match(/\d+/g)?.join('.');
                    const valorTotal = Number(multiplica) * Number(valorFormat);
                    const novoProduto = { ...produtoEncontrado, vlVendaProduto: `R$ ${valorTotal},00`, quantidadeVenda: Number(multiplica) };
                    setFieldValue('produtoEscaniado', values.produtoEscaniado.concat(novoProduto));
                    setBarcode('');
                    setMultiplica('');
                    setKey(Math.random())
                    setProdutoNotFound(false)
                } else {
                    setProdutoNotFound(true)
                }
            } else {
                const produtoEncontrado = produto.find((p) => p.nmProduto.toLowerCase() === barcode.toLowerCase());
                if (produtoEncontrado !== undefined) {
                    const novoProduto = { ...produtoEncontrado, quantidadeVenda: 1 }
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
        const precoFiltrado = values.produtoEscaniado.map(scanner => Number(scanner.vlVendaProduto?.match(/\d+/g)?.join(".")))
            .filter(valor => !isNaN(valor));
        const precoTotal = precoFiltrado.reduce((total, produto) => {
            return total + produto;
        }, 0);
        setFieldValue('vlTotal', precoTotal);
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
                setSuccess(true);
                setTimeout(() => { setSuccess(false) }, 2000)
            }).catch(() => {
                setFail(true)
                setTimeout(() => { setFail(false) }, 3000)
            });
            clearState()
        } else {
            setIsValid(true)
        }
    }

    //adicionando cascão a lista de compras 
    function cascao() {
        const produtoEncontrado = produto.find((p) => p.cdProduto === '9788545200345');
        if (produtoEncontrado) {
            const novoProduto = { ...produtoEncontrado, quantidadeVenda: 1 }
            setFieldValue('produtoEscaniado', values.produtoEscaniado.concat(novoProduto));
        }
    }

    //adicionando casquinha a lista de compras
    function casquinha() {
        const produtoEncontrado = produto.find((p) => p.cdProduto === '9788534508476');
        if (produtoEncontrado) {
            const novoProduto = { ...produtoEncontrado, quantidadeVenda: 1 }
            setFieldValue('produtoEscaniado', values.produtoEscaniado.concat(novoProduto));
        }
    }

    //adicionando taça sundae a lista de compras
    function tacaSundae() {
        if (qntBolas !== '') {
            const produtoEncontrado = produto.find((p) => p.cdProduto === '9788544001554');
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
                            onChange={e => setMultiplica(e.target.value)}
                            error={''}
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
                                primary={true}
                                onClick={handleSubmit}
                                fontSize={20}
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
                                            <TitlePreco>{produto.vlVendaProduto}</TitlePreco>
                                        </ContainerPreco>
                                    ))}
                                </>
                            )}
                        </ContainerNota>
                    </ContainerProdutos>
                </BoxProduto>
                {success &&
                    <ContainerAlert>
                        <Alert severity="success" style={{
                            position: 'absolute',
                            marginTop: '-20px',
                            width: '25rem'
                        }}>
                            <AlertTitle><strong>Sucesso</strong></AlertTitle>
                            Venda Cadastrada com <strong>Sucesso!</strong>
                        </Alert>
                    </ContainerAlert>
                }
                {fail &&
                    <ContainerAlert>
                        <Alert severity="error" style={{
                            position: 'absolute',
                            marginTop: '-20px',
                            width: '25rem'
                        }}>
                            <AlertTitle><strong>Erro</strong></AlertTitle>
                            Erro ao Cadastrar Venda.<strong>Tente novamente</strong>
                        </Alert>
                    </ContainerAlert>
                }
            </ContainerAll>
        </Box>
    );
}