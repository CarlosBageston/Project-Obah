import Slider from "react-slick";
import Menu from '../../Components/Menu/Menu';
import sorvete from '../../assets/Image/sorvete.png';
import { BoxDefault, ContainerCarousel, Title, ContainerTitle, SubTitle, ImageDetail } from './style';
import derreter from '../../assets/Image/derreter.png';


export default function Carousel() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };
    return (
        <>
            <Menu />
            <BoxDefault id='slide'>
                <div>
                    <ImageDetail src={derreter} alt='derreter' />
                </div>
                <Slider {...settings}>
                    <div>
                        <ContainerCarousel>
                            <ContainerTitle>
                                <Title>Com 25% de desconto</Title>
                                <SubTitle >Uma explosão de sabores <br />em cada colherada!</SubTitle>
                            </ContainerTitle>
                            <img src={sorvete} alt="sorvete" />
                        </ContainerCarousel>
                    </div>
                    <div>
                        <ContainerCarousel>
                            <ContainerTitle>
                                <Title>Com 25% de desconto</Title>
                                <SubTitle >Uma explosão de sabores <br />em cada colherada!</SubTitle>
                            </ContainerTitle>
                            <img src={sorvete} alt="sorvete" />
                        </ContainerCarousel>
                    </div>
                </Slider>
            </BoxDefault>
        </>
    )
}