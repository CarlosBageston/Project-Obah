import * as Yup from 'yup';
import { useFormik } from "formik";
import { DivIcon } from "../../style";
import { IoMdClose } from "react-icons/io";
import { db } from "../../../../../firebase";
import GetData from "../../../../../firebase/getData";
import Button from "../../../../../Components/button";
import { useDispatch, useSelector } from "react-redux";
import { TableKey } from "../../../../../types/tableName";
import { Autocomplete, Stack, TextField } from "@mui/material";
import { TitleDefault } from "../../../cadastroClientes/style";
import TableBillModel from "../../model/tableBill";
import VendaModel, { ProdutoEscaniado } from "../../model/vendas";
import useFormatCurrency from "../../../../../hooks/formatCurrency";
import ProdutosModel from "../../../cadastroProdutos/model/produtos";
import { BoxClose, DivClose, StyledAiOutlineClose, StyledMdDone } from "../../../../../Components/isEdit/style";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { State, setLoading } from "../../../../../store/reducer/reducer";
import useHandleInputKeyPress from "../../../../../hooks/useHandleInputKeyPress";
import {
    ContainerComanda,
    BoxAddProduct,
    BoxList,
    ContainerTitle,
    Title,
    BoxProduct,
    DivLi,
    TextTotal,
    BoxButton,
    BoxNameProduct,
    LiValor
} from "./styleTableBill";
import FormAlert from '../../../../../Components/FormAlert/formAlert';
import AlertDialog from '../../../../../Components/FormAlert/dialogForm';

interface TableBillProps {
    nameTable: string;
    dataTableProduto: ProdutosModel[];
    produtoEscaniadoList: ProdutoEscaniado[];
    setShowTable: Dispatch<SetStateAction<boolean>>;
    setFecharComanda: Dispatch<SetStateAction<VendaModel>>;
    setShowTableManegement: Dispatch<React.SetStateAction<boolean>>;
}
export function TableBill({ dataTableProduto, nameTable, setShowTable, setFecharComanda, setShowTableManegement, produtoEscaniadoList }: TableBillProps) {
    const [key, setKey] = useState<number>(0);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [openDialogVendas, setOpenDialogVendas] = useState<boolean>(false);
    const [produtoEscaniado, setProdutoEscaniado] = useState<ProdutoEscaniado>();
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const dispatch = useDispatch();
    const { inputRefF1 } = useHandleInputKeyPress();
    const { loading } = useSelector((state: State) => state.user);
    const { NumberFormatForBrazilianCurrency } = useFormatCurrency();

    const initialValues: TableBillModel = ({
        vlTotal: 0,
        produtoEscaniado: [],
        nmTable: nameTable,
        quantidade: 0
    });
    const listProduct = dataTableProduto.filter(produto => produto.stMateriaPrima === false || produto.stMateriaPrima === undefined);
    const {
        dataTable: dataTableComanda,
    } = GetData(TableKey.Comanda, true) as { dataTable: TableBillModel[] };

    const { values, handleSubmit, setFieldValue, touched, errors, resetForm } = useFormik<TableBillModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            quantidade: Yup.string().required("Campo Obrigatório").test('vlRecebido', 'Valor Invalido', (value) => {
                const numericValue = value.replace(/[^\d]/g, '');
                return parseFloat(numericValue) > 0;
            })
        }),
        onSubmit: handleSubmitForm,
    });
    function handleAutoComplete(e: React.SyntheticEvent<Element, Event>, value: ProdutosModel | null) {
        if (value) {
            const novoProduto: ProdutoEscaniado = {
                nmProduto: value.nmProduto,
                cdProduto: value.cdProduto,
                tpProduto: value.tpProduto,
                vlVendaProduto: value.vlVendaProduto,
                vlTotalMult: 0,
                quantidadeVenda: 0,
                vlLucro: value.vlVendaProduto - value.vlUnitario
            };
            setProdutoEscaniado(novoProduto)
        }
    }
    function handleSubmitForm(values: TableBillModel) {
        if (produtoEscaniado && values.quantidade) {
            const quantidade = values.quantidade
            const updatedValues = { ...values };
            const updatedProduct: ProdutoEscaniado = {
                ...produtoEscaniado,
                quantidadeVenda: quantidade,
                vlTotalMult: quantidade * produtoEscaniado.vlVendaProduto,
                vlLucro: quantidade * (produtoEscaniado.vlLucro ?? 0)
            };
            updatedValues.produtoEscaniado.push(updatedProduct);
            resetForm();
            setFieldValue('produtoEscaniado', [...updatedValues.produtoEscaniado]);
            setFieldValue('id', updatedValues.id);
            setKey(Math.random())
        }
    }

    function keyPressHandleSubmitForm(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter') handleSubmit()
    }
    useEffect(() => {
        setFieldValue('vlTotal', values.produtoEscaniado.reduce((acc, value) => {
            return acc + (value.vlTotalMult ?? 0);
        }, 0))
    }, [values.produtoEscaniado])
    /**
     * Função para remover um produto do array 'produtoEscaniado'.
     * 
     * @param index - Índice do produto a ser removido.
     */
    function removedProdutoEscaneado(index: number) {
        const remove = values.produtoEscaniado.filter((product, i) => i !== index)
        setFieldValue('produtoEscaniado', remove);
    }
    /**
     * Função para enviar os valores para o banco de dados.
     */
    async function handleSubmitFormComanda(values: TableBillModel) {
        dispatch(setLoading(true))
        delete values.quantidade
        if (values.id) {
            const refID: string = values.id ?? '';
            const refTable = doc(db, TableKey.Comanda, refID);
            await updateDoc(refTable, { ...values })
                .then(() => {
                    dispatch(setLoading(false))
                    setShowTable(false)
                }).catch(() => {
                    dispatch(setLoading(false))
                    setSubmitForm(false);
                    setTimeout(() => { setSubmitForm(undefined) }, 3000)
                });
        } else {
            await addDoc(collection(db, TableKey.Comanda), {
                ...values
            }).then(() => {
                dispatch(setLoading(false))
                setShowTable(false)
            }).catch(() => {
                dispatch(setLoading(false))
                setSubmitForm(false);
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            });
        }
    }
    /**
     * Função para enviar os valores para o banco de dados.
     */
    async function closeTableBill(values: TableBillModel) {
        if (produtoEscaniadoList.length > 0) return setOpenDialogVendas(true)
        const objetoVenda: VendaModel = {
            vlTotal: 0,
            dtProduto: null,
            vlRecebido: 0,
            vlTroco: 0,
            produtoEscaniado: values.produtoEscaniado,
            vlLucroTotal: 0
        }
        setFecharComanda(objetoVenda)
        const foundComanda = dataTableComanda.find(comanda => comanda.id === values.id)
        if (foundComanda && foundComanda.id) {
            await deleteDoc(doc(db, TableKey.Comanda, foundComanda.id))
        }
        setShowTable(false)
        setShowTableManegement(false)
    }
    useEffect(() => {
        if (dataTableComanda.length) {
            const foundTable = dataTableComanda.find(table => table.nmTable === nameTable)
            if (foundTable) {
                setFieldValue('id', foundTable.id)
                setFieldValue('produtoEscaniado', [...foundTable.produtoEscaniado])
            }
        }
    }, [dataTableComanda])
    return (
        <>
            <ContainerComanda>
                <BoxClose>
                    <DivClose
                        onClick={() => { setShowTable(false) }}
                    >
                        <StyledAiOutlineClose />
                    </DivClose>
                </BoxClose>
                <TitleDefault style={{ margin: 0 }}>{nameTable}</TitleDefault>
                <BoxAddProduct>
                    <Stack spacing={3} sx={{ width: 250 }}>
                        <Autocomplete
                            ref={inputRefF1}
                            key={`select-${key}`}
                            id="tags-standard"
                            options={listProduct}
                            getOptionLabel={(item: ProdutosModel) => item.nmProduto}
                            onChange={handleAutoComplete}
                            onKeyDown={keyPressHandleSubmitForm}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label={'Selecione os produtos'}
                                />
                            )}
                        />
                    </Stack>
                    <TextField
                        value={values.quantidade !== 0 ? values.quantidade : ''}
                        onChange={(e) => { setFieldValue('quantidade', (parseFloat(e.target.value))) }}
                        label="Qntde"
                        onKeyDown={keyPressHandleSubmitForm}
                        error={Boolean(touched.quantidade && errors.quantidade)}
                        InputProps={{
                            style: { width: '5rem' }
                        }}
                    />
                    <div onClick={() => handleSubmit()}>
                        <StyledMdDone />
                    </div>
                </BoxAddProduct>
                <BoxList>
                    <ContainerTitle>
                        <Title>Descrição</Title>
                        <Title>Quantidade</Title>
                        <Title>Valor</Title>
                    </ContainerTitle>
                    <BoxProduct>
                        {values.produtoEscaniado.map((prod, index) => (
                            <>
                                <ul>
                                    <DivLi>
                                        <BoxNameProduct>
                                            <DivIcon onClick={() => removedProdutoEscaneado(index)}>
                                                <IoMdClose color={'red'} />
                                            </DivIcon>
                                            <li style={{ width: '11rem' }}>{prod.nmProduto}</li>
                                        </BoxNameProduct>
                                        <li style={{ marginLeft: '-6rem' }}>{prod.quantidadeVenda}</li>
                                        <LiValor>{NumberFormatForBrazilianCurrency(prod.vlTotalMult ?? 0)}</LiValor>
                                    </DivLi>
                                </ul>
                            </>
                        ))}
                    </BoxProduct>
                </BoxList>
                <div>
                    <TextTotal><b>Total:</b> {NumberFormatForBrazilianCurrency(values.vlTotal)}</TextTotal>
                </div>
                <AlertDialog
                    open={openDialog}
                    messege={
                        <p>
                            Ao clicar em <b>&quot;Continuar&quot;</b>, você estará finalizando esta comanda. Não será possível acessá-la novamente. Deseja continuar?
                        </p>
                    }
                    labelButtonOk='Continuar'
                    labelButtonCencel='Cancelar'
                    onCancelClick={() => setOpenDialog(false)}
                    title='Finalizar Comanda'
                    onOKClick={() => { closeTableBill(values) }}
                />
                <AlertDialog
                    open={openDialogVendas}
                    messege={
                        <p>
                            Há uma venda em aberto. Você será direcionado para finalizá-la antes de retornar para fechar a comanda.
                        </p>
                    }
                    labelButtonOk='Ok'
                    title='Não é Possivel Finalizar Comanda'
                    onOKClick={() => { setShowTable(false); setShowTableManegement(false) }}
                />
                <BoxButton>
                    <Button
                        label='Adicionar itens a Comanda'
                        type="button"
                        onClick={() => handleSubmitFormComanda(values)}
                        style={{ height: 40, width: 310 }}
                        disabled={loading}
                    />
                    <FormAlert
                        name="Comanda"
                        styleLoadingMarginTop='0.5rem'
                        styleLoadingMarginLeft='0rem'
                        submitForm={submitForm}
                    />
                    <Button
                        label='Fechar Comanda'
                        type="button"
                        onClick={() => { setOpenDialog(true) }}
                        style={{ height: 40, width: 310 }}
                        disabled={loading || !values.produtoEscaniado.length}

                    />
                </BoxButton>
            </ContainerComanda>
        </>
    )
}