import { addDoc, collection, CollectionReference, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import ProdutoModel from "./model/produtos";
import Button from "../../../Components/button";
import { Alert, AlertTitle } from "@mui/material";
import { orderBy } from "lodash";
import * as Yup from 'yup';
import { useFormik } from 'formik';

import {
    Box,
    ContainerInputs,
    DivInput,
    Title,
    ContainerButton
} from './style'
import { ContainerAlert } from "../cadastroClientes/style";
import GenericTable from "../../../Components/table";
import FiltroGeneric from "../../../Components/filtro";
import GetData from "../../../firebase/getData";


const objClean: ProdutoModel = {
    cdProduto: '',
    nmProduto: '',
    vlPagoProduto: '',
    vlVendaProduto: ''
}

export default function CadastroProduto() {
    const [key, setKey] = useState<number>(0);
    const [fail, setFail] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [recarregue, setRecarregue] = useState<boolean>(true);

    const [initialValues, setInitialValues] = useState<ProdutoModel>({ ...objClean });

    //realizando busca no banco de dados
    const { dataTable, loading, setDataTable } = GetData('Produtos', recarregue);

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ProdutoModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmProduto: Yup.string().required('Campo obrigatório'),
            cdProduto: Yup.string().required('Campo obrigatório'),
            vlPagoProduto: Yup.string().required('Campo obrigatório'),
            vlVendaProduto: Yup.string().required('Campo obrigatório'),
        }),
        onSubmit: handleSubmitForm,
    });

    function cleanState() {
        setInitialValues({
            cdProduto: '',
            nmProduto: '',
            vlPagoProduto: '',
            vlVendaProduto: '',
        })
        setKey(Math.random());
    }

    //enviando formulario
    async function handleSubmitForm() {


        await addDoc(collection(db, "Produtos"), {
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
    const sortedData = orderBy(dataTable, 'nmProduto');
    return (
        <Box>
            <Title>Cadastro de Novos Produtos</Title>
            <ContainerInputs>
                <DivInput>
                    <Input
                        key={`nmProduto-${key}`}
                        label="Nome"
                        name="nmProduto"
                        onBlur={handleBlur}
                        value={values.nmProduto}
                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                        error={touched.nmProduto && errors.nmProduto ? errors.nmProduto : ''}
                        styleDiv={{ marginTop: 4 }}
                        style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                    />
                    <Input
                        key={`cdProduto-${key}`}
                        name="cdProduto"
                        onBlur={handleBlur}
                        label="Código do Produto"
                        value={values.cdProduto}
                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                        error={touched.cdProduto && errors.cdProduto ? errors.cdProduto : ''}
                        styleDiv={{ marginTop: 4 }}
                        style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                    />
                </DivInput>
                <DivInput>

                    <Input
                        key={`vlVendaProduto-${key}`}
                        label="Valor Venda"
                        onBlur={handleBlur}
                        name="vlVendaProduto"
                        value={values.vlVendaProduto}
                        onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                        error={touched.vlVendaProduto && errors.vlVendaProduto ? errors.vlVendaProduto : ''}
                        styleDiv={{ marginTop: 4 }}
                        style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                    />
                    <Input
                        key={`vlPagoProduto-${key}`}
                        label="Valor Pago"
                        onBlur={handleBlur}
                        name="vlPagoProduto"
                        value={values.vlPagoProduto}
                        onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                        error={touched.vlPagoProduto && errors.vlPagoProduto ? errors.vlPagoProduto : ''}
                        styleDiv={{ marginTop: 4 }}
                        style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
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
                <FiltroGeneric
                    data={dataTable}
                    setFilteredData={setDataTable}
                    type="produto"
                    carregarDados={setRecarregue}
                />
            </div>
            <GenericTable
                columns={[
                    { label: 'Código', name: 'cdProduto' },
                    { label: 'Nome', name: 'nmProduto' },
                    { label: 'Valor Venda', name: 'vlVendaProduto' },
                    { label: 'Valor fabricar', name: 'vlPagoProduto' },
                ]}
                data={dataTable}
                isLoading={loading}
            />
        </Box>
    );
}