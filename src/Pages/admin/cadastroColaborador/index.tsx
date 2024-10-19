import * as Yup from 'yup';
import { useFormik } from "formik";
import { useState } from "react";
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import ColaboradorModel from "./model/colaborador";
import { TableKey } from '../../../types/tableName';
import { ContainerInputs, DivInput } from "./style";
import { useDispatch } from 'react-redux';
import FormAlert from "../../../Components/FormAlert/formAlert";
import formatPhone from "../../../Components/masks/maskTelefone";
import { setLoading } from '../../../store/reducer/reducer';
import { Box, ContainerButton, TitleDefault } from "../cadastroClientes/style";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import GenericTable from '../../../Components/table';
import _ from 'lodash';

function CadastroColaborador() {
    const [key, setKey] = useState<number>(0);
    const [editData, setEditData] = useState<ColaboradorModel>();
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);

    const dispatch = useDispatch();

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ColaboradorModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues: {
            nmColaborador: '',
            tfColaborador: '',
            ruaColaborador: '',
            nrCasaColaborador: '',
            bairroColaborador: '',
            cidadeColaborador: '',
            idCartaoPonto: undefined,
            vlHora: undefined
        },
        validationSchema: Yup.object().shape({
            nmColaborador: Yup.string().required('Campo obrigatório'),
            tfColaborador: Yup.string().required('Campo obrigatório'),
            ruaColaborador: Yup.string().required('Campo obrigatório'),
            nrCasaColaborador: Yup.string().required('Campo obrigatório'),
            bairroColaborador: Yup.string().required('Campo obrigatório'),
            cidadeColaborador: Yup.string().required('Campo obrigatório'),
            idCartaoPonto: Yup.string().required('Campo obrigatório')
        }),
        onSubmit: editData ? handleEditRow : hundleSubmitForm,
    });

    async function handleEditRow() {
        const refID: string = values.id ?? '';
        const refTable = doc(db, TableKey.Colaborador, refID);
        if (!_.isEqual(values, editData)) {
            await updateDoc(refTable, { ...values })
                .then(() => {
                    setEditData(values);
                });
        }
        resetForm()
        setKey(Math.random());
    }

    async function hundleSubmitForm() {
        dispatch(setLoading(true))
        await addDoc(collection(db, TableKey.Colaborador), {
            ...values
        }).then(() => {
            dispatch(setLoading(false))
            setSubmitForm(true);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
            setEditData(values);
        }).catch(() => {
            dispatch(setLoading(false))
            setSubmitForm(false);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        });
        resetForm()
        setKey(Math.random());
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
                            />
                            <Input
                                key={`cidadeColaborador-${key}`}
                                label='Cidade'
                                name='cidadeColaborador'
                                onBlur={handleBlur}
                                value={formatPhone(values.cidadeColaborador)}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.cidadeColaborador && errors.cidadeColaborador ? errors.cidadeColaborador : ''}
                            />
                            <Input
                                key={`idCartaoPonto-${key}`}
                                label='ID Cartão Ponto'
                                name='idCartaoPonto'
                                onBlur={handleBlur}
                                value={values.idCartaoPonto}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.idCartaoPonto && errors.idCartaoPonto ? errors.idCartaoPonto : ''}
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
                            />
                            <Input
                                key={`ruaColaborador-${key}`}
                                label='Rua'
                                name='ruaColaborador'
                                onBlur={handleBlur}
                                value={values.ruaColaborador}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.ruaColaborador && errors.ruaColaborador ? errors.ruaColaborador : ''}
                            />
                            <Input
                                key={`nrCasaColaborador-${key}`}
                                label='Numero'
                                name='nrCasaColaborador'
                                onBlur={handleBlur}
                                value={values.nrCasaColaborador}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.nrCasaColaborador && errors.nrCasaColaborador ? errors.nrCasaColaborador : ''}
                            />
                            <Input
                                key={`vlHora-${key}`}
                                label='Salário - valor por hora'
                                name='vlHora'
                                onBlur={handleBlur}
                                value={values.vlHora ?? ''}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.vlHora && errors.vlHora ? errors.vlHora : ''}
                            />
                        </DivInput>
                    </ContainerInputs>
                    <FormAlert submitForm={submitForm} name={'Colaborador'} />
                </div>

                <ContainerButton>
                    <Button
                        type={'button'}
                        label={editData ? 'Editar Colaborador' : 'Cadastrar Colaborador'}
                        onClick={handleSubmit}
                        style={{ margin: '1rem 0 3rem 0', height: '4rem', width: '14rem' }}
                    />
                </ContainerButton>

                {/*Tabela */}
                <GenericTable<ColaboradorModel>
                    columns={[
                        { label: 'Nome', name: 'nmColaborador', shouldApplyFilter: true },
                        { label: 'Telefone', name: 'tfColaborador' },
                        { label: 'Cidade', name: 'cidadeColaborador' },
                        { label: 'Bairro', name: 'bairroColaborador' },
                        { label: 'Rua', name: 'ruaColaborador' },
                        { label: 'Numero Casa', name: 'nrCasaColaborador' },
                    ]}
                    onEdit={(row: ColaboradorModel | undefined) => {
                        if (!row) return;
                        setEditData(row);
                        setFieldValue('nmColaborador', row.nmColaborador);
                        setFieldValue('tfColaborador', row.tfColaborador);
                        setFieldValue('ruaColaborador', row.ruaColaborador);
                        setFieldValue('nrCasaColaborador', row.nrCasaColaborador);
                        setFieldValue('bairroColaborador', row.bairroColaborador);
                        setFieldValue('cidadeColaborador', row.cidadeColaborador);
                        setFieldValue('idCartaoPonto', row.idCartaoPonto);
                        setFieldValue('vlHora', row.vlHora);
                        setFieldValue('id', row.id);
                    }}
                    setEditData={setEditData}
                    collectionName={TableKey.Colaborador}
                    editData={editData}
                />
            </Box>
        </>
    )
}

export default CadastroColaborador;