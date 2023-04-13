import { addDoc, collection, CollectionReference, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import ComprasModel from "./model/compras";
import Button from "../../../Components/button";
import { Alert, AlertTitle, Autocomplete, AutocompleteCloseReason, TextField } from "@mui/material";
import { get, orderBy } from "lodash";
import * as Yup from 'yup';
import { useFormik } from 'formik';

import {
    Box,
    ContainerInputs,
    DivInput,
    Title,
    ContainerButton,
} from './style'
import { ContainerAlert } from "../cadastroClientes/style";
import formatDate from "../../../Components/masks/formatDate";
import FiltroGeneric from "../../../Components/filtro";
import GenericTable from "../../../Components/table";
import GetData from "../../../firebase/getData";


const objClean: ComprasModel = {
    cdProduto: '',
    nmProduto: '',
    vlUnitario: '',
    dtCompra: '',
    quantidade: null,
    totalPago: null
}

export default function NovasCompras() {
    const [key, setKey] = useState<number>(0);
    const [fail, setFail] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<ComprasModel>({ ...objClean });
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [select, setSelect] = useState<boolean>(false);

    //Realizando busca no banco de dados
    const { dataTable, loading, setDataTable } = GetData('Compras', recarregue);

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ComprasModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmProduto: Yup.string().required('Campo obrigatório'),
            cdProduto: Yup.string().required('Campo obrigatório'),
            vlUnitario: Yup.string().required('Campo obrigatório'),
            dtCompra: Yup.string().required('Campo obrigatório'),
            quantidade: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório'),
        }),
        onSubmit: hundleSubmitForm,
    });


    function cleanState() {
        setInitialValues({
            cdProduto: '',
            nmProduto: '',
            vlUnitario: '',
            dtCompra: '',
            quantidade: null,
            totalPago: null
        })
        setKey(Math.random());
    }

    //enviando formulario
    async function hundleSubmitForm() {

        await addDoc(collection(db, "Compras"), {
            ...values
        })
            .then(() => {
                setSuccess(true);
                setTimeout(() => { setSuccess(false) }, 2000)
            })
            .then(() =>
                setDataTable([...dataTable, values]))
            .catch(() => {
                setFail(true)
                setTimeout(() => { setFail(false) }, 3000)
            });
        resetForm()
        cleanState()
        setSelect(false);
    }
    //Formata valor do input
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

    useEffect(() => {
        const mult = () => {
            const valueFormat = values.vlUnitario?.match(/\d+/g)?.join('.')
            const multiplication = values.quantidade! * Number(valueFormat)
            if (!isNaN(multiplication)) {
                const resultFormat = multiplication.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                setFieldValue('totalPago', `R$ ${resultFormat}`)
            } else {
                setFieldValue('totalPago', '')
            }
        }
        mult()
    }, [values.quantidade])

    useEffect(() => {
        const getProduct = () => {
            const dataTableWithDate = dataTable.map(produto => ({
                ...produto,
                dtcompra: new Date(produto.dtcompra)
            }));
            const filteredProducts = dataTableWithDate.filter(produto => produto.nmProduto === values.nmProduto);
            const sortedProducts = filteredProducts.sort((a, b) => b.dtcompra - a.dtcompra);
            const lastProduct = sortedProducts[0];
            return lastProduct;
        };

        const lastProduct = getProduct();
        if (lastProduct) {
            setSelect(true)
            setFieldValue('cdProduto', lastProduct.cdProduto);
            setFieldValue('vlUnitario', lastProduct.vlUnitario);
        }
    }, [values.nmProduto, dataTable]);
    const uniqueNames = Array.from(new Set(dataTable.map(nome => nome.nmProduto)));


    return (
        <Box>
            <Title>Novas Compras</Title>
            <ContainerInputs>
                <DivInput>
                    <Autocomplete
                        value={values.nmProduto}
                        options={uniqueNames}
                        onChange={(e, newValue, reason) => {
                            setFieldValue('nmProduto', newValue);
                            if (reason === 'clear' || reason === 'removeOption') {
                                setSelect(false);
                                setFieldValue('cdProduto', '');
                                setFieldValue('vlUnitario', '');
                            }
                        }}
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
                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                        error={touched.cdProduto && errors.cdProduto ? errors.cdProduto : ''}
                        raisedLabel={select}
                    />
                </DivInput>
                <DivInput>
                    <Input
                        key={`dtCompra-${key}`}
                        label="Data Da Compra"
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
                        value={values.vlUnitario}
                        maxLength={9}
                        onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                        error={touched.vlUnitario && errors.vlUnitario ? errors.vlUnitario : ''}
                        raisedLabel={select}
                    />
                </DivInput>
                <DivInput>
                    <Input
                        key={`Quantidade-${key}`}
                        label="Quantidade"
                        onBlur={handleBlur}
                        name="quantidade"
                        value={values.quantidade!}
                        maxLength={10}
                        onChange={e => setFieldValue(e.target.name, formatDate(e.target.value))}
                        error={touched.quantidade && errors.quantidade ? errors.quantidade : ''}
                    />
                    <Input
                        key={`totalPago-${key}`}
                        label="Valor Total"
                        onBlur={handleBlur}
                        disabled
                        name="totalPago"
                        value={values.totalPago || ''}
                        onChange={e => e}
                        maxLength={9}
                        error={''}
                        raisedLabel={values.totalPago ? true : false}
                    />
                </DivInput>
            </ContainerInputs>
            <ContainerButton>
                <Button
                    children='Cadastrar Produto'
                    type="button"
                    onClick={handleSubmit}
                    fontSize={20}
                    style={{ margin: '1rem 4rem 1rem 95%', height: '4rem', width: '12rem' }}
                />
                {success &&
                    <ContainerAlert>
                        <Alert severity="success" style={{
                            position: 'absolute',
                            marginTop: '-20px',
                            width: '25rem'
                        }}>
                            <AlertTitle><strong>Sucesso</strong></AlertTitle>
                            Cliente Cadastrado com <strong>Sucesso!</strong>
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
                            Erro ao Cadastrar novo Cliente.<strong>Tente novamente</strong>
                        </Alert>
                    </ContainerAlert>
                }
            </ContainerButton>

            {/*Tabala */}
            <div style={{ margin: '-3.5rem 0px -12px 3rem' }}>
                <FiltroGeneric data={dataTable} setFilteredData={setDataTable} carregarDados={setRecarregue} type="date" />
            </div>
            <GenericTable
                columns={[
                    { label: 'Código', name: 'cdProduto' },
                    { label: 'Nome', name: 'nmProduto' },
                    { label: 'Data', name: 'dtCompra' },
                    { label: 'Valor', name: 'vlUnitario' },
                    { label: 'Quantidade', name: 'quantidade' },
                    { label: 'Valor Total', name: 'totalPago' }
                ]}
                data={dataTable}
                isLoading={loading}
            />
        </Box>
    );
}