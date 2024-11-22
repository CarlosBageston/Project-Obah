import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addItem, deleteItem, getSingleItemByQuery } from '../../hooks/queryFirebase';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from '../../firebase';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Checkbox,
    FormControlLabel,
    Grid,
    LinearProgress,
    Typography,
} from '@mui/material';
import { setMessage } from '../../store/reducer/reducer';
import { RootState } from '../../store/reducer/store';
import CustomSnackBar, { StateSnackBar } from '../../Components/snackBar/customsnackbar';
import Input from '../../Components/input';
import Button from '../../Components/button';
import CryptoJS from 'crypto-js';
import AuthLayout from '../../Components/authLayout/authLayout';
import { setLoadingGlobal } from '../../store/reducer/loadingSlice';
import axios from 'axios';
import { formatCEP, formatCNPJ, formatPhoneNumber } from '../../utils/formattedString';
import { EmpresaRegister } from './model/empresa';

function SignUp() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [isTokenValid, setIsTokenValid] = useState(false);
    const message = useSelector((state: RootState) => state.user.message);
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loadingGlobal = useSelector((state: RootState) => state.loading.loadingGlobal);

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

    const formik = useFormik<EmpresaRegister>({
        initialValues: {
            email: '',
            password: '',
            confirmPassword: '',
            passwordDashboard: '',
            cnpjEmpresa: '',
            nmEmpresa: '',
            tfEmpresa: '',
            bairroEmpresa: '',
            cepEmpresa: '',
            ruaEmpresa: '',
            cidadeEmpresa: '',
            estadoEmpresa: '',
            numeroEmpresa: '',
            inscricaoEstadual: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Email inválido').required('Campo obrigatório'),
            password: Yup.string()
                .required('Campo obrigatório')
                .min(8, 'Senha deve ter no mínimo 8 caracteres'),
            confirmPassword: Yup.string()
                .required('Campo obrigatório')
                .oneOf([Yup.ref('password'), ''], 'As senhas devem ser iguais'),
            passwordDashboard: Yup.string()
                .required('Campo obrigatório')
                .min(8, 'Senha deve ter no mínimo 8 caracteres'),
            cnpjEmpresa: Yup.string().required('Campo obrigatório'),
            nmEmpresa: Yup.string().required('Campo obrigatório'),
            tfEmpresa: Yup.string().required('Campo obrigatório').min(10, 'Telefone inválido'),
            bairroEmpresa: Yup.string().required('Campo obrigatório'),
            cepEmpresa: Yup.string().required('Campo obrigatório'),
            ruaEmpresa: Yup.string().required('Campo obrigatório'),
            cidadeEmpresa: Yup.string().required('Campo obrigatório'),
            estadoEmpresa: Yup.string().required('Campo obrigatório'),
            numeroEmpresa: Yup.string().required('Campo obrigatório'),
            inscricaoEstadual: Yup.string()
                .test(
                    'inscricao-estadual-condicional',
                    'IE é obrigatória quando não isento',
                    function (value) {
                        if (formik.values.isentoInscricaoEstadual) {
                            return true;
                        }
                        return !!value && /^\d{8,14}$/.test(value);
                    }
                ),
        }),
        onSubmit: handleRegister,
    });
    useEffect(() => {
        const handleFetchAddress = async () => {
            if (formik.values.cepEmpresa.length >= 8) {
                const address = await fetchAddress(formik.values.cepEmpresa);
                if (address) {
                    formik.setFieldValue('cidadeEmpresa', address.localidade);
                    formik.setFieldValue('estadoEmpresa', address.uf);
                }
            }
        };
        handleFetchAddress();
    }, [formik.values.cepEmpresa]);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                dispatch(setMessage('Token não encontrado.'));
                setOpenSnackBar(prev => ({ ...prev, error: true }))
                return;
            }

            try {
                const foundToken = await getSingleItemByQuery(
                    'RegistrationTokens',
                    [where('token', '==', token)],
                    dispatch
                );

                if (foundToken && foundToken.expirationTime.toMillis() > Date.now()) {
                    setIsTokenValid(true);
                    deleteItem('RegistrationTokens', foundToken?.id ?? '', dispatch);
                } else {
                    dispatch(setMessage('O link de registro expirou.'));
                    setOpenSnackBar(prev => ({ ...prev, error: true }))
                }
            } catch (err) {
                dispatch(setMessage('Erro ao verificar o token.'));
                setOpenSnackBar(prev => ({ ...prev, error: true }))
            }
        };

        verifyToken();
    }, [token, dispatch]);

    async function handleRegister() {
        dispatch(setLoadingGlobal(true))
        if (!isTokenValid) {
            dispatch(setMessage('Token inválido ou expirado.'));
            setOpenSnackBar(prev => ({ ...prev, error: true }))
            return;
        }
        try {
            const user = await createUserWithEmailAndPassword(
                auth,
                formik.values.email,
                formik.values.password ?? ''
            )
            const hashedPasswordDashboard = CryptoJS.SHA256(formik.values.passwordDashboard).toString(CryptoJS.enc.Base64);
            const newValues = {
                ...formik.values,
                passwordDashboard: hashedPasswordDashboard,
                uid: user.user.uid
            };

            delete newValues.confirmPassword;
            delete newValues.password;
            addItem(`UsersData/${user.user.uid}/Empresa`, newValues, dispatch);
            navigate('/dashboard');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                dispatch(setMessage('E-mail já registrado.'));
            } else {
                dispatch(setMessage('Erro ao registrar usuário.'));
            }
            setOpenSnackBar(prev => ({ ...prev, error: true }))
        } finally {
            dispatch(setLoadingGlobal(false))
        }
    }

    return (
        <AuthLayout>
            {isTokenValid ? (
                <>
                    <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 1 }}>
                        {loadingGlobal && <LinearProgress />}
                    </Box>
                    <Typography variant="h4" gutterBottom align="center">
                        Registro de Novo Usuário
                    </Typography>
                    <Grid container spacing={2}>
                        <form onSubmit={formik.handleSubmit}>
                            <Grid item xs={12}>
                                <Input
                                    fullWidth
                                    label="Nome Empresa"
                                    name="nmEmpresa"
                                    value={formik.values.nmEmpresa}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.nmEmpresa && formik.errors.nmEmpresa ? formik.errors.nmEmpresa : ''}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Input
                                    fullWidth
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
                            <Grid item display={'flex'} alignItems={'center'}>
                                <Grid item xs={8}>
                                    <Input
                                        fullWidth
                                        label="Inscrição Estadual"
                                        maxLength={14}
                                        name="inscricaoEstadual"
                                        type='number'
                                        disabled={formik.values.isentoInscricaoEstadual}
                                        value={formik.values.inscricaoEstadual}
                                        onChange={(e) => formik.setFieldValue("inscricaoEstadual", e.target.value)}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.inscricaoEstadual && formik.errors.inscricaoEstadual ? formik.errors.inscricaoEstadual : ''}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formik.values.isentoInscricaoEstadual}
                                                onChange={(e) => {
                                                    if (e.target.checked) formik.setFieldValue("inscricaoEstadual", '');
                                                    formik.setFieldValue("isentoInscricaoEstadual", e.target.checked)
                                                }}
                                            />
                                        }
                                        label="Isento"
                                    />
                                </Grid>
                            </Grid>
                            <Grid item display={'flex'} >
                                <Grid item xs={7} marginRight={3}>
                                    <Input
                                        fullWidth
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
                                <Grid item xs={4}>
                                    <Input
                                        fullWidth
                                        label="CEP"
                                        maxLength={9}
                                        name="cepEmpresa"
                                        value={formik.values.cepEmpresa}
                                        onChange={(e) => formik.setFieldValue("cepEmpresa", formatCEP(e.target.value))}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.cepEmpresa && formik.errors.cepEmpresa ? formik.errors.cepEmpresa : ''}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item display={'flex'} >
                                <Grid item xs={7} marginRight={3} >
                                    <Input
                                        fullWidth
                                        label="Cidade"
                                        disabled
                                        name="cidadeEmpresa"
                                        value={formik.values.cidadeEmpresa}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <Input
                                        fullWidth
                                        label="Estado"
                                        disabled
                                        name="estadoEmpresa"
                                        value={formik.values.estadoEmpresa}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item display={'flex'} >
                                <Grid item xs={5} marginRight={3} >
                                    <Input
                                        fullWidth
                                        label="Logradouro"
                                        name="ruaEmpresa"
                                        value={formik.values.ruaEmpresa}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.ruaEmpresa && formik.errors.ruaEmpresa ? formik.errors.ruaEmpresa : ''}
                                    />
                                </Grid>
                                <Grid item xs={2} marginRight={3} >
                                    <Input
                                        fullWidth
                                        label="N°"
                                        name="numeroEmpresa"
                                        type='number'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.numeroEmpresa}
                                        error={formik.touched.numeroEmpresa && formik.errors.numeroEmpresa ? formik.errors.numeroEmpresa : ''}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <Input
                                        fullWidth
                                        label="Bairro"
                                        name="bairroEmpresa"
                                        value={formik.values.bairroEmpresa}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.bairroEmpresa && formik.errors.bairroEmpresa ? formik.errors.bairroEmpresa : ''}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Input
                                    fullWidth
                                    label="E-mail"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.email && formik.errors.email ? formik.errors.email : ''}
                                />
                            </Grid>
                            <Grid item display={'flex'}>
                                <Grid item xs={5} marginRight={3}>
                                    <Input
                                        fullWidth
                                        label="Senha"
                                        type="password"
                                        name="password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.password && formik.errors.password ? formik.errors.password : ''}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Input
                                        fullWidth
                                        label="Confirmar Senha"
                                        type="password"
                                        name="confirmPassword"
                                        value={formik.values.confirmPassword}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : ''}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Input
                                    fullWidth
                                    label="Senha do Dashboard"
                                    type="password"
                                    name="passwordDashboard"
                                    value={formik.values.passwordDashboard}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.passwordDashboard && formik.errors.passwordDashboard ? formik.errors.passwordDashboard : ''}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    label="Registrar"
                                    type="button"
                                    disabled={loadingGlobal}
                                    onClick={formik.handleSubmit}
                                />
                            </Grid>
                        </form>
                    </Grid>

                    <CustomSnackBar message={message} open={openSnackBar} setOpen={setOpenSnackBar} />
                </>
            ) : (
                <Typography align="center" color="textSecondary">
                    {message ? message : 'Aguarde, Verificando token...'}
                </Typography>
            )}
        </AuthLayout>
    );
}

export default SignUp;
