import * as Yup from 'yup';
import { db } from "../../../firebase";
import ProdutoModel from "./model/produtos";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import GetData from "../../../firebase/getData";
import { FormikTouched, useFormik } from 'formik';
import { BoxTitleDefault } from "../estoque/style";
import React, { useState, useEffect } from "react";
import ComprasModel from "../compras/model/compras";
import GenericTable from "../../../Components/table";
import FiltroGeneric from "../../../Components/filtro";
import { IsEdit } from "../../../Components/isEdit/isEdit";
import FormAlert from "../../../Components/FormAlert/formAlert";
import { IsAdding } from "../../../Components/isAdding/isAdding";
import SituacaoProduto from "../../../enumeration/situacaoProduto";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, } from "@mui/material";
import {
    Box,
    Title,
    DivInput,
    ContainerInputs,
    ContainerButton,
    DivSituacaoProduto,
} from './style'


const objClean: ProdutoModel = {
    cdProduto: '',
    nmProduto: '',
    vlPagoProduto: '',
    vlVendaProduto: '',
    tpProduto: null,
    stEntrega: false,
    mpFabricado: []
}

export default function CadastroProduto() {
    const [key, setKey] = useState<number>(0);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [selected, setSelected] = useState<ProdutoModel | undefined>();
    const [isVisibleTpProuto, setIsVisibleTpProduto] = useState<boolean>(false);

    const inputsConfig = [
        { label: 'Nome', propertyName: 'nmProduto' },
        { label: 'Código do Produto', propertyName: 'cdProduto' },
        { label: 'Valor de Venda', propertyName: 'vlVendaProduto' },
        { label: 'Valor Pago', propertyName: 'vlPagoProduto' },
    ];
    const [initialValues, setInitialValues] = useState<ProdutoModel>({ ...objClean });

    //realizando busca no banco de dados
    const {
        dataTable,
        loading,
        setDataTable
    } = GetData('Produtos', recarregue) as { dataTable: ProdutoModel[], loading: boolean, setDataTable: (data: ProdutoModel[]) => void };
    const {
        dataTable: comprasDataTable,
    } = GetData('Compras', recarregue) as { dataTable: ComprasModel[] };

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ProdutoModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmProduto: Yup.string().required('Campo obrigatório'),
            cdProduto: Yup.string().required('Campo obrigatório'),
            vlPagoProduto: Yup.string().required('Campo obrigatório'),
            vlVendaProduto: Yup.string().required('Campo obrigatório'),
            tpProduto: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório'),
            mpFabricado: Yup.array().test("array vazio", 'Campo obrigatório', function (value) {
                const tpProduto = this.resolve(Yup.ref('tpProduto'));
                if (tpProduto === SituacaoProduto.FABRICADO && (!value || value.length === 0)) {
                    return false;
                } else {
                    return true;
                }
            }).nullable()
        }),
        onSubmit: handleSubmitForm,
    });
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
    function cleanState() {
        setInitialValues({
            cdProduto: '',
            nmProduto: '',
            vlPagoProduto: '',
            vlVendaProduto: '',
            tpProduto: null,
            stEntrega: false,
            mpFabricado: []
        })
        setKey(Math.random());
    }


    //enviando formulario
    async function handleSubmitForm() {


        await addDoc(collection(db, "Produtos"), {
            ...values
        })
            .then(() => {
                setSubmitForm(true);
                setDataTable([...dataTable, values]);
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            })
            .catch(() => {
                setSubmitForm(false);
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            });
        resetForm()
        setFieldValue('tpProduto', null)
        cleanState()
    }

    //deleta uma linha da tabela e do banco de dados
    async function handleDeleteRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            await deleteDoc(doc(db, "Produtos", refID)).then(() => {
                const newDataTable = dataTable.filter(row => row.id !== selected.id);
                setDataTable(newDataTable);
            });
        }
        setSelected(undefined)
    }

    //editar uma linha da tabela e do banco de dados
    async function handleEditRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            const refTable = doc(db, "Produtos", refID);

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

    useEffect(() => {
        let soma = 0;
        if (isEdit && selected) {
            for (const mp of selected.mpFabricado) {
                const produtoEncontrado = comprasDataTable.find(produto => produto.nmProduto === mp.nmProduto);

                if (produtoEncontrado) {
                    const valorPago = produtoEncontrado.vlUnitario;
                    const valueFormat = valorPago.match(/\d+/g)?.join('.');
                    let result = 0;

                    if (produtoEncontrado.cxProduto) {
                        const caixa = produtoEncontrado.cxProduto;
                        const quantidadeUsada = mp.quantidade;
                        console.log(values.mpFabricado)
                        result = Number(valueFormat) / Number(caixa) * Number(quantidadeUsada);

                    } else if (produtoEncontrado.kgProduto) {
                        const kg = produtoEncontrado.kgProduto;
                        const quantidadeUsada = mp.quantidade;
                        result = Number(valueFormat) / Number(kg) * Number(quantidadeUsada);
                    } else {
                        const quantidadetotal = produtoEncontrado.quantidade;
                        const quantidadeUsada = mp.quantidade;
                        result = Number(valueFormat) / Number(quantidadetotal) * Number(quantidadeUsada);
                    }
                    soma += result;
                }
            }
            const somaFormat = soma.toFixed(2)
            setSelected((prevSelected) => ({
                ...prevSelected,
                vlPagoProduto: `R$ ${somaFormat}` || '',
            } as ProdutoModel | undefined));
        } else {
            for (const mp of values.mpFabricado) {
                const produtoEncontrado = comprasDataTable.find(produto => produto.nmProduto === mp.nmProduto);

                if (produtoEncontrado) {
                    const valorPago = produtoEncontrado.vlUnitario;
                    const valueFormat = valorPago.match(/\d+/g)?.join('.');
                    let result = 0;

                    if (produtoEncontrado.cxProduto) {
                        const caixa = produtoEncontrado.cxProduto;
                        const quantidadeUsada = mp.quantidade;
                        result = Number(valueFormat) / Number(caixa) * Number(quantidadeUsada);

                    } else if (produtoEncontrado.kgProduto) {
                        const kg = produtoEncontrado.kgProduto;
                        const quantidadeUsada = mp.quantidade;
                        result = Number(valueFormat) / Number(kg) * Number(quantidadeUsada);
                    } else {
                        const quantidadetotal = produtoEncontrado.quantidade;
                        const quantidadeUsada = mp.quantidade;
                        result = Number(valueFormat) / Number(quantidadetotal) * Number(quantidadeUsada);
                    }
                    soma += result;
                }
            }
            const somaFormat = soma.toFixed(2)
            setFieldValue('vlPagoProduto', `R$ ${somaFormat}`);
        }
    }, [comprasDataTable, values.mpFabricado, isVisibleTpProuto, selected?.mpFabricado]);


    useEffect(() => {
        if (values.tpProduto === SituacaoProduto.FABRICADO) return setIsVisibleTpProduto(true)
        return setIsVisibleTpProduto(false)
    }, [values.tpProduto])
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
                    <DivSituacaoProduto>
                        <FormControl
                            variant="standard"
                            sx={{ mb: 2, minWidth: 120 }}
                            style={{ width: '13rem', display: 'flex', justifyContent: 'center' }}
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
                        <FormControlLabel control={<Checkbox checked={values.stEntrega} onChange={(e) => setFieldValue("stEntrega", e.target.checked)} />} label="Venda no atacado?" />

                    </DivSituacaoProduto>
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
                        disabled={values.tpProduto === SituacaoProduto.FABRICADO}
                        raisedLabel={values.tpProduto === SituacaoProduto.FABRICADO}
                        value={values.vlPagoProduto === 'R$ 0.00' ? '' : values.vlPagoProduto}
                        onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                        error={touched.vlPagoProduto && errors.vlPagoProduto ? errors.vlPagoProduto : ''}
                        styleDiv={{ marginTop: 4 }}
                        style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                    />
                </DivInput>
            </ContainerInputs>
            {/*Adicionando Produto */}
            <IsAdding
                addingScreen="Produto"
                data={comprasDataTable}
                isAdding={isVisibleTpProuto}
                products={values.mpFabricado}
                setFieldValue={setFieldValue}
                setIsVisibleTpProduto={setIsVisibleTpProduto}
                errors={errors.mpFabricado as FormikTouched<any> | undefined}
                touched={touched}
            />

            {/* Editar o Produto */}
            <IsEdit
                editingScreen='Produto'
                setSelected={setSelected}
                data={selected}
                handleEditRow={handleEditRow}
                inputsConfig={inputsConfig}
                isEdit={isEdit}
                products={selected ? selected.mpFabricado : []}
                setIsEdit={setIsEdit}
            />
            <ContainerButton>
                <Button
                    label='Cadastrar Produto'
                    type="button"
                    onClick={handleSubmit}
                    style={{ margin: '1rem 4rem 2rem 95%', height: '4rem', width: '12rem' }}
                />

                <FormAlert submitForm={submitForm} name={'Produto'} />
            </ContainerButton>

            {/*Tabala */}

            <BoxTitleDefault>
                <div>
                    <FiltroGeneric data={dataTable} setFilteredData={setDataTable} carregarDados={setRecarregue} type="produto" />
                </div>
            </BoxTitleDefault>
            <GenericTable
                columns={[
                    { label: 'Código', name: 'cdProduto' },
                    { label: 'Nome', name: 'nmProduto' },
                    { label: 'Valor Venda', name: 'vlVendaProduto' },
                    { label: 'Valor Pago', name: 'vlPagoProduto' },
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