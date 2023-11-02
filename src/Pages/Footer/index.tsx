import { Box, Text, Image, ImageDetail } from './style';
import logo from '../../assets/Image/Logo.png';
import derreter from '../../assets/Image/derreter.png';

export default function Footer() {
    return (
        <>
            <Box>
                <div>
                    <ImageDetail src={derreter} alt='derreter' />
                </div>
                <div style={{ marginLeft: '-35rem' }} >
                    <Text>&copy; 2023 - Sorveteria Obah! | Todos os direitos reservados</Text>
                    <Text>Criação do site - Carlos Eduardo Bageston</Text>
                </div>

                <div>
                    <Image src={logo} alt="logo da sorveteria" />
                </div>
            </Box>
        </>
    )
}