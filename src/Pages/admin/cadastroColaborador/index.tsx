import * as Yup from 'yup';
import { useFormik } from "formik";
import { lazy, useState } from "react";
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import GetData from "../../../firebase/getData";
import Button from "../../../Components/button";
import ColaboradorModel from "./model/colaborador";
import { BoxTitleDefault } from "../estoque/style";
import { ContainerInputs, DivInput } from "./style";
import GenericTable from "../../../Components/table";
import FiltroGeneric from "../../../Components/filtro";
import { useDispatch, useSelector } from 'react-redux';
import FormAlert from "../../../Components/FormAlert/formAlert";
import formatPhone from "../../../Components/masks/maskTelefone";
import { State, setLoading } from '../../../store/reducer/reducer';
import { Box, ContainerButton, TitleDefault } from "../cadastroClientes/style";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
const IsEdit = lazy(() => import('../../../Components/isEdit/isEdit'));



const objClean: ColaboradorModel = {
    nmColaborador: '',
    tfColaborador: '',
    ruaColaborador: '',
    nrCasaColaborador: '',
    bairroColaborador: '',
    cidadeColaborador: '',
    idCartaoPonto: undefined,
    vlHora: undefined
}
function CadastroColaborador() {

    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [selected, setSelected] = useState<ColaboradorModel>();
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [key, setKey] = useState<number>(0);
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [initialValues, setInitialValues] = useState<ColaboradorModel>({ ...objClean });
    const dispatch = useDispatch();
    const { loading } = useSelector((state: State) => state.user);

    const inputsConfig = [
        { label: 'Nome', propertyName: 'nmColaborador' },
        { label: 'Telefone', propertyName: 'tfColaborador' },
        { label: 'Cidade', propertyName: 'cidadeColaborador' },
        { label: 'Bairro', propertyName: 'bairroColaborador' },
        { label: 'Rua', propertyName: 'ruaColaborador' },
        { label: 'Numero', propertyName: 'nrCasaColaborador' },
        { label: 'ID Cartão Ponto', propertyName: 'idCartaoPonto' },
        { label: 'Salário - valor por hora', propertyName: 'vlHora' }
    ];

    const {
        dataTable,
        loading: isLoading,
        setDataTable
    } = GetData('Colaborador', recarregue) as { dataTable: ColaboradorModel[], loading: boolean, setDataTable: (data: ColaboradorModel[]) => void };

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ColaboradorModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmColaborador: Yup.string().required('Campo obrigatório'),
            tfColaborador: Yup.string().required('Campo obrigatório'),
            ruaColaborador: Yup.string().required('Campo obrigatório'),
            nrCasaColaborador: Yup.string().required('Campo obrigatório'),
            bairroColaborador: Yup.string().required('Campo obrigatório'),
            cidadeColaborador: Yup.string().required('Campo obrigatório'),
            idCartaoPonto: Yup.string().required('Campo obrigatório')
        }),
        onSubmit: hundleSubmitForm,
    });

    function cleanState() {
        setInitialValues({
            nmColaborador: '',
            tfColaborador: '',
            ruaColaborador: '',
            nrCasaColaborador: '',
            bairroColaborador: '',
            cidadeColaborador: '',
            idCartaoPonto: undefined,
            vlHora: undefined
        })
        setKey(Math.random());
    }

    //editar uma linha da tabela e do banco de dados
    async function handleEditRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            const refTable = doc(db, "Colaborador", refID);

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

    //deleta uma linha da tabela e do banco de dados
    async function handleDeleteRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            await deleteDoc(doc(db, "Colaborador", refID)).then(() => {
                const newDataTable = dataTable.filter(row => row.id !== selected.id);
                setDataTable(newDataTable);
            });
        }
        setSelected(undefined)
    }

    //envia informações para o banco
    async function hundleSubmitForm() {
        dispatch(setLoading(true))
        await addDoc(collection(db, "Colaborador"), {
            ...values
        }).then(() => {
            dispatch(setLoading(false))
            setSubmitForm(true);
            setDataTable([...dataTable, values]);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        }).catch(() => {
            dispatch(setLoading(false))
            setSubmitForm(false);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        });
        resetForm()
        cleanState()
    }
    return (
        <>
            <Box>
                <div style={{ position: 'relative' }}>
                    <TitleDefault>Cadastro De Novos Colaborador</TitleDefault>
                    <ContainerInputs>
                        <DivInput>
                            <Input
                                key={`nmColaborador-${key}`}
                                label='Nome'
                                name='nmColaborador'
                                onBlur={handleBlur}
                                value={values.nmColaborador}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.nmColaborador && errors.nmColaborador ? errors.nmColaborador : ''}
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                            <Input
                                key={`tfColaborador-${key}`}
                                maxLength={12}
                                label='Telefone'
                                name='tfColaborador'
                                onBlur={handleBlur}
                                value={formatPhone(values.tfColaborador)}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.tfColaborador && errors.tfColaborador ? errors.tfColaborador : ''}
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                            <Input
                                key={`cidadeColaborador-${key}`}
                                label='Cidade'
                                name='cidadeColaborador'
                                onBlur={handleBlur}
                                value={formatPhone(values.cidadeColaborador)}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.cidadeColaborador && errors.cidadeColaborador ? errors.cidadeColaborador : ''}
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                            <Input
                                key={`idCartaoPonto-${key}`}
                                label='ID Cartão Ponto'
                                name='idCartaoPonto'
                                onBlur={handleBlur}
                                value={values.idCartaoPonto}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.idCartaoPonto && errors.idCartaoPonto ? errors.idCartaoPonto : ''}
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                        </DivInput>
                        <DivInput>
                            <Input
                                key={`bairroColaborador-${key}`}
                                label='Bairro'
                                name='bairroColaborador'
                                onBlur={handleBlur}
                                value={values.bairroColaborador}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.bairroColaborador && errors.bairroColaborador ? errors.bairroColaborador : ''}
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                            <Input
                                key={`ruaColaborador-${key}`}
                                label='Rua'
                                name='ruaColaborador'
                                onBlur={handleBlur}
                                value={values.ruaColaborador}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.ruaColaborador && errors.ruaColaborador ? errors.ruaColaborador : ''}
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                            <Input
                                key={`nrCasaColaborador-${key}`}
                                label='Numero'
                                name='nrCasaColaborador'
                                onBlur={handleBlur}
                                value={values.nrCasaColaborador}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.nrCasaColaborador && errors.nrCasaColaborador ? errors.nrCasaColaborador : ''}
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                            <Input
                                key={`vlHora-${key}`}
                                label='Salário - valor por hora'
                                name='vlHora'
                                onBlur={handleBlur}
                                value={values.vlHora ?? ''}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.vlHora && errors.vlHora ? errors.vlHora : ''}
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                        </DivInput>
                    </ContainerInputs>
                    <FormAlert submitForm={submitForm} name={'Colaborador'} />
                </div>
                <ContainerButton>
                    <Button
                        type={'button'}
                        label={'Cadastrar Colaborador'}
                        disabled={loading}
                        onClick={handleSubmit}
                        style={{ margin: '1rem 0 3rem 0', height: '4rem', width: '14rem' }}
                    />
                </ContainerButton>

                {/* Editar o cliente */}
                <IsEdit
                    editingScreen='Colaborador'
                    setSelected={setSelected}
                    selected={selected}
                    handleEditRow={handleEditRow}
                    inputsConfig={inputsConfig}
                    isEdit={isEdit}
                    products={[]}
                    setIsEdit={setIsEdit}
                />

                {/*Tabela */}
                <BoxTitleDefault>
                    <div>
                        <FiltroGeneric data={dataTable} setFilteredData={setDataTable} carregarDados={setRecarregue} type="cliente" />
                    </div>
                </BoxTitleDefault>
                <GenericTable
                    columns={[
                        { label: 'Nome', name: 'nmColaborador' },
                        { label: 'Telefone', name: 'tfColaborador' },
                        { label: 'Cidade', name: 'cidadeColaborador' },
                        { label: 'Bairro', name: 'bairroColaborador' },
                        { label: 'Rua', name: 'ruaColaborador' },
                        { label: 'Numero Casa', name: 'nrCasaColaborador' },
                    ]}
                    data={dataTable}
                    isLoading={isLoading}
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
                    isdisabled={selected ? false : true}
                />
            </Box>
        </>
    )
}

export default CadastroColaborador;