import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {
    Box,
    Grid,
    Typography,
} from '@mui/material';
import { RootState } from '../../../store/reducer/store';
import CustomSnackBar, { StateSnackBar } from '../../../Components/snackBar/customsnackbar';
import Input from '../../../Components/input';
import { formatCEP, formatCNPJ, formatPhoneNumber } from '../../../utils/formattedString';
import Button from '../../../Components/button';
import { EmpresaRegister } from '../../signup/model/empresa';
import { setMessage } from '../../../store/reducer/reducer';
import { setLoadingGlobal } from '../../../store/reducer/loadingSlice';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebase';
import { updateItem } from '../../../hooks/queryFirebase';
import { useTableKeys } from '../../../hooks/tableKey';
import CryptoJS from 'crypto-js';

function Profile() {
    const message = useSelector((state: RootState) => state.user.message);
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const dispatch = useDispatch();
    const loadingGlobal = useSelector((state: RootState) => state.loading.loadingGlobal);
    const empresa = useSelector((state: RootState) => state.empresaOnline);
    const user = useSelector((state: RootState) => state.user);
    const [key, setKey] = useState<number>(0);
    const [changedPassword, setChangedPassword] = useState<boolean>(false);
    const [initialValues, setInitialValues] = useState<EmpresaRegister>({} as EmpresaRegister);
    const tablekeys = useTableKeys();

    useEffect(() => {
        const empresaLogada: EmpresaRegister = {
            ...empresa,
            email: user.user?.email ?? '',
            confirmPassword: '',
            password: '',
            passwordDashboard: '',
            oldPasswordDashboard: ''
        }
        setInitialValues(empresaLogada);
        setKey(Math.random());
    }, [empresa, user]);

    async function fetchAddress(cep: string) {
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            return response.data;
        } catch (error) {
            dispatch(setMessage('Erro ao Buscar endereço.'));
            setOpenSnackBar(prev => ({ ...prev, error: true }))
            return null;
        }
    }
    async function handleResetPassword() {
        try {
            const userEmail = formik.values.email;

            if (!userEmail) {
                setOpenSnackBar({ error: true, success: false });
                dispatch(setMessage('E-mail não pode estar vazio.'));
                return;
            }

            // Envia o e-mail de redefinição de senha
            await sendPasswordResetEmail(auth, userEmail);

            setOpenSnackBar({ success: true, error: false });
            dispatch(setMessage('verifique seu e-mail. Enviado link para redefinir senha.'));
        } catch (error) {
            setOpenSnackBar({ error: true, success: false });
            dispatch(setMessage('Erro ao enviar e-mail de redefinição de senha.'));
        }
    }

    const formik = useFormik<EmpresaRegister>({
        initialValues,
        enableReinitialize: true,
        validationSchema: Yup.object({
            email: Yup.string().email('Email inválido').required('Campo obrigatório'),
            passwordDashboard: Yup.string()
                .min(8, 'Senha deve ter no mínimo 8 caracteres')
                .test(
                    'require-password',
                    'O campo de senha deve ser preenchido',
                    function (value) {
                        return !changedPassword || !!value;
                    }
                ),
            cnpjEmpresa: Yup.string().required('Campo obrigatório'),
            nmEmpresa: Yup.string().required('Campo obrigatório'),
            tfEmpresa: Yup.string().required('Campo obrigatório').min(10, 'Telefone inválido'),
            bairroEmpresa: Yup.string().required('Campo obrigatório'),
            cepEmpresa: Yup.string().required('Campo obrigatório'),
            ruaEmpresa: Yup.string().required('Campo obrigatório'),
            cidadeEmpresa: Yup.string().required('Campo obrigatório'),
            estadoEmpresa: Yup.string().required('Campo obrigatório'),
            oldPasswordDashboard: Yup.string()
                .test(
                    'require-old-password',
                    'A senha atual deve ser informada',
                    function (value) {
                        return !changedPassword || !!value;
                    }
                )
                .test(
                    'validate-old-password',
                    'A senha atual está incorreta',
                    async function (value) {
                        if (!changedPassword) return true;

                        if (!value) return false;

                        try {
                            const encryptedPassword = empresa.passwordDashboard;

                            // Descriptografe e compare
                            const decryptedPassword = CryptoJS.SHA256(value).toString(CryptoJS.enc.Base64);
                            return decryptedPassword === encryptedPassword;
                        } catch (error) {
                            return false;
                        }
                    }
                ),
            numeroEmpresa: Yup.string().required('Campo obrigatório'),
        }),
        onSubmit: handleRegister,
    });

    useEffect(() => {
        const handleFetchAddress = async () => {
            if (formik.values.cepEmpresa && formik.values.cepEmpresa.length >= 8) {
                const address = await fetchAddress(formik.values.cepEmpresa);
                if (address) {
                    formik.setFieldValue('cidadeEmpresa', address.localidade);
                    formik.setFieldValue('estadoEmpresa', address.uf);
                }
            }
        };
        handleFetchAddress();
    }, [formik.values.cepEmpresa]);


    async function handleRegister() {
        dispatch(setLoadingGlobal(true))
        try {
            const hashedPasswordDashboard = CryptoJS.SHA256(formik.values.passwordDashboard).toString(CryptoJS.enc.Base64);
            const newValues = {
                ...formik.values,
                passwordDashboard: hashedPasswordDashboard
            };
            delete newValues.confirmPassword;
            delete newValues.password;
            delete newValues.oldPasswordDashboard;
            updateItem(tablekeys.Empresa, empresa.id ?? '', newValues, dispatch);
            dispatch(setMessage('Perfil atualizado com sucesso.'));
            setOpenSnackBar({ success: true, error: false });
            setChangedPassword(false);
        } catch (err: any) {
            dispatch(setMessage('Erro ao atualizar perfil.'));
            setOpenSnackBar({ error: true, success: false });
        } finally {
            dispatch(setLoadingGlobal(false))
        }
    }

    return (
        <Box sx={{ padding: '5rem' }}>
            <Typography variant="h4" gutterBottom>
                Perfil
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Input
                        fullWidth
                        key={key}
                        label="Nome Empresa"
                        name="nmEmpresa"
                        value={formik.values.nmEmpresa}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.nmEmpresa && formik.errors.nmEmpresa ? formik.errors.nmEmpresa : ''}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Input
                        fullWidth
                        key={key}
                        label="CNPJ"
                        maxLength={18}
                        name="cnpjEmpresa"
                        type='tel'
                        value={formik.values.cnpjEmpresa}
                        onChange={(e) => formik.setFieldValue("cnpjEmpresa", formatCNPJ(e.target.value))}
                        onBlur={formik.handleBlur}
                        error={formik.touched.cnpjEmpresa && formik.errors.cnpjEmpresa ? formik.errors.cnpjEmpresa : ''}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Input
                        fullWidth
                        key={key}
                        label="Telefone(DDD)"
                        type='tel'
                        name="tfEmpresa"
                        maxLength={15}
                        value={formik.values.tfEmpresa || ''}
                        onChange={(e) => formik.setFieldValue("tfEmpresa", formatPhoneNumber(e.target.value))}
                        onBlur={formik.handleBlur}
                        error={formik.touched.tfEmpresa && formik.errors.tfEmpresa ? formik.errors.tfEmpresa : ''}
                    />
                </Grid>
                <Grid item xs={2}>
                    <Input
                        fullWidth
                        key={key}
                        label="CEP"
                        maxLength={9}
                        name="cepEmpresa"
                        value={formik.values.cepEmpresa}
                        onChange={(e) => formik.setFieldValue("cepEmpresa", formatCEP(e.target.value))}
                        onBlur={formik.handleBlur}
                        error={formik.touched.cepEmpresa && formik.errors.cepEmpresa ? formik.errors.cepEmpresa : ''}
                    />
                </Grid>
                <Grid item xs={2}>
                    <Input
                        fullWidth
                        key={key}
                        label="Cidade"
                        disabled
                        name="cidadeEmpresa"
                        value={formik.values.cidadeEmpresa}
                    />
                </Grid>
                <Grid item xs={1}>
                    <Input
                        fullWidth
                        key={key}
                        label="Estado"
                        disabled
                        name="estadoEmpresa"
                        value={formik.values.estadoEmpresa}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Input
                        fullWidth
                        key={key}
                        label="Logradouro"
                        name="ruaEmpresa"
                        value={formik.values.ruaEmpresa}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.ruaEmpresa && formik.errors.ruaEmpresa ? formik.errors.ruaEmpresa : ''}
                    />
                </Grid>
                <Grid item xs={1}>
                    <Input
                        fullWidth
                        key={key}
                        label="N°"
                        name="numeroEmpresa"
                        type='number'
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.numeroEmpresa}
                        error={formik.touched.numeroEmpresa && formik.errors.numeroEmpresa ? formik.errors.numeroEmpresa : ''}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Input
                        fullWidth
                        key={key}
                        label="Bairro"
                        name="bairroEmpresa"
                        value={formik.values.bairroEmpresa}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.bairroEmpresa && formik.errors.bairroEmpresa ? formik.errors.bairroEmpresa : ''}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Input
                        fullWidth
                        key={key}
                        label="E-mail"
                        disabled
                        name="email"
                        value={formik.values.email}
                        error={formik.touched.email && formik.errors.email ? formik.errors.email : ''}
                    />
                </Grid>
                <Grid item xs={4}>

                </Grid>
                <Grid item xs={4} />
                <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" style={{ textAlign: 'left' }}>
                        Trocar Senha Da conta?{' '}
                        <span
                            onClick={handleResetPassword}
                            style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Clique aqui
                        </span>
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" style={{ textAlign: 'left' }}>
                        Trocar Senha Do Dashboard?{' '}
                        <span
                            onClick={() => setChangedPassword(true)}
                            style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Clique aqui
                        </span>
                    </Typography>
                </Grid>
                <Grid item xs={2}>
                    <Input
                        fullWidth
                        key={key}
                        disabled={!changedPassword}
                        label="Antiga Senha do Dashboard"
                        type="password"
                        name="oldPasswordDashboard"
                        value={formik.values.oldPasswordDashboard}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.oldPasswordDashboard && formik.errors.oldPasswordDashboard ? formik.errors.oldPasswordDashboard : ''}
                    />
                </Grid>
                <Grid item xs={2}>
                    <Input
                        fullWidth
                        key={key}
                        disabled={!changedPassword}
                        label="Nova Senha do Dashboard"
                        type="password"
                        name="passwordDashboard"
                        value={formik.values.passwordDashboard}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.passwordDashboard && formik.errors.passwordDashboard ? formik.errors.passwordDashboard : ''}
                    />
                </Grid>
            </Grid>
            <Box mt={4} display="flex" justifyContent="flex-end">
                <Button
                    label="Salvar Dados"
                    type="button"
                    disabled={loadingGlobal || !formik.dirty || !formik.isValid}
                    onClick={formik.handleSubmit}
                    style={{ width: '12rem', height: '4rem' }}
                />
            </Box>
            <CustomSnackBar message={message} open={openSnackBar} setOpen={setOpenSnackBar} />
        </Box>
    );
}

export default Profile;
