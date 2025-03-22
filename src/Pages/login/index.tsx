import { auth } from '../../firebase';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Box, Grid, Typography, LinearProgress } from '@mui/material';
import { setMessage, setUser, setuserLogado } from '../../store/reducer/reducer';
import { RootState } from '../../store/reducer/store';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomSnackBar, { StateSnackBar } from '../../Components/snackBar/customsnackbar';
import Input from '../../Components/input';
import Button from '../../Components/button';
import AuthLayout from '../../Components/authLayout/authLayout';
import { setLoadingGlobal } from '../../store/reducer/loadingSlice';
import { Dots } from '../../store/assets/loadingStyle';
import { BoxLoading } from './style';
import logo from "../../assets/Image/logo.png";

export interface LoginModel {
    email: string;
    password: string;
}

function Login() {
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [initialLoad, setInitialLoad] = useState<boolean>(true);
    const userLogado = useSelector((state: RootState) => state.user.userLogado);
    const message = useSelector((state: RootState) => state.user.message);
    const loadingGlobal = useSelector((state: RootState) => state.loading.loadingGlobal);

    useEffect(() => {
        const checkAuthStatus = async () => {
            if (userLogado) {
                navigate('/dashboard');
            } else {
                setInitialLoad(false);
            }
        };
        checkAuthStatus();
    }, [navigate, userLogado]);

    const validationSchema = Yup.object().shape({
        email: Yup.string().required('E-mail é obrigatório').email('E-mail inválido'),
        password: Yup.string().required('Senha é obrigatória').min(8, 'Senha deve ter no mínimo 8 caracteres'),
    });

    const authenticateUser = async (values: LoginModel) => {
        dispatch(setLoadingGlobal(true))
        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            dispatch(setUser({
                uid: user.uid,
                email: user.email || '',
            }));
            dispatch(setuserLogado(true));
            dispatch(setMessage(''));
            navigate('/dashboard');
        } catch (error) {
            if (error instanceof Error) {
                dispatch(setMessage("E-mail ou senha incorreto"));
            } else {
                dispatch(setMessage('Erro, verifique sua conexão e tente novamente.'));
            }
            setOpenSnackBar(prev => ({ ...prev, error: true }));
        } finally {
            dispatch(setLoadingGlobal(false))
        }
    };

    const onKeyPressAuthenticate = (e: React.KeyboardEvent<HTMLDivElement> | React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter') {
            authenticateUser(formik.values);
        }
    };

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        } as LoginModel,
        validationSchema,
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: authenticateUser,
    });

    if (initialLoad) {
        return (
            <BoxLoading>
                <div>
                    <img src={logo} alt="logo da empresa" width={250} />
                </div>
                <Dots />
            </BoxLoading>
        );
    }

    return (
        <AuthLayout>
            <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 1 }}>
                {loadingGlobal && <LinearProgress />}
            </Box>
            <Typography variant="h4" gutterBottom>
                Bem-vindo
            </Typography>
            <Grid container spacing={2}>
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
                <Grid item xs={12}>
                    <Input
                        fullWidth
                        label="Senha"
                        type="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        onKeyDown={onKeyPressAuthenticate}
                        error={formik.touched.password && formik.errors.password ? formik.errors.password : ''}
                    />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button disabled={loadingGlobal} label="Login" type="button" onClick={formik.handleSubmit} />
                </Grid>
            </Grid>
            <CustomSnackBar message={message} open={openSnackBar} setOpen={setOpenSnackBar} />
        </AuthLayout>

    );
}

export default Login;
