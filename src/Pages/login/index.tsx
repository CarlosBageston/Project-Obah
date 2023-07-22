import { auth } from '../../firebase';
import { useEffect, useState } from 'react';
import logo from '../../assets/Image/logo.png';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dots } from '../../store/assets/loadingStyle';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { Box, Container, DivInput, Title, Input, Button, Error, BoxLoading } from './style';
import { State, setEmail, setPassword, setError, setUser, setuserLogado } from '../../store/reducer/reducer';



export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { email, password, error } = useSelector((state: State) => state.user);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch(setuserLogado(true));
                navigate('/dashboard');
            } else {
                dispatch(setuserLogado(false));
            }
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const authenticateUser = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user
                dispatch(setUser(user))
                dispatch(setError(''));
                dispatch(setuserLogado(true))
                dispatch(setPassword(''));
                dispatch(setEmail(''));
                navigate('/dashboard');
            })
            .catch(() => {
                dispatch(setError('E-mail ou senha inválidos'));
            });
    };
    const onKeyPressAuthenticate = (e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter') {
            authenticateUser();
        }
    };

    return (
        <>
            {loading ?
                <BoxLoading>
                    <div>
                        <img src={logo} alt="logo da empresa" width={250} />
                    </div>
                    <Dots />
                </BoxLoading>
                :
                <Box>
                    <Container>
                        <Title>Bem-vindo</Title>
                        <DivInput>
                            <Input
                                type="text"
                                id="email"
                                name="email"
                                value={email}
                                placeholder='E-mail'
                                onChange={e => dispatch(setEmail(e.target.value))}
                            />

                            <Input
                                type="password"
                                id="password"
                                name="password"
                                placeholder='Senha'
                                value={password}
                                onChange={e => dispatch(setPassword(e.target.value))}
                                onKeyDown={e => onKeyPressAuthenticate(e)}
                            />
                            <Error>{error}</Error>
                            <Button
                                onKeyDown={e => onKeyPressAuthenticate(e)}
                                onClick={authenticateUser}
                            >
                                Login
                                <div className="arrow-wrapper">
                                    <div className="arrow"></div>
                                </div>
                            </Button>
                        </DivInput>

                    </Container>
                </Box>
            }
        </>
    )
}