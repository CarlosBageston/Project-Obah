import { Box, Container, DivInput, Image, Title, Input, Button, Error } from './style';
import { useAuth } from '../../hooks/auth';
import { KeyboardEvent } from 'react';


export default function Login() {
    const { login, setEmail, setPassword, email, password, error } = useAuth();

    const eventKey = (e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.code === 'Enter') {
            login();
        }
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
                            value={email}
                            placeholder='E-mail'
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            type="password"
                            id="password"
                            name="password"
                            placeholder='Senha'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Error>{error}</Error>
                        <Button
                            onKeyPress={(e: KeyboardEvent<HTMLButtonElement>) => eventKey(e)}
                            onClick={() => login()}
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