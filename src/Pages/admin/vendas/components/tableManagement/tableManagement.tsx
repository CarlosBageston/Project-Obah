import * as Yup from 'yup';
import Button from "../../../../../Components/button";
import { BoxButton, BoxButtonIcon, BoxTable, BoxTableEmpty, BoxTableHeader, ContainerFlutuante, ContainerFlutuanteNewTable } from "./styleTableManagement";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { TableBill } from "../tableBill/tableBill";
import ProdutosModel from "../../../cadastroProdutos/model/produtos";
import VendaModel, { ProdutoEscaniado } from "../../model/vendas";
import ButtonAdd from "../../../../../Components/button/buttonAdd/buttonAdd";
import TableManagemenModel from "../../model/tableManagemen";
import { TableKey } from "../../../../../types/tableName";
import GetData from "../../../../../firebase/getData";
import { TextField } from "@mui/material";
import { Timestamp, addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../../firebase";
import { useDispatch, useSelector } from "react-redux";
import { State, setLoading } from "../../../../../store/reducer/reducer";
import FormAlert from "../../../../../Components/FormAlert/formAlert";
import { useFormik } from "formik";
import { BsTrash } from "react-icons/bs";
import ModalDelete from '../../../../../Components/FormAlert/modalDelete';
import iconTable from '../../../../../assets/Icon/iconTable.png'

interface TableManagementProps {
    dataTableProduto: ProdutosModel[]
    setFecharComanda: Dispatch<SetStateAction<VendaModel>>
    setShowTableManegement: Dispatch<React.SetStateAction<boolean>>
    produtoEscaniadoList: ProdutoEscaniado[];
}

export function TableManagement({ dataTableProduto, setFecharComanda, setShowTableManegement, produtoEscaniadoList }: TableManagementProps) {
    const [showTable, setShowTable] = useState<boolean>(false);
    const [recarregar, setRecarregar] = useState<boolean>(true);
    const [showNewTable, setShowNewTable] = useState<boolean>(false);
    const [showModalDelete, setShowModalDelete] = useState<string | undefined>(undefined);
    const [dataTableOrder, setDataTableOrder] = useState<TableManagemenModel[]>([]);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const dispatch = useDispatch();
    const { loading } = useSelector((state: State) => state.user);

    const initialValues: TableManagemenModel = ({
        nmTable: '',
        createdAt: Timestamp.now()
    });

    const {
        dataTable,
    } = GetData(TableKey.Mesas, recarregar) as { dataTable: TableManagemenModel[] };

    const { setFieldValue, values, handleSubmit, touched, errors, resetForm } = useFormik<TableManagemenModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmTable: Yup.string().required("Campo Obrigatório").test("MesaExistente", "Essa Mesa Já Existe", (value) => {
                return !dataTable.some(data => data.nmTable === value)
            })
        }),
        onSubmit: handleSubmitForm,
    });

    function handleTable(nameTable: string, id: string | undefined) {
        setFieldValue('id', id);
        setFieldValue('nmTable', nameTable);
        setShowTable(!showTable);
    }

    /**
     * Função para enviar os valores para o banco de dados.
     */
    async function handleSubmitForm(values: TableManagemenModel) {
        setRecarregar(false);
        dispatch(setLoading(true));
        await addDoc(collection(db, TableKey.Mesas), {
            ...values,
            createdAt: Timestamp.now()
        }).then(() => {
            dispatch(setLoading(false))
            setShowNewTable(false)
        }).catch(() => {
            dispatch(setLoading(false))
            setSubmitForm(false);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        });
        resetForm();
        setFieldValue('id', '');
        setFieldValue('nmTable', '');
        setRecarregar(true);
    }

    async function handleDeleteItem(id: string | undefined) {
        setRecarregar(false);
        setShowModalDelete(undefined);
        await deleteDoc(doc(db, TableKey.Mesas, id ?? '')).then(() => {
            dispatch(setLoading(false))
        }).catch(() => {
            dispatch(setLoading(false))
            setSubmitForm(false);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        });
        setRecarregar(true);
    }
    useEffect(() => {
        const sortedData = [...dataTable].sort((a, b) => {
            const dateA = a.createdAt.toDate();
            const dateB = b.createdAt.toDate();
            return dateA.getTime() - dateB.getTime();
        });
        setDataTableOrder(sortedData);
    }, [dataTable]);

    function keyPressHandleSubmitForm(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Enter') return handleSubmit();
    }
    return (
        <>
            <ContainerFlutuante>
                <BoxTableHeader>
                    <div>
                        <ButtonAdd label="Adicionar Novas Mesas" onClick={() => { setShowNewTable(!showNewTable); }} />
                    </div>
                    <div>
                        <h1>Gestão Das Mesas</h1>
                    </div>
                </BoxTableHeader>
                {showNewTable ?
                    <ContainerFlutuanteNewTable>
                        <h2>Adicionar mesa</h2>
                        <TextField
                            value={values.nmTable}
                            error={Boolean(touched.nmTable && errors.nmTable)}
                            onChange={(e) => { setFieldValue('nmTable', e.target.value) }}
                            label="Nome/Numero Da Mesa"
                            helperText={touched.nmTable && errors.nmTable}
                            onKeyDown={e => { keyPressHandleSubmitForm(e) }}
                        />
                        <FormAlert
                            name="Mesa"
                            styleLoadingMarginTop='0.5rem'
                            styleLoadingMarginLeft='0rem'
                            submitForm={submitForm}
                        />
                        <ButtonAdd label="Adicionar" onClick={() => handleSubmit()} disabled={loading} />
                    </ContainerFlutuanteNewTable>
                    : null}
                <BoxTable empty={!dataTable.length}>
                    {dataTableOrder.length ? dataTableOrder.map((data) => (
                        <BoxButton key={data.id}>
                            <div>
                                <Button
                                    label={data.nmTable}
                                    type="button"
                                    onClick={() => handleTable(data.nmTable, data.id)}
                                    style={{ height: 40, width: 150 }}
                                />
                            </div>
                            <BoxButtonIcon onClick={() => { setShowModalDelete(data.id) }}>
                                <BsTrash color='red' size={22} />
                            </BoxButtonIcon>
                            <ModalDelete
                                open={showModalDelete !== undefined}
                                onCancelClick={() => setShowModalDelete(undefined)}
                                onDeleteClick={() => handleDeleteItem(showModalDelete)}
                            />
                        </BoxButton>
                    ))
                        :
                        <BoxTableEmpty>
                            <img src={iconTable} alt="" width={150} />
                            <p>Nenhuma Mesa Cadastrada :/</p>
                        </BoxTableEmpty>
                    }
                </BoxTable>
                {showTable ?
                    <TableBill
                        dataTableProduto={dataTableProduto}
                        nameTable={values.nmTable}
                        setShowTable={setShowTable}
                        setFecharComanda={setFecharComanda}
                        setShowTableManegement={setShowTableManegement}
                        produtoEscaniadoList={produtoEscaniadoList}
                    />
                    :
                    null
                }
            </ContainerFlutuante>
        </>
    )
}