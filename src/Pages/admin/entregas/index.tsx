import { addDoc, collection, CollectionReference, deleteDoc, doc, getDocs } from "firebase/firestore";
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
import ClienteModel from "../cadastroClientes/model/cliente";
import {
    Box,
    ContainerTable,
    StyledTableCell,
    StyledTableRow,
    Title,
    ContainerTableCliente,
    TextTable,
    DivProduto,
    DivInputs,
    DivButtonAndTable,
    ContainerAll,
    NameProduto,
    QntProduto,
    ResultProduto,
    ValueProduto
} from './style'
import formatDate from "../../../Components/masks/formatDate";
import GenericTable from "../../../Components/table";
import GetData from "../../../firebase/getData";
import FiltroGeneric from "../../../Components/filtro";


const objClean: EntregaModel = {
    vlLucro: '',
    vlEntrega: '',
    dtEntrega: '',
    quantidades: [],
}

export default function Entregas() {
    const [key, setKey] = useState<number>(0);
    const [fail, setFail] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [selected, setSelected] = useState<EntregaModel>();
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [resultCalculo, setResultCalculo] = useState<number[]>([]);
    const [clienteCurrent, setClienteCurrent] = useState<ClienteModel[]>([]);
    const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});

    const [initialValues, setInitialValues] = useState<EntregaModel>({ ...objClean });

    //realizando busca no banco de dados
    const {
        dataTable: dataTableCliente,
    } = GetData('Clientes', recarregue) as { dataTable: ClienteModel[] };
    const {
        dataTable: dataTableEntregas,
        setDataTable: setDataTableEntregas,
        loading
    } = GetData('Entregas', recarregue) as { dataTable: EntregaModel[], setDataTable: (data: EntregaModel[]) => void, loading: boolean };

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<EntregaModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            vlLucro: Yup.string().optional(),
            vlEntrega: Yup.string().required('Campo obrigatório'),
            dtEntrega: Yup.string().required('Campo obrigatório'),
        }),
        onSubmit: hundleSubmitForm,
    });


    //deleta uma linha da tabela e do banco de dados
    async function handleDeleteRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            await deleteDoc(doc(db, "Entregas", refID)).then(() => {
                const newDataTable = dataTableEntregas.filter(row => row.id !== selected.id);
                setDataTableEntregas(newDataTable);
            });
        }
        setSelected(undefined)
    }

    //limpa os inputs
    function cleanState() {
        setFieldValue('vlLucro', '')
        setFieldValue('vlEntrega', '')
        setFieldValue('dtEntrega', '')
        setFieldValue('quantidades', [])
        setFieldValue('cliente.nmCliente', '')
        setQuantidades({})
        setKey(Math.random());
    }

    //enviando formulario
    async function hundleSubmitForm() {
        await addDoc(collection(db, "Entregas"), {
            ...values,
            quantidades: quantidades
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

    //manupulando evento de onchange do Select
    async function hundleCliente(event: SelectChangeEvent<string>) {
        const clienteSelecionado = event.target.value;
        const clienteCerto = dataTableCliente.filter(cliente => cliente.nmCliente === clienteSelecionado)
        setClienteCurrent(clienteCerto)
        setFieldValue('cliente.nmCliente', clienteSelecionado)
    }

    //fazendo a soma dos lucros e do valor total
    useEffect(() => {
        const temp: number[] = [];
        const result = clienteCurrent.flatMap((cliente) =>
            cliente.produtos.map((produto) => {
                const quantidade = quantidades[produto.nmProduto] ?? 0;
                const valor = Number(produto.vlVendaProduto.match(/\d+/g)?.join('.'));
                const total = quantidade * valor;
                temp.push(total)
                return total;
            })
        );
        setResultCalculo(temp);
        const sum = result.reduce((total, number) => total + number, 0);

        if (sum === 0) return
        const formattedSum = sum.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        setFieldValue('vlEntrega', formattedSum);
    }, [quantidades]);
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
                            key={`cliente-${key}`}
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
                        {clienteCurrent.map(cliente => (
                            <>
                                {cliente.produtos.map((produto, index) => (
                                    <DivProduto key={produto.nmProduto}>
                                        <NameProduto>
                                            <TextTable>{produto.nmProduto}</TextTable>
                                        </NameProduto>
                                        <ValueProduto>
                                            <TextTable>{produto.vlVendaProduto}</TextTable>
                                        </ValueProduto>
                                        <QntProduto>
                                            <Input
                                                key={`qnt-${key}`}
                                                error=""
                                                label="Quantidade"
                                                name={`quantidades.${produto.nmProduto}`}
                                                onChange={(e) => {
                                                    const value = Number(e.target.value);
                                                    setQuantidades((prevQuantidades) => ({
                                                        ...prevQuantidades,
                                                        [produto.nmProduto]: value,
                                                    }));
                                                }}
                                                value={quantidades[produto.nmProduto] ?? ''}
                                            />
                                        </QntProduto>
                                        <ResultProduto>
                                            <TextTable>R$ {!Number.isNaN(resultCalculo[index]) ? resultCalculo[index] : '-'}</TextTable>
                                        </ResultProduto>
                                    </DivProduto>
                                ))}
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
            <div style={{ margin: '-3.5rem 0px -35px 3rem' }}>
                <FiltroGeneric
                    data={dataTableEntregas}
                    carregarDados={setRecarregue}
                    setFilteredData={setDataTableEntregas}
                    type='cliente'
                />
            </div>
            <GenericTable
                columns={[
                    { label: 'Nome', name: 'cliente.nmCliente' },
                    { label: 'Data Entrega', name: 'dtEntrega' },
                    { label: 'Valor Total', name: 'vlEntrega' },
                    { label: 'Lucro', name: 'vlLucro' },
                ]}
                data={dataTableEntregas}
                isLoading={loading}
                onSelectedRow={setSelected}
                isVisibleEdit
                onDelete={handleDeleteRow}
                isDisabled={selected ? false : true}
            />
        </Box>
    );
}
