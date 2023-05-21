import { Box, Container, DivInput, Image, Title, Input, Button, Error } from './style';
import { useDispatch, useSelector } from 'react-redux';
import { State, setEmail, setPassword, setError, setUser, setuserLogado } from '../../store/reducer/reducer';
import { AuthError, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';



export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { email, password, error } = useSelector((state: State) => state.user);

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
            .catch((error: AuthError) => {
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
        </>
    )
}