import { addDoc, collection, CollectionReference, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import { TableContainer, Paper, Table, TableHead, TableRow, TableBody, TableCell, Alert, AlertTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { orderBy } from "lodash";
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { EntregaModel } from "./model/entrega";
import { ContainerAlert } from "../cadastroClientes/style";
import ClienteModel, { ValorProdutoModel } from "../cadastroClientes/model/cliente";
import {
    Box,
    ContainerTable,
    StyledTableCell,
    StyledTableRow,
    Title,
    ContainerTableCliente,
    TextTable,
    DivPreco,
    DivInputs,
    DivButtonAndTable,
    ContainerAll,
} from './style'
import formatDate from "../../../Components/masks/formatDate";


const objClean: EntregaModel = {
    vlLucro: '',
    vlEntrega: '',
    dtEntrega: '',
    quantidades: {
        moreninha: null,
        loirinha: null,
        pote1L: null,
        pote2L: null,
        sundae: null,
        Creme: null,
        Fruta: null,
        Itu: null,
        Pacote: null,
        balde10L: null,
        Skimo: null,
        Paleta: null,
    },
    cliente: {
        nmCliente: '',
        tfCleinte: '',
        ruaCliente: '',
        nrCasaCliente: '',
        bairroCliente: '',
        cidadeCliente: '',
        preco: {
            moreninha: null,
            loirinha: null,
            plCreme: null,
            plFruta: null,
            plItu: null,
            pote1L: null,
            pote2L: null,
            sundae: null,
            plPacote: null,
            Balde10L: null,
            plSkimo: null,
            plPaleta: null
        } as unknown as ValorProdutoModel,
    }
}

export default function Entregas() {
    const [key, setKey] = useState<number>(0);
    const [fail, setFail] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [resultCalculo, setResultCalculo] = useState<number[]>([]);
    const [dataTableEntregas, setDataTableEntregas] = useState<EntregaModel[]>([]);
    const [clienteCurrent, setClienteCurrent] = useState<ClienteModel[]>([]);
    const [dataTableCliente, setDataTableCliente] = useState<ClienteModel[]>([]);
    const _collectionClientes = collection(db, 'Clientes') as CollectionReference<ClienteModel>;
    const _collectionEntregas = collection(db, 'Entregas') as CollectionReference<EntregaModel>;

    const [initialValues, setInitialValues] = useState<EntregaModel>({ ...objClean });

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<EntregaModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            vlLucro: Yup.string().optional(),
            vlEntrega: Yup.string().required('Campo obrigatório'),
            dtEntrega: Yup.string().required('Campo obrigatório'),
            qtMoreninha: Yup.string().optional(),
            qtLoirinha: Yup.string().optional(),
            qtPlCreme: Yup.string().optional(),
            qtPlFruta: Yup.string().optional(),
            qtPlItu: Yup.string().optional(),
            qtPote1L: Yup.string().optional(),
            qtPote2L: Yup.string().optional(),
            qtSundae: Yup.string().optional(),
            qtPlPacote: Yup.string().optional(),
            qtBalde10L: Yup.string().optional(),
            qtPlSkimo: Yup.string().optional(),
            qtPlPaleta: Yup.string().optional(),
        }),
        onSubmit: hundleSubmitForm,
    });

    useEffect(() => {
        setLoading(true)
        const getClientes = async () => {
            const data = await getDocs<ClienteModel>(_collectionClientes);
            setDataTableCliente(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        };
        getClientes();
        const getEntregas = async () => {
            const dataEntregas = await getDocs<EntregaModel>(_collectionEntregas);
            setDataTableEntregas(dataEntregas.docs.map(doc => ({ ...doc.data(), id: doc.id })))
        }
        getEntregas()
        setLoading(false)
    }, []);

    function cleanState() {

        setInitialValues({
            vlLucro: '',
            vlEntrega: '',
            dtEntrega: '',
            quantidades: {
                moreninha: 0,
                loirinha: 0,
                pote1L: 0,
                pote2L: 0,
                sundae: 0,
                Creme: 0,
                Fruta: 0,
                Itu: 0,
                Pacote: 0,
                balde10L: 0,
                Skimo: 0,
                Paleta: 0,
            },
            cliente: {
                nmCliente: ''
            } as ClienteModel
        })
        setKey(Math.random());
    }

    //enviando formulario
    async function hundleSubmitForm() {
        await addDoc(collection(db, "Entregas"), {
            ...values
        })
            .then(() => {
                setSuccess(true);
                setTimeout(() => { setSuccess(false) }, 2000)
            })
            .then(() =>
                setDataTableEntregas([...dataTableEntregas, values]))
            .catch(() => {
                setFail(true)
                setTimeout(() => { setFail(false) }, 3000)
            });
        resetForm()
        cleanState()
    }

    //ordenando itens da tabela
    const sortedData = orderBy(dataTableEntregas, 'nmProduto');


    //manupulando evento de onchange do Select
    async function hundleCliente(event: SelectChangeEvent<string>) {
        const clienteSelecionado = event.target.value;
        const clienteData = await getDocs<ClienteModel>(_collectionClientes);
        const data = clienteData.docs.map(cliente => cliente.data())
        const clienteCerto = data.filter(cliente => cliente.nmCliente === clienteSelecionado)
        setClienteCurrent(clienteCerto)
        setFieldValue('cliente.nmCliente', clienteSelecionado)
    }
    //fazendo a soma dos lucros e do valor total
    useEffect(() => {
        const result = clienteCurrent.map(item => {
            const { moreninha, loirinha, Balde10L, plCreme, plFruta, plItu, plPacote, plPaleta, plSkimo, pote1L, pote2L, sundae } = item.preco
            const produtoM = Number(moreninha?.match(/\d+/g)?.join("."));
            const produtoL = Number(loirinha?.match(/\d+/g)?.join("."));
            const produtoB = Number(Balde10L?.match(/\d+/g)?.join("."));
            const produtoC = Number(plCreme?.match(/\d+/g)?.join("."));
            const produtoF = Number(plFruta?.match(/\d+/g)?.join("."));
            const produtoI = Number(plItu?.match(/\d+/g)?.join("."));
            const produtoP = Number(plPacote?.match(/\d+/g)?.join("."));
            const produtoSk = Number(plSkimo?.match(/\d+/g)?.join("."));
            const produtoP1 = Number(pote1L?.match(/\d+/g)?.join("."));
            const produtoP2 = Number(pote2L?.match(/\d+/g)?.join("."));
            const produtoS = Number(sundae?.match(/\d+/g)?.join("."));
            const produtoPt = Number(plPaleta?.match(/\d+/g)?.join("."));
            const multiplyValues = [
                produtoM * values.quantidades.moreninha!,
                produtoL * values.quantidades.loirinha!,
                produtoP1 * values.quantidades.pote1L!,
                produtoP2 * values.quantidades.pote2L!,
                produtoS * values.quantidades.sundae!,
                produtoI * values.quantidades.Itu!,
                produtoF * values.quantidades.Fruta!,
                produtoC * values.quantidades.Creme!,
                produtoP * values.quantidades.Pacote!,
                produtoB * values.quantidades.balde10L!,
                produtoSk * values.quantidades.Skimo!,
                produtoPt * values.quantidades.Paleta!,
            ];
            setResultCalculo(multiplyValues)
            return multiplyValues.filter(valor => !isNaN(valor));
        }).flat();
        const sum = result.reduce((total, number) => total + number, 0);

        if (sum === 0) return
        const formattedSum = sum.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        setFieldValue('vlEntrega', formattedSum);
    }, [values]);
    return (
        <Box>
            <Title>Cadastro de Novas Entregas</Title>
            {success &&
                <ContainerAlert>
                    <Alert severity="success" style={{
                        position: 'absolute',
                        marginTop: '25rem'
                    }}>
                        <AlertTitle><strong>Sucesso</strong></AlertTitle>
                        Entrega Cadastrado com <strong>Sucesso!</strong>
                    </Alert>
                </ContainerAlert>
            }
            {fail &&
                <ContainerAlert>
                    <Alert severity="error" style={{
                        position: 'absolute',
                        marginTop: '25rem'
                    }}>
                        <AlertTitle><strong>Erro</strong></AlertTitle>
                        Erro ao Cadastrar novo Entrega.<strong>Tente novamente</strong>
                    </Alert>
                </ContainerAlert>
            }
            <ContainerAll>
                <DivInputs>
                    <FormControl
                        variant="standard"
                        sx={{ m: 1, minWidth: 120 }}
                        style={{ paddingRight: '3rem' }}
                    >
                        <InputLabel style={{ color: '#4d68af', fontWeight: 'bold', paddingLeft: 4 }} id="standard-label">Nome do Cliente</InputLabel>
                        <Select
                            name='cliente'
                            id="standard"
                            onBlur={handleBlur}
                            label="Selecione..."
                            labelId="standard-label"
                            onChange={hundleCliente}
                            value={values.cliente?.nmCliente}
                            style={{ borderBottom: '1px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            MenuProps={{
                                autoFocus: false,
                                PaperProps: {
                                    style: {
                                        height: 200,
                                        overflow: 'auto'
                                    }
                                }
                            }}
                        >
                            {dataTableCliente.map(cliente => (
                                <MenuItem
                                    key={cliente.id}
                                    value={cliente.nmCliente}
                                >
                                    {cliente.nmCliente}
                                </MenuItem>
                            ))}
                        </Select>
                        <Input
                            key={`dtEntrega-${key}`}
                            maxLength={10}
                            name="dtEntrega"
                            onBlur={handleBlur}
                            label="Data da Entrega"
                            value={values.dtEntrega}
                            onChange={e => setFieldValue(e.target.name, formatDate(e.target.value))}
                            error={touched.dtEntrega && errors.dtEntrega ? errors.dtEntrega : ''}
                            styleDiv={{ marginTop: 8 }}
                        />
                    </FormControl>
                    <div>
                        <Input
                            key={`vlEntrega-${key}`}
                            label="Valor Total"
                            name="vlEntrega"
                            onBlur={handleBlur}
                            value={values.vlEntrega && `R$ ${values.vlEntrega}`}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.vlEntrega && errors.vlEntrega ? errors.vlEntrega : ''}
                            style={{ color: 'black', opacity: 1, borderBottom: '2px solid #c7c6f3', backgroundColor: '#e0e0e04f' }}
                            styleDiv={{ marginTop: 0 }}
                            disabled
                            raisedLabel={values.vlEntrega ? true : false}
                        />
                        <Input
                            key={`vlLucro-${key}`}
                            disabled
                            label="Lucro"
                            name="vlLucro"
                            onBlur={handleBlur}
                            value={values.vlLucro}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.vlLucro && errors.vlLucro ? errors.vlLucro : ''}
                            styleDiv={{ marginTop: 8 }}
                        />
                    </div>
                </DivInputs>
                <DivButtonAndTable>
                    <ContainerTableCliente isVisible={values.cliente?.nmCliente ? false : true}>
                        {clienteCurrent.map(info => (
                            <>
                                <div>
                                    <TextTable isDisabled={!info.preco.moreninha}>
                                        {'Moreninha'}
                                    </TextTable>
                                    <TextTable isDisabled={!info.preco.loirinha}>
                                        {'Loirinha'}
                                    </TextTable>
                                    <TextTable isDisabled={!info.preco.pote1L}>
                                        {'Pote de 1 Litro'}
                                    </TextTable>
                                    <TextTable isDisabled={!info.preco.pote2L}>
                                        {'Pote de 2 Litros'}
                                    </TextTable>
                                    <TextTable isDisabled={!info.preco.plItu}>
                                        {'Sundae'}
                                    </TextTable>
                                    <TextTable isDisabled={!info.preco.plItu}>
                                        {'Picolé de itú'}
                                    </TextTable>
                                    <TextTable isDisabled={!info.preco.plFruta}>
                                        {'Picolé de Fruta'}
                                    </TextTable>
                                    <TextTable isDisabled={!info.preco.plCreme}>
                                        {'Picolé de Leite'}
                                    </TextTable>
                                    <TextTable isDisabled={!info.preco.plPacote}>
                                        {'Pacote de Picolé'}
                                    </TextTable>
                                    <TextTable isDisabled={!info.preco.Balde10L}>
                                        {'Balde de 10 Litros'}
                                    </TextTable>
                                    <TextTable isDisabled={!info.preco.plSkimo}>
                                        {'Picolé de Skimo'}
                                    </TextTable>
                                    <TextTable isDisabled={!info.preco.plPaleta}>
                                        {'Picolé de Paleta'}
                                    </TextTable>
                                </div>
                                <DivPreco>
                                    <TextTable isDisabled={!info.preco.moreninha}> {info.preco.moreninha ? info.preco.moreninha : '-'} </TextTable>
                                    <TextTable isDisabled={!info.preco.loirinha}> {info.preco.loirinha ? info.preco.loirinha : '-'} </TextTable>
                                    <TextTable isDisabled={!info.preco.pote1L}> {info.preco.pote1L ? info.preco.pote1L : '-'} </TextTable>
                                    <TextTable isDisabled={!info.preco.pote2L}> {info.preco.pote2L ? info.preco.pote2L : '-'}</TextTable>
                                    <TextTable isDisabled={!info.preco.sundae}> {info.preco.sundae ? info.preco.sundae : '-'} </TextTable>
                                    <TextTable isDisabled={!info.preco.plItu}> {info.preco.plItu ? info.preco.plItu : '-'} </TextTable>
                                    <TextTable isDisabled={!info.preco.plFruta}> {info.preco.plFruta ? info.preco.plFruta : '-'} </TextTable>
                                    <TextTable isDisabled={!info.preco.plCreme}> {info.preco.plCreme ? info.preco.plCreme : '-'} </TextTable>
                                    <TextTable isDisabled={!info.preco.plPacote}> {info.preco.plPacote ? info.preco.plPacote : '-'} </TextTable>
                                    <TextTable isDisabled={!info.preco.Balde10L}> {info.preco.Balde10L ? info.preco.Balde10L : '-'} </TextTable>
                                    <TextTable isDisabled={!info.preco.plSkimo}> {info.preco.plSkimo ? info.preco.plSkimo : '-'} </TextTable>
                                    <TextTable isDisabled={!info.preco.plPaleta}> {info.preco.plPaleta ? info.preco.plPaleta : '-'} </TextTable>
                                </DivPreco>
                                <div style={{ width: '12rem' }}>
                                    <Input
                                        disabled={!info.preco.moreninha}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtMoreninha-${key}`}
                                        label="Quantidade"
                                        name="quantidades.moreninha"
                                        onBlur={handleBlur}
                                        value={values.quantidades.moreninha!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.moreninha && errors.quantidades?.moreninha ? errors.quantidades.moreninha : ''}
                                    />
                                    <Input
                                        disabled={!info.preco.loirinha}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtLoirinha-${key}`}
                                        label="Quantidade"
                                        name="quantidades.loirinha"
                                        onBlur={handleBlur}
                                        value={values.quantidades.loirinha!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.loirinha && errors.quantidades?.loirinha ? errors.quantidades?.loirinha : ''}
                                    />
                                    <Input
                                        disabled={!info.preco.pote1L}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtPote1L-${key}`}
                                        label="Quantidade"
                                        name="quantidades.pote1L"
                                        onBlur={handleBlur}
                                        value={values.quantidades.pote1L!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.pote1L && errors.quantidades?.pote1L ? errors.quantidades?.pote1L : ''}
                                    />
                                    <Input
                                        disabled={!info.preco.pote2L}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtPote2L-${key}`}
                                        label="Quantidade"
                                        name="quantidades.pote2L"
                                        onBlur={handleBlur}
                                        value={values.quantidades.pote2L!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.pote2L && errors.quantidades?.pote2L ? errors.quantidades?.pote2L : ''}
                                    />
                                    <Input
                                        disabled={!info.preco.sundae}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtSundae-${key}`}
                                        label="Quantidade"
                                        name="quantidades.sundae"
                                        onBlur={handleBlur}
                                        value={values.quantidades.sundae!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.sundae && errors.quantidades?.sundae ? errors.quantidades?.sundae : ''}
                                    />
                                    <Input
                                        disabled={!info.preco.plItu}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtPlItu-${key}`}
                                        label="Quantidade"
                                        name="quantidades.Itu"
                                        onBlur={handleBlur}
                                        value={values.quantidades.Itu!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.Itu && errors.quantidades?.Itu ? errors.quantidades?.Itu : ''}
                                    />
                                    <Input
                                        disabled={!info.preco.plFruta}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtPlFruta-${key}`}
                                        label="Quantidade"
                                        name="quantidades.Fruta"
                                        onBlur={handleBlur}
                                        value={values.quantidades.Fruta!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.Fruta && errors.quantidades?.Fruta ? errors.quantidades?.Fruta : ''}
                                    />
                                    <Input
                                        disabled={!info.preco.plCreme}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtPlCreme-${key}`}
                                        label="Quantidade"
                                        name="quantidades.Creme"
                                        onBlur={handleBlur}
                                        value={values.quantidades.Creme!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.Creme && errors.quantidades?.Creme ? errors.quantidades?.Creme : ''}
                                    />

                                    <Input
                                        disabled={!info.preco.plPacote}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtPlPacote-${key}`}
                                        label="Quantidade"
                                        name="quantidades.Pacote"
                                        onBlur={handleBlur}
                                        value={values.quantidades.Pacote!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.Pacote && errors.quantidades?.Pacote ? errors.quantidades?.Pacote : ''}
                                    />
                                    <Input
                                        disabled={!info.preco.Balde10L}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtBalde10L-${key}`}
                                        label="Quantidade"
                                        name="quantidades.balde10L"
                                        onBlur={handleBlur}
                                        value={values.quantidades.balde10L!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.balde10L && errors.quantidades?.balde10L ? errors.quantidades?.balde10L : ''}
                                    />
                                    <Input
                                        disabled={!info.preco.plSkimo}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtPlSkimo-${key}`}
                                        label="Quantidade"
                                        name="quantidades.Skimo"
                                        onBlur={handleBlur}
                                        value={values.quantidades.Skimo!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.Skimo && errors.quantidades?.Skimo ? errors.quantidades?.Skimo : ''}
                                    />
                                    <Input
                                        disabled={!info.preco.plPaleta}
                                        styleDiv={{ marginTop: 4 }}
                                        key={`qtPlPaleta-${key}`}
                                        label="Quantidade"
                                        name="quantidades.Paleta"
                                        onBlur={handleBlur}
                                        value={values.quantidades.Paleta!}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.quantidades?.Paleta && errors.quantidades?.Paleta ? errors.quantidades?.Paleta : ''}
                                    />
                                </div>
                                <DivPreco>
                                    {resultCalculo.map((result, index) => (
                                        <TextTable isDisabled key={index}>R$ {!Number.isNaN(result) ? result : '-'}</TextTable>
                                    ))}
                                </DivPreco>
                            </>
                        ))}
                    </ContainerTableCliente>
                    <div>
                        <Button
                            children='Cadastrar Entrega'
                            type="button"
                            onClick={handleSubmit}
                            fontSize={20}
                            style={{ margin: '2rem 0px 2rem 0px', height: '4rem', width: '12rem' }}
                        />
                    </div>
                </DivButtonAndTable>
            </ContainerAll>
            {/*Tabala */}
            <ContainerTable>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Data Da Entrega</StyledTableCell>
                                <StyledTableCell>Nome</StyledTableCell>
                                <StyledTableCell>Valor Total</StyledTableCell>
                                <StyledTableCell>Valor Lucro</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10}> Carregando...</TableCell>
                                </TableRow>
                            ) : (
                                sortedData.map((row) => (
                                    <StyledTableRow key={row.id}>
                                        <StyledTableCell>{row.dtEntrega?.toString()}</StyledTableCell>
                                        <StyledTableCell>{row.cliente?.nmCliente}</StyledTableCell>
                                        <StyledTableCell>R$ {row.vlEntrega}</StyledTableCell>
                                        <StyledTableCell>{row.vlLucro}</StyledTableCell>
                                    </StyledTableRow>
                                ))
                            )}

                        </TableBody>
                    </Table>
                </TableContainer>
            </ContainerTable>
        </Box>
    );
}
