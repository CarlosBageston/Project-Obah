import { auth } from '../../firebase';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Box, Container, DivInput, Title, Button, Error } from './style';
import { setError, setUser, setuserLogado, setLoading } from '../../store/reducer/reducer';
import { RootState } from '../../store/reducer/store';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomSnackBar, { StateSnackBar } from '../../Components/snackBar/customsnackbar';
import Input from '../../Components/input';
import { CircularProgress } from '@mui/material';


/**
 * Modelo de Dados Login
 */

export interface LoginModel {
    email: string;
    password: string;
}

function Login() {
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [initialLoad, setInitialLoad] = useState<boolean>(true);
    const userLogado = useSelector((state: RootState) => state.user.userLogado)
    const error = useSelector((state: RootState) => state.user.error)
    useEffect(() => {
        const checkAuthStatus = async () => {
            if (userLogado) {
                navigate('/dashboard');
            } else {
                setInitialLoad(false);
            }
        };
        checkAuthStatus();
    }, [navigate]);

    // Validação do formulário com Yup
    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .required('E-mail é obrigatório')
            .email('E-mail inválido'),
        password: Yup.string()
            .required('Senha é obrigatória')
            .min(8, 'Senha deve ter no mínimo 8 caracteres'),
    });

    const authenticateUser = async (values: LoginModel) => {
        try {
            dispatch(setLoading(true));
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            dispatch(setUser({
                uid: user.uid,
                email: user.email || '',
            }));
            dispatch(setuserLogado(true));
            dispatch(setError(''));
            navigate('/dashboard');
        } catch (error) {
            console.error("Erro de autenticação:", error);
            if (error instanceof Error) {
                dispatch(setError("E-mail ou senha incorreto"));
            } else {
                dispatch(setError('Erro, verifique sua conexão e tente novamente.'));
            }
            setOpenSnackBar(prev => ({ ...prev, error: true }));
        } finally {
            dispatch(setLoading(false));
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
        return <Box><CircularProgress /></Box>;
    }

    return (
        <>
            <Box>
                <Container>
                    <Title>Bem-vindo</Title>
                    <DivInput>
                        <Input
                            type="text"
                            id="email"
                            name="email"
                            label='E-mail'
                            error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
                            value={formik.values.email}
                            placeholder='E-mail'
                            onChange={e => formik.setFieldValue('email', e.target.value)}
                        />

                        <Input
                            type="password"
                            id="password"
                            name="password"
                            error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
                            label='Senha'
                            value={formik.values.password}
                            onChange={e => formik.setFieldValue('password', e.target.value)}
                            onKeyDown={e => onKeyPressAuthenticate(e)}
                        />
                        <Error>{error}</Error>
                        <Button
                            onKeyDown={e => onKeyPressAuthenticate(e)}
                            onClick={() => formik.handleSubmit()}
                        >
                            Login
                            <div className="arrow-wrapper">
                                <div className="arrow"></div>
                            </div>
                        </Button>
                    </DivInput>

                    <CustomSnackBar message={error} open={openSnackBar} setOpen={setOpenSnackBar} />
                </Container>
            </Box>
        </>
    )
}
export default Login;