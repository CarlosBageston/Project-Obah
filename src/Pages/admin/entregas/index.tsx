import * as Yup from 'yup';
import { useFormik } from 'formik';
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import { EntregaModel } from "./model/entrega";
import GetData from "../../../firebase/getData";
import Button from "../../../Components/button";
import { AiTwotonePrinter } from 'react-icons/ai';
import GenericTable from "../../../Components/table";
import FiltroGeneric from "../../../Components/filtro";
import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useRef } from "react";
import { NotaFiscal } from '../../../Components/notaFiscal';
import ClienteModel from "../cadastroClientes/model/cliente";
import formatDate from "../../../Components/masks/formatDate";
import ProdutosModel from '../cadastroProdutos/model/produtos';
import FormAlert from "../../../Components/FormAlert/formAlert";
import { State, setLoading } from '../../../store/reducer/reducer';
import ModalDelete from '../../../Components/FormAlert/modalDelete';
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { Autocomplete, AutocompleteChangeReason, TextField } from "@mui/material";

import {
    Box,
    Title,
    DivColumn,
    BoxLabels,
    DivInputs,
    TextTable,
    QntProduto,
    DivProduto,
    DivButtons,
    NameProduto,
    LabelsHeader,
    ContainerAll,
    ValueProduto,
    ResultProduto,
    DivColumnPrice,
    DivButtonAndTable,
    DivColumnQntTotal,
    ContainerTableCliente,
    DivFlutuante,
    DivColumnTotal,
} from './style'
import { BoxTitleDefault } from "../estoque/style";

//hooks
import useEstoque from '../../../hooks/useEstoque';
import useFormatCurrency from '../../../hooks/formatCurrency';


const objClean: EntregaModel = {
    vlLucro: 0,
    vlEntrega: 0,
    dtEntrega: '',
    quantidades: [],
}

function Entregas() {
    const [key, setKey] = useState<number>(0);
    const [selected, setSelected] = useState<EntregaModel>();
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const [shouldShow, setShouldShow] = useState<boolean>(false);
    const [scrollActive, setScrollActive] = useState<boolean>(false);
    const [clienteCurrent, setClienteCurrent] = useState<ClienteModel>();
    const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);

    const dispatch = useDispatch();
    const { loading } = useSelector((state: State) => state.user);
    const { NumberFormatForBrazilianCurrency, convertToNumber } = useFormatCurrency();
    const { removedStockEntrega } = useEstoque();

    const initialValues: EntregaModel = ({ ...objClean });
    const ref = useRef<HTMLDivElement>(null);

    //realizando busca no banco de dados
    const {
        dataTable: dataTableCliente,
    } = GetData('Clientes', recarregue) as { dataTable: ClienteModel[] };
    const {
        dataTable: dataTableEntregas,
        setDataTable: setDataTableEntregas,
        loading: isLoading
    } = GetData('Entregas', recarregue) as { dataTable: EntregaModel[], setDataTable: (data: EntregaModel[]) => void, loading: boolean };

    const {
        dataTable: produtoDataTable,
    } = GetData('Produtos', recarregue) as { dataTable: ProdutosModel[] };

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
        setOpenDelete(false)
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
        setFieldValue('vlLucro', 0)
        setFieldValue('vlEntrega', 0)
        setFieldValue('dtEntrega', '')
        setFieldValue('quantidades', [])
        setFieldValue('cliente.nmCliente', '')
        setQuantidades({})
        setKey(Math.random());
    }

    //enviando formulario
    async function hundleSubmitForm() {
        dispatch(setLoading(true))
        const valuesUpdate = { ...values, quantidades: quantidades };
        removedStockEntrega(clienteCurrent, quantidades)
        valuesUpdate.vlEntrega = convertToNumber(valuesUpdate.vlEntrega.toString())
        valuesUpdate.vlLucro = convertToNumber(valuesUpdate.vlLucro.toString())
        await addDoc(collection(db, "Entregas"), {
            ...valuesUpdate
        })
            .then(() => {
                dispatch(setLoading(false))
                setSubmitForm(true)
                setDataTableEntregas([...dataTableEntregas, values])
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            })
            .catch(() => {
                dispatch(setLoading(false))
                setSubmitForm(false)
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            });
        resetForm()
        cleanState()
    }

    //manupulando evento de onchange do Select
    function handleClienteChange(event: React.SyntheticEvent<Element, Event>, value: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            cleanState()
        } else {
            cleanState()
            const clienteSelecionado = value;
            clienteSelecionado.produtos.forEach((prodClient: ProdutosModel) => {
                const foundProduct = produtoDataTable.find(prod => prod.nmProduto.toLowerCase().trim() === prodClient.nmProduto.toLowerCase().trim())
                if (foundProduct) {
                    prodClient.vlUnitario = foundProduct.vlUnitario
                }
            })
            setClienteCurrent(clienteSelecionado)
            setFieldValue('cliente.nmCliente', clienteSelecionado.nmCliente)
        }
    }

    //fazendo a soma dos lucros e do valor total
    useEffect(() => {
        if (!clienteCurrent) return;
        //calculando o Total da entrega
        const result = clienteCurrent.produtos.map((produto) => {
            const quantidade = quantidades[produto.nmProduto] ?? 0;
            const valor = produto.vlVendaProduto;
            const total = quantidade * valor;
            produto.valorItem = total;
            return total;
        })
        //calculando o lucro
        const resultLucro = clienteCurrent.produtos.map((produto) => {
            const quantidade = quantidades[produto.nmProduto] ?? 0;
            const valorPago = produto.vlUnitario;
            const valorVenda = produto.vlVendaProduto;
            const totalLucro = valorVenda - valorPago;
            const total = totalLucro * quantidade;
            return total;
        })

        //somando todos os valores de total da entrega
        const sum = result.reduce((total, number) => total + number, 0);

        //somando todos os valores de lucro
        const sumLucro = resultLucro.reduce((total, number) => total + number, 0);

        // Formatar total da entrega
        if (sum === 0 && sumLucro === 0) return
        setFieldValue('vlEntrega', NumberFormatForBrazilianCurrency(sum));

        // Formatar lucro
        setFieldValue('vlLucro', NumberFormatForBrazilianCurrency(sumLucro));
    }, [quantidades]);

    useEffect(() => {
        if (ref.current?.scrollHeight) {
            const hasScrollbar = ref.current?.scrollHeight > ref.current?.clientHeight;
            setScrollActive(hasScrollbar)
        }
    }, [values.cliente]);
    return (
        <Box>
            <Title>Cadastro de Novas Entregas</Title>
            <ContainerAll>
                <DivInputs>
                    <div>
                        <Autocomplete
                            id="tags-standard"
                            options={dataTableCliente}
                            getOptionLabel={(item: any) => item.nmCliente}
                            onChange={handleClienteChange}
                            style={{ borderBottom: '1px solid #6e6dc0', color: 'black', backgroundImage: 'linear-gradient(to top, #b2beed1a, #b2beed1a, #b2beed1a, #b2beed12, #ffffff)' }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label="Cliente"
                                    placeholder="Selecione..."
                                    InputLabelProps={{
                                        style: { fontSize: '1.3rem', fontWeight: '500', color: '#4d68b7' }
                                    }}
                                />
                            )}
                        />
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
                    </div>
                    <div>
                        <Input
                            key={`vlEntrega-${key}`}
                            label="Valor Total"
                            name="vlEntrega"
                            onBlur={handleBlur}
                            value={values.vlEntrega !== 0 ? values.vlEntrega : ''}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.vlEntrega && errors.vlEntrega ? errors.vlEntrega : ''}
                            style={{ color: '#333333d3', opacity: 1, borderBottom: '2px solid #c7c6f3', backgroundColor: '#e0e0e04f' }}
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
                            value={values.vlLucro !== 0 ? values.vlLucro : ''}
                            raisedLabel={values.vlLucro ? true : false}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.vlLucro && errors.vlLucro ? errors.vlLucro : ''}
                            styleDiv={{ marginTop: 8 }}
                            style={{ color: '#333333d3', opacity: 1, borderBottom: '2px solid #c7c6f3', backgroundColor: '#e0e0e04f' }}
                        />
                    </div>
                </DivInputs>
                <DivButtonAndTable>
                    <BoxLabels isVisible={values.cliente?.nmCliente ? false : true}>
                        <DivFlutuante />
                        <DivColumn scrollActive={scrollActive}>
                            <LabelsHeader>Descrição</LabelsHeader>
                        </DivColumn>
                        <DivFlutuante />
                        <DivColumnPrice scrollActive={scrollActive}>
                            <LabelsHeader>Preço</LabelsHeader>
                        </DivColumnPrice>
                        <DivFlutuante />
                        <DivColumnQntTotal scrollActive={scrollActive}>
                            <LabelsHeader>Quantidade</LabelsHeader>
                        </DivColumnQntTotal>
                        <DivFlutuante />
                        <DivColumnTotal scrollActive={scrollActive}>
                            <LabelsHeader>Total</LabelsHeader>
                        </DivColumnTotal>
                        <DivFlutuante style={{ marginLeft: '-2px' }} />
                    </BoxLabels>
                    <ContainerTableCliente isVisible={values.cliente?.nmCliente ? false : true} ref={ref}>
                        {clienteCurrent && clienteCurrent.produtos.map((produto) => (
                            <>
                                <DivProduto key={produto.nmProduto}>
                                    <NameProduto>
                                        <TextTable>{produto.nmProduto}</TextTable>
                                    </NameProduto>
                                    <ValueProduto>
                                        <TextTable>{NumberFormatForBrazilianCurrency(produto.vlVendaProduto)}</TextTable>
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
                                            style={{ marginTop: 14, height: '2rem' }}
                                            styleLabel={{ fontSize: '1rem', top: 14 }}
                                        />
                                    </QntProduto>
                                    <ResultProduto>
                                        <TextTable>R$ {produto.valorItem?.toFixed(2).replace('.', ',')}</TextTable>
                                    </ResultProduto>
                                </DivProduto>
                            </>
                        ))}
                    </ContainerTableCliente>
                    {shouldShow &&
                        <NotaFiscal
                            quantidades={quantidades}
                            values={values}
                            clienteCurrent={clienteCurrent as ClienteModel}
                            setShouldShow={setShouldShow}
                            handleSubmit={handleSubmit}
                        />}
                    <DivButtons>
                        <Button
                            label={<AiTwotonePrinter size={30} />}
                            type='button'
                            style={{ margin: '0rem 0px 2rem 0px', height: '4rem', width: '5rem' }}
                            disabled={values.dtEntrega.length < 10}
                            onClick={() => setShouldShow(true)}
                        />
                        <Button
                            label='Cadastrar Entrega'
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{ margin: '2rem 0px 4rem 0px', height: '4rem', width: '12rem' }}
                        />
                    </DivButtons>
                </DivButtonAndTable>
            </ContainerAll>
            <ModalDelete open={openDelete} onDeleteClick={handleDeleteRow} onCancelClick={() => setOpenDelete(false)} />
            <FormAlert submitForm={submitForm} name={'Entregas'} styleLoadingMarginTop='-12rem' />
            {/*Tabala */}
            <BoxTitleDefault>
                <div>
                    <FiltroGeneric data={dataTableEntregas} setFilteredData={setDataTableEntregas} carregarDados={setRecarregue} type="cliente" />
                </div>
            </BoxTitleDefault>
            <GenericTable
                columns={[
                    { label: 'Nome', name: 'cliente.nmCliente' },
                    { label: 'Data Entrega', name: 'dtEntrega' },
                    { label: 'Valor Total', name: 'vlEntrega', isCurrency: true },
                    { label: 'Lucro', name: 'vlLucro', isCurrency: true },
                ]}
                data={dataTableEntregas}
                isLoading={isLoading}
                onSelectedRow={setSelected}
                isVisibleEdit
                onDelete={() => setOpenDelete(true)}
                isdisabled={selected ? false : true}
            />
        </Box>
    );
}

export default Entregas;