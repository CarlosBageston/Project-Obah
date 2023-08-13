import { Box, ContainerAllImage, ContainerImgName, NameIceCream, Title } from './style'
import { RotatingImage } from '../../Components/RotatingImage';

//import das Imagens
import image1 from '../../assets/imageteste/image1.png'
import image2 from '../../assets/imageteste/image2.png'
import image3 from '../../assets/imageteste/image3.png'
import image4 from '../../assets/imageteste/image4.png'
import image5 from '../../assets/imageteste/image5.png'
import image6 from '../../assets/imageteste/image6.png'
import image7 from '../../assets/imageteste/image7.png'
import image8 from '../../assets/imageteste/image8.png'



export default function MaisVendidos() {
    return (
        <>
            <Box id='maisVendidos'>
                <div>
                    <Title>Mais vendidos</Title>
                </div>
                <ContainerAllImage>
                    <ContainerImgName>
                        <RotatingImage src={image3} alt="logo" width={150} src2={image7} />
                        <div>
                            <NameIceCream>Moreninha</NameIceCream>
                        </div>
                    </ContainerImgName>
                    <ContainerImgName>
                        <RotatingImage src={image1} alt="logo" width={150} src2={image4} />
                        <div>
                            <NameIceCream>Loirinha</NameIceCream>
                        </div>
                    </ContainerImgName>
                    <ContainerImgName>
                        <RotatingImage src={image5} alt="logo" width={150} src2={image6} />
                        <div>
                            <NameIceCream>Taça Sundae</NameIceCream>
                        </div>
                    </ContainerImgName>
                    <ContainerImgName>
                        <RotatingImage src={image2} alt="logo" width={150} src2={image8} />
                        <div>
                            <NameIceCream>Pote de Sorvete</NameIceCream>
                        </div>
                    </ContainerImgName>
                </ContainerAllImage>
            </Box>
        </>
    )
}

