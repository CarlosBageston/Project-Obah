import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import ProdutoModel from "./model/produtos";
import Button from "../../../Components/button";
import { Autocomplete, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import * as Yup from 'yup';
import { useFormik } from 'formik';

import {
    Box,
    ContainerInputs,
    DivInput,
    Title,
    ContainerButton,
    Paragrafo,
} from './style'
import GenericTable from "../../../Components/table";
import FiltroGeneric from "../../../Components/filtro";
import GetData from "../../../firebase/getData";
import SituacaoProduto from "../compras/enumeration/situacaoProduto";
import ComprasModel from "../compras/model/compras";
import FormAlert from "../../../Components/FormAlert/formAlert";
import { IsEdit } from "../../../Components/isEdit/isEdit";
import { ButtonStyled, ContainerFlutuante, ContianerMP, DivLineMP } from "../../../Components/isEdit/style";


const objClean: ProdutoModel = {
    cdProduto: '',
    nmProduto: '',
    vlPagoProduto: '',
    vlVendaProduto: '',
    tpProduto: null,
    mpFabricado: []
}

export default function CadastroProduto() {
    const [key, setKey] = useState<number>(0);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [selected, setSelected] = useState<ProdutoModel | undefined>();
    const [isVisibleTpProuto, setIsVisibleTpProduto] = useState<boolean>(false);
    const [products, setProducts] = useState<ComprasModel[]>([]);

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

    useEffect(() => {
        if (selected) {
            setProducts(selected?.mpFabricado)
        }
    }, [selected])
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
            setFieldValue('vlPagoProduto', `R$ ${somaFormat}`);
        }
    }, [comprasDataTable, values.mpFabricado, isVisibleTpProuto, selected?.mpFabricado]);


    useEffect(() => {
        if (values.tpProduto === SituacaoProduto.FABRICADO) return setIsVisibleTpProduto(true)
        return setIsVisibleTpProduto(false)
    }, [values.tpProduto])

    const filterTpProduto = comprasDataTable.filter(item => item.tpProduto === SituacaoProduto.COMPRADO)
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
            {isVisibleTpProuto &&
                <ContainerFlutuante >
                    <div>
                        <Title style={{ margin: '0 0 8px 0' }}>Matéria-Prima</Title>
                        <Paragrafo>Informe a matéria-prima e a quantidade utilizada no produto a ser cadastrado</Paragrafo>
                    </div>
                    <div>
                        <Stack spacing={3} sx={{ width: 500 }}>
                            <Autocomplete
                                multiple
                                id="tags-standard"
                                options={filterTpProduto}
                                getOptionLabel={(item) => item.nmProduto}
                                onChange={(e, value) => {
                                    setFieldValue('mpFabricado',
                                        value.map((mp) => ({
                                            nmProduto: mp.nmProduto,
                                        }))
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        label="Selecione MP necessaria para fabricar"
                                        placeholder="matéria-prima"
                                    />
                                )}
                            />
                        </Stack>
                        {touched.mpFabricado && errors.mpFabricado && (
                            //@ts-ignore
                            <div style={{ color: 'red' }}>{errors.mpFabricado}</div>
                        )}
                    </div>
                    <ContianerMP>
                        {values.mpFabricado &&
                            values.mpFabricado.map(mp => (
                                <>
                                    <ul>
                                        <DivLineMP>
                                            <div style={{ width: '18rem' }}>
                                                <li>{mp.nmProduto}</li>
                                            </div>
                                            <div>
                                                <Input
                                                    error=""
                                                    label="quantidade"
                                                    name={mp.nmProduto}
                                                    onChange={(e) => {
                                                        const newMpFabricado = [...values.mpFabricado];
                                                        const index = newMpFabricado.findIndex((item) => item.nmProduto === mp.nmProduto);
                                                        newMpFabricado[index].quantidade = e.target.value.replace(',', '.');
                                                        setFieldValue("mpFabricado", newMpFabricado);
                                                    }}
                                                    value={mp.quantidade}
                                                    style={{ fontSize: '1rem' }}
                                                    styleLabel={{ marginTop: '-20px' }}
                                                    styleDiv={{ margin: '0', padding: 0 }}
                                                />
                                            </div>
                                        </DivLineMP>
                                    </ul>
                                </>
                            ))}
                    </ContianerMP>
                    <div style={{ height: '60px' }}>
                        <ButtonStyled
                            onClick={() => setIsVisibleTpProduto(false)}>
                            <span className="text">Concluído</span>
                            <span className="icon">
                                <svg aria-hidden="true" width="20px" data-icon="paper-plane" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                    <path fill="currentColor" d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z">
                                    </path>
                                </svg>
                            </span>
                        </ButtonStyled>
                    </div>
                </ContainerFlutuante>
            }
            {/* Editar o cliente */}
            <IsEdit
                isCliente={false}
                setSelected={setSelected}
                data={selected}
                handleEditRow={handleEditRow}
                inputsConfig={inputsConfig}
                isEdit={isEdit}
                products={selected ? selected.mpFabricado : []}
            />
            <ContainerButton>
                <Button
                    children='Cadastrar Produto'
                    type="button"
                    onClick={handleSubmit}
                    fontSize={20}
                    style={{ margin: '1rem 4rem 2rem 95%', height: '4rem', width: '12rem' }}
                />

                <FormAlert submitForm={submitForm} name={'Produto'} />
            </ContainerButton>
            {/*Tabala */}
            <div style={{ margin: '-3.5rem 0px -40px 3rem' }}>
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