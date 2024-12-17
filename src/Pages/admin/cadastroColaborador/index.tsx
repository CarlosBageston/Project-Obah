import * as Yup from 'yup';
import { useFormik } from "formik";
import { useState } from "react";
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import ColaboradorModel from "./model/colaborador";
import { useDispatch, useSelector } from 'react-redux';
import formatPhone from "../../../Components/masks/maskTelefone";
import { setMessage } from '../../../store/reducer/reducer';
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import GenericTable from '../../../Components/table';
import _ from 'lodash';
import { RootState } from '../../../store/reducer/store';
import CustomSnackBar, { StateSnackBar } from '../../../Components/snackBar/customsnackbar';
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useTableKeys } from '../../../hooks/tableKey';
import { setLoadingGlobal } from '../../../store/reducer/loadingSlice';
import SituacaoSalarioColaboradorEnum from '../../../enumeration/situacaoColaborador';
import { convertToNumber, formatCurrencyRealTime } from '../../../hooks/formatCurrency';

function CadastroColaborador() {
    const [key, setKey] = useState<number>(0);
    const [editData, setEditData] = useState<ColaboradorModel>();
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const message = useSelector((state: RootState) => state.user.message);
    const tableKeys = useTableKeys();
    const dispatch = useDispatch();
    const loadingGlobal = useSelector((state: RootState) => state.loading.loadingGlobal);

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
            idCartaoPonto: '',
            vlHora: undefined,
            stSalarioColaborador: null
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
        const refTable = doc(db, tableKeys.Colaborador, refID);
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
        dispatch(setLoadingGlobal(true))
        if (!values.vlHora) return;
        const valuesUpdate: ColaboradorModel = {
            ...values,
            vlHora: convertToNumber(values.vlHora.toString())
        };
        await addDoc(collection(db, tableKeys.Colaborador), {
            ...valuesUpdate
        }).then(() => {
            dispatch(setLoadingGlobal(false))
            setEditData(values);
            setOpenSnackBar(prev => ({ ...prev, success: true }))
        }).catch(() => {
            dispatch(setLoadingGlobal(false))
            dispatch(setMessage('Erro ao Cadastrar Colaborador'))
            setOpenSnackBar(prev => ({ ...prev, error: true }))
        });
        resetForm()
        setKey(Math.random());
    }
    return (
        <>
            <Box sx={{ padding: '5rem' }}>
                <Typography variant="h4" gutterBottom>
                    Cadastro De Novos Colaborador
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={3}>
                        <Input
                            key={`nmColaborador-${key}`}
                            label='Nome'
                            name='nmColaborador'
                            onBlur={handleBlur}
                            value={values.nmColaborador}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.nmColaborador && errors.nmColaborador ? errors.nmColaborador : ''}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Input
                            key={`tfColaborador-${key}`}
                            label='Telefone'
                            name='tfColaborador'
                            onBlur={handleBlur}
                            value={formatPhone(values.tfColaborador)}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.tfColaborador && errors.tfColaborador ? errors.tfColaborador : ''}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Input
                            key={`cidadeColaborador-${key}`}
                            label='Cidade'
                            name='cidadeColaborador'
                            onBlur={handleBlur}
                            value={values.cidadeColaborador}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.cidadeColaborador && errors.cidadeColaborador ? errors.cidadeColaborador : ''}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Input
                            key={`bairroColaborador-${key}`}
                            label='Bairro'
                            name='bairroColaborador'
                            onBlur={handleBlur}
                            value={values.bairroColaborador}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.bairroColaborador && errors.bairroColaborador ? errors.bairroColaborador : ''}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Input
                            key={`ruaColaborador-${key}`}
                            label='Logradouro'
                            name='ruaColaborador'
                            onBlur={handleBlur}
                            value={values.ruaColaborador}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.ruaColaborador && errors.ruaColaborador ? errors.ruaColaborador : ''}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <Input
                            key={`nrCasaColaborador-${key}`}
                            label='Numero'
                            name='nrCasaColaborador'
                            onBlur={handleBlur}
                            value={values.nrCasaColaborador}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.nrCasaColaborador && errors.nrCasaColaborador ? errors.nrCasaColaborador : ''}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <FormControl fullWidth variant='standard'>
                            <InputLabel id="contract-type-label">Tipo de Contrato</InputLabel>
                            <Select
                                labelId="contract-type-label"
                                name="stSalarioColaborador"
                                value={values.stSalarioColaborador}
                                onChange={(e) => setFieldValue('stSalarioColaborador', e.target.value)}
                            >
                                <MenuItem value={SituacaoSalarioColaboradorEnum.MES}>Mensal</MenuItem>
                                <MenuItem value={SituacaoSalarioColaboradorEnum.DIARIA}>Por Dia</MenuItem>
                                <MenuItem value={SituacaoSalarioColaboradorEnum.HORA}>Por Hora</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <Input
                            key={`vlHora-${key}`}
                            label={`Salário (
                                ${values.stSalarioColaborador === SituacaoSalarioColaboradorEnum.MES ? 'por mês'
                                    : values.stSalarioColaborador === SituacaoSalarioColaboradorEnum.DIARIA ? 'por dia'
                                        : values.stSalarioColaborador === SituacaoSalarioColaboradorEnum.HORA ? 'por hora'
                                            : 'Selecione um tipo de contrato'}
                                    )`}
                            name="vlHora"
                            onBlur={handleBlur}
                            value={values.vlHora ?? ''}
                            onChange={e => setFieldValue(e.target.name, formatCurrencyRealTime(e.target.value))}
                            error={touched.vlHora && errors.vlHora ? errors.vlHora : ''}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Input
                            key={`idCartaoPonto-${key}`}
                            label='ID Cartão Ponto'
                            name='idCartaoPonto'
                            onBlur={handleBlur}
                            value={values.idCartaoPonto}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.idCartaoPonto && errors.idCartaoPonto ? errors.idCartaoPonto : ''}
                        />
                    </Grid>
                </Grid>

                <Box mt={4} display="flex" justifyContent="flex-end">
                    <Button
                        type={'button'}
                        disabled={loadingGlobal}
                        label={editData ? 'Editar Colaborador' : 'Cadastrar Colaborador'}
                        onClick={handleSubmit}
                        style={{ width: '12rem', height: '4rem' }}
                    />
                </Box>

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
                    collectionName={tableKeys.Colaborador}
                    editData={editData}
                />
                <CustomSnackBar message={message ? message : "Cadastrado Colaborador com sucesso"} open={openSnackBar} setOpen={setOpenSnackBar} />
            </Box >
        </>
    )
}

export default CadastroColaborador;