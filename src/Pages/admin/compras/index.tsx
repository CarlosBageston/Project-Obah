import React, { useState, useEffect } from "react";
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { db } from "../../../firebase";
import ComprasModel from "./model/compras";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import GetData from "../../../firebase/getData";
import GenericTable from "../../../Components/table";
import FiltroGeneric from "../../../Components/filtro";
import { IsEdit } from "../../../Components/isEdit/isEdit";
import SituacaoProduto from "./enumeration/situacaoProduto";
import formatDate from "../../../Components/masks/formatDate";
import ProdutosModel from "../cadastroProdutos/model/produtos";
import FormAlert from "../../../Components/FormAlert/formAlert";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Autocomplete, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";

import {
    Box,
    ContainerInputs,
    DivInput,
    Title,
    ContainerButton,
} from './style'


const objClean: ComprasModel = {
    cdProduto: '',
    nmProduto: '',
    vlUnitario: '',
    dtCompra: null,
    quantidade: '',
    totalPago: null,
    tpProduto: null,
    cxProduto: null,
    kgProduto: null,
    qntMinima: null
}

export default function NovasCompras() {
    const [key, setKey] = useState<number>(0);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [initialValues, setInitialValues] = useState<ComprasModel>({ ...objClean });
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [selectAutoComplete, setSelectAutoComplete] = useState<boolean>(false);
    const [selected, setSelected] = useState<ComprasModel | undefined>();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [uniqueNames, setUniqueNames] = useState<any[]>([])
    const inputsConfig = [
        { label: 'Nome Do Produto', propertyName: 'nmProduto' },
        { label: 'Código do Produto', propertyName: 'cdProduto' },
        { label: 'Data', propertyName: 'dtCompra' },
        { label: 'Valor Unitário', propertyName: 'vlUnitario' },
        { label: 'Quantidade', propertyName: 'quantidade' },
        { label: 'Valor Total', propertyName: 'totalPago' },
        { label: 'Quant. mínima em estoque', propertyName: 'qntMinima' },
        { label: 'Quantidade na Caixa', propertyName: 'cxProduto' },
        { label: 'Quantidade KG', propertyName: 'kgProduto' },
    ];
    //Realizando busca no banco de dados
    const {
        dataTable,
        loading,
        setDataTable
    } = GetData('Compras', recarregue) as {
        dataTable: ComprasModel[],
        loading: boolean,
        setDataTable: (data: ComprasModel[]) => void
    };
    const {
        dataTable: produtoDataTable,
    } = GetData('Produtos', recarregue) as {
        dataTable: ProdutosModel[],
    };

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ComprasModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmProduto: Yup.string().required('Campo obrigatório'),
            cdProduto: Yup.string().required('Campo obrigatório'),
            vlUnitario: Yup.string().required('Campo obrigatório'),
            dtCompra: Yup.string().required('Campo obrigatório'),
            cxProduto: Yup.number().optional().nullable(),
            tpProduto: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório'),
            quantidade: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório'),
            qntMinima: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório')
        }),
        onSubmit: hundleSubmitForm,
    });

    //Limpa formulario
    function cleanState() {
        setInitialValues({
            cdProduto: '',
            nmProduto: '',
            vlUnitario: '',
            dtCompra: null,
            quantidade: '',
            totalPago: null,
            tpProduto: null,
            cxProduto: null,
            kgProduto: null,
            qntMinima: null
        })
        setKey(Math.random());
    }

    //deleta uma linha da tabela e do banco de dados
    async function handleDeleteRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            await deleteDoc(doc(db, "Compras", refID)).then(() => {
                const newDataTable = dataTable.filter(row => row.id !== selected.id);
                setDataTable(newDataTable);
            });
        }
        setSelected(undefined)
    }

    //enviando formulario
    async function hundleSubmitForm() {

        await addDoc(collection(db, "Compras"), {
            ...values
        })
            .then(() => {
                setSubmitForm(true)
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
                setDataTable([...dataTable, values])
            })
            .catch(() => {
                setSubmitForm(false)
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            });
        setUniqueNames([])
        resetForm()
        cleanState()
        setSelectAutoComplete(false);
    }
    //Formata valor do input
    useEffect(() => {
        function formatarValor(valor: string) {
            const inputText = valor.replace(/\D/g, "");
            let formattedText = "";
            if (inputText.length <= 2) {
                formattedText = inputText
            } else if (inputText.length === 3) {
                formattedText = inputText.substring(0, 1) + "," + inputText.substring(1);
            } else if (inputText.length === 4) {
                formattedText = inputText.substring(0, 2) + "," + inputText.substring(2);
            } else if (inputText.length === 5) {
                if (inputText[0] === '0') {
                    formattedText = "0," + inputText.substring(1, 6);
                } else {
                    formattedText = inputText.substring(0, 3) + "," + inputText.substring(3);
                }
            }
            return formattedText ? "R$ " + formattedText : "";
        }
        const formattedValue = formatarValor(values.vlUnitario);
        setFieldValue('vlUnitario', formattedValue);

    }, [values.vlUnitario]);

    //multiplicando
    useEffect(() => {
        if (isEdit && selected) {
            const valueFormat = selected.vlUnitario?.match(/\d+/g)?.join('.')
            const multiplication = Number(selected.quantidade) * Number(valueFormat)
            if (!isNaN(multiplication)) {
                const resultFormat = multiplication.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                setSelected((prevSelected) => ({
                    ...prevSelected,
                    totalPago: `R$ ${resultFormat}` || 0,
                } as ComprasModel | undefined));
            }
        } else {
            const valueFormat = values.vlUnitario?.match(/\d+/g)?.join('.')
            const multiplication = Number(values.quantidade) * Number(valueFormat)
            if (!isNaN(multiplication)) {
                const resultFormat = multiplication.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                setFieldValue('totalPago', `R$ ${resultFormat}`)
            } else {
                setFieldValue('totalPago', '')
            }
        }
    }, [values.quantidade, values.vlUnitario, selected?.quantidade, selected?.vlUnitario])

    //Editando linha da tabela e do banco de dados
    async function handleEditRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            const refTable = doc(db, "Compras", refID);

            if (JSON.stringify(selected) !== JSON.stringify(initialValues)) {
                await updateDoc(refTable, { ...selected })
                    .then(() => {
                        const index = dataTable.findIndex((item) => item.id === selected.id);
                        const updatedDataTable = [
                            ...dataTable.slice(0, index),
                            selected,
                            ...dataTable.slice(index + 1)
                        ];
                        setDataTable(updatedDataTable);
                    });
            }
        }
        setIsEdit(false)
        setSelected(undefined)
    }
    //fazendo autocomplete dos inputs
    useEffect(() => {
        const getProduct = () => {
            const filteredProducts = dataTable.filter(
                (produto) => produto.nmProduto === values.nmProduto
            );
            const sortedProducts = filteredProducts.sort(
                (a, b) =>
                    (b.dtCompra instanceof Date ? b.dtCompra.getTime() : 0) -
                    (a.dtCompra instanceof Date ? a.dtCompra.getTime() : 0)
            );
            const lastProduct = sortedProducts[0];
            return lastProduct;
        };

        const lastProduct = getProduct();
        if (values.tpProduto === SituacaoProduto.COMPRADO) {
            if (lastProduct) {
                setSelectAutoComplete(true);
                setFieldValue('cdProduto', lastProduct.cdProduto);
                setFieldValue('vlUnitario', lastProduct.vlUnitario);
                setFieldValue('qntMinima', lastProduct.qntMinima);
            }
        } else {
            const fabricadoAutoComplete = produtoDataTable.find(
                (produto) =>
                    produto.tpProduto === SituacaoProduto.FABRICADO &&
                    produto.nmProduto === values.nmProduto
            );
            if (lastProduct) {
                setSelectAutoComplete(true);
                setFieldValue('cdProduto', lastProduct.cdProduto);
                setFieldValue('vlUnitario', fabricadoAutoComplete?.vlPagoProduto);
                setFieldValue('qntMinima', lastProduct.qntMinima);
            } else if (fabricadoAutoComplete) {
                setFieldValue('vlUnitario', fabricadoAutoComplete.vlPagoProduto);
            }
        }
    }, [values.nmProduto, dataTable, values.tpProduto]);


    //tornando valores unicos no array/não repete
    useEffect(() => {

        if (values.tpProduto === SituacaoProduto.COMPRADO) {
            const filterUniqueNames = dataTable.filter(produtos => produtos.tpProduto === SituacaoProduto.COMPRADO)
            const uniqueNames = Array.from(new Set(filterUniqueNames.map(nome => nome.nmProduto)));
            setUniqueNames(uniqueNames)
        } else {
            const filterUniqueNames = produtoDataTable.filter(produtos => produtos.tpProduto === SituacaoProduto.FABRICADO)
            const uniqueNames = Array.from(new Set(filterUniqueNames.map(nome => nome.nmProduto)));
            setUniqueNames(uniqueNames)
        }
    }, [values.tpProduto])

    return (
        <Box>
            <Title>Atualização de estoque</Title>
            <ContainerInputs>
                <DivInput>
                    <FormControl
                        variant="standard"
                        sx={{ mb: 2, minWidth: 120 }}
                        style={{ width: '13rem' }}
                    >
                        <InputLabel style={{ color: '#4d68af', fontWeight: 'bold', paddingLeft: 4 }} id="standard-label">Situação do produto</InputLabel>
                        <Select
                            key={`tpProduto-${key}`}
                            name='tpProduto'
                            id="standard"
                            onBlur={handleBlur}
                            label="Selecione..."
                            labelId="standard-label"
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            value={values.tpProduto}
                            style={{ borderBottom: '1px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                        >
                            <MenuItem
                                value={SituacaoProduto.FABRICADO}
                            >
                                Fabricado
                            </MenuItem>
                            <MenuItem
                                value={SituacaoProduto.COMPRADO}
                            >
                                Comprado
                            </MenuItem>
                        </Select>
                        {touched.tpProduto && errors.tpProduto && (
                            <div style={{ color: 'red' }}>{errors.tpProduto}</div>
                        )}
                    </FormControl>
                    <Autocomplete
                        value={values.nmProduto}
                        options={uniqueNames}
                        onChange={(e, newValue, reason) => {
                            setFieldValue('nmProduto', newValue);
                            if (reason === 'clear' || reason === 'removeOption') {
                                setSelectAutoComplete(false);
                                setFieldValue('cdProduto', '');
                                setFieldValue('vlUnitario', '');
                                setFieldValue('qntMinima', '');
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
                        onChange={e => setFieldValue(e.target.name, e.target.value.replace(/[^\d]/g, ''))}
                        error={touched.cdProduto && errors.cdProduto ? errors.cdProduto : ''}
                        raisedLabel={selectAutoComplete}
                    />

                </DivInput>
                <DivInput>
                    <Input
                        key={`dtCompra-${key}`}
                        label="Data"
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
                        disabled={values.tpProduto === SituacaoProduto.FABRICADO}
                        maxLength={9}
                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                        error={touched.vlUnitario && errors.vlUnitario ? errors.vlUnitario : ''}
                        raisedLabel={selectAutoComplete || values.vlUnitario ? true : false}
                    />
                </DivInput>
                <DivInput>
                    <div style={{ display: 'flex' }}>
                        <Input
                            key={`cxProduto-${key}`}
                            name="cxProduto"
                            onBlur={handleBlur}
                            label="Quantidade na Caixa ?"
                            value={values.cxProduto ? values.cxProduto! : ''}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.cxProduto && errors.cxProduto ? errors.cxProduto : ''}
                            style={{ paddingBottom: 0 }}
                            styleDiv={{ paddingRight: 8 }}
                            styleLabel={{ fontSize: '0.8rem' }}
                        />
                        <Input
                            key={`kgProduto-${key}`}
                            name="kgProduto"
                            onBlur={handleBlur}
                            label="Quantidade KG ?"
                            value={values.kgProduto ? values.kgProduto! : ''}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.kgProduto && errors.kgProduto ? errors.kgProduto : ''}
                            style={{ paddingBottom: 0 }}
                            styleLabel={{ fontSize: '0.8rem' }}
                        />
                    </div>
                    <Input
                        key={`Quantidade-${key}`}
                        label="Quantidade"
                        onBlur={handleBlur}
                        name="quantidade"
                        value={values.quantidade!}
                        maxLength={10}
                        onChange={e => setFieldValue(e.target.name, e.target.value)}
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
            <div style={{ width: 200, marginLeft: '4rem' }}>
                <Input
                    key={`qntMinima-${key}`}
                    label="Quant. mínima em estoque"
                    onBlur={handleBlur}
                    name="qntMinima"
                    value={values.qntMinima || ''}
                    onChange={e => setFieldValue(e.target.name, e.target.value.toString().replace(/[^\d]/g, ''))}
                    maxLength={4}
                    error={touched.qntMinima && errors.qntMinima ? errors.qntMinima : ''}
                    style={{ paddingBottom: 0 }}
                    styleLabel={{ fontSize: '0.8rem' }}
                    raisedLabel={values.qntMinima ? true : false}
                />
            </div>
            {/* Editar Estoque */}
            <IsEdit
                editingScreen='Estoque'
                setSelected={setSelected}
                data={selected}
                handleEditRow={handleEditRow}
                inputsConfig={inputsConfig}
                isEdit={isEdit}
                products={[]}
                setIsEdit={setIsEdit}
            />
            <ContainerButton>
                <Button
                    children='Cadastrar Estoque'
                    type="button"
                    onClick={handleSubmit}
                    fontSize={20}
                    style={{ margin: '1rem 4rem 2rem 95%', height: '4rem', width: '12rem' }}
                />
                <FormAlert submitForm={submitForm} name={'Estoque'} />
            </ContainerButton>

            {/*Tabala */}
            <div style={{ margin: '-3.5rem 0px -40px 3rem' }}>
                <FiltroGeneric data={dataTable} setFilteredData={setDataTable} carregarDados={setRecarregue} type="date" />
            </div>
            <GenericTable
                columns={[
                    { label: 'Código', name: 'cdProduto' },
                    { label: 'Nome', name: 'nmProduto' },
                    { label: 'Data', name: 'dtCompra' },
                    { label: 'Valor', name: 'vlUnitario' },
                    { label: 'Quantidade', name: 'quantidade' },
                    { label: 'Quantidade na Caixa', name: 'cxProduto' },
                    { label: 'Quantidade KG', name: 'kgProduto' },
                    { label: 'Valor Total', name: 'totalPago' }
                ]}
                data={dataTable}
                isLoading={loading}
                isDisabled={selected ? false : true}
                onSelectedRow={setSelected}
                onEdit={() => {
                    if (selected) {
                        setIsEdit(true)
                        setInitialValues(selected)
                    } else {
                        return
                    }
                }}
                onDelete={handleDeleteRow}
            />
        </Box>
    );
}