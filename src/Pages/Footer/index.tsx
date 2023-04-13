import { Box, Text, Image } from './style';
import logo from '../../assets/Image/Logo.png';

export default function Footer() {
    return (
        <>
            <Box >
                <div >
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