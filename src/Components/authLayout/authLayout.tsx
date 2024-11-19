import { Box, Paper } from '@mui/material';
import leftimage from '../../assets/Image/classic-leftimage.png';
import rightimage from '../../assets/Image/classic-rightimage.png';
import rightBottomimage from '../../assets/Image/relive-righttopimage.png';
import righttop from '../../assets/Image/relive-righttopimage.png';
import triangle from '../../assets/Image/relive-triangle.png';
import circle from '../../assets/Image/relive-circle.png';
import relive from '../../assets/Image/relive-doted.png';

interface AuthLayoutProps {
    children: React.ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#ffffff">
            {/* Imagem esquerda */}
            <Box
                component="img"
                src={leftimage}
                alt="left-image"
                sx={{
                    position: 'absolute',
                    left: 0,
                    bottom: '40%',
                    width: '200px',
                }}
            />

            {/* Imagem no topo direito */}
            <Box
                component="img"
                src={righttop}
                alt="righttop"
                sx={{
                    position: 'absolute',
                    right: 80,
                    top: 0,
                    width: '200px',
                    transform: 'rotate(180deg)',
                }}
            />

            {/* Contêiner para o formulário e ícones decorativos */}
            <Box display="flex" flexDirection="column" alignItems="center">
                {/* Imagem triangle acima do children */}
                <Box
                    component="img"
                    src={triangle}
                    alt="triangle"
                    sx={{
                        width: '40px',
                        mb: 1,
                        ml: 60,
                    }}
                />

                <Box
                    component="img"
                    src={relive}
                    alt="relive"
                    sx={{
                        width: '50px',
                        mb: 1,
                        mr: 40,
                    }}
                />

                {/* Área do formulário */}
                <Paper elevation={6} sx={{ p: 4, maxWidth: 400, textAlign: 'center', zIndex: 1 }}>
                    {children}
                </Paper>

                {/* Imagem circle abaixo do children */}
                <Box
                    component="img"
                    src={circle}
                    alt="circle"
                    sx={{
                        width: '40px',
                        mt: 1,
                        mr: 70,
                    }}
                />
            </Box>

            {/* Imagem direita */}
            <Box
                component="img"
                src={rightimage}
                alt="right-image"
                sx={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: '170px',
                }}
            />

            {/* Imagem direita inferior rotacionada */}
            <Box
                component="img"
                src={rightBottomimage}
                alt="rightBottomimage"
                sx={{
                    position: 'absolute',
                    left: -50,
                    bottom: 10,
                    width: '170px',
                    transform: 'rotate(90deg)',
                }}
            />
        </Box>
    );
}

export default AuthLayout;
