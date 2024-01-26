import { Box, Text, Image, ImageDetail, DivText } from './style';
import logo from '../../assets/Image/Logo.png';
import derreter from '../../assets/Image/derreter.png';

export default function Footer() {
    return (
        <>
            <Box>
                <div>
                    <ImageDetail src={derreter} alt='derreter' />
                </div>
                <DivText>
                    <Text>&copy; 2023 - Sorveteria Obah! | Todos os direitos reservados</Text>
                    <Text>Criação do site - Carlos Eduardo Bageston</Text>
                </DivText>

                <div>
                    <Image src={logo} alt="logo da sorveteria" />
                </div>
            </Box>
        </>
    )
}