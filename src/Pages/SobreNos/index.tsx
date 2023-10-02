import Slider from "react-slick";
import "leaflet/dist/leaflet.css";
import 'leaflet/dist/leaflet.css';
import ToolTip from "../../Components/ToolTip";
import useObserver from "../../hooks/useObserver";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

//Import Imagens/Icons
import iconFacebook from '../../assets/Icon/facebook-icon.png'
import iconwhatsapp from '../../assets/Icon/whatsapp-icon.png'
import iconinstagram from '../../assets/Icon/instagram-icon.png'
import sorveteriaExterna from '../../assets/Image/Sorveteriadentro.jpg'
import sorveteriaInterna from '../../assets/Image/chiquinho-sorvetes.webp'

//Import Style
import {
    Box,
    Title,
    Button,
    Contagem,
    CotainerSobre,
    ContainerInfo,
    CotainerSlide,
    ContainerIcons,
    ContainerTitle,
    ContainerAllMap,
    ContainerButton,
    ContainerAllSlide,
} from "./style";


export default function SobreNos() {
    const [countYears, setCountYears] = useState<number>(0);
    const { isVisible, myRef } = useObserver()
    const targetRef = useRef<HTMLDivElement>(null);

    //Contando quantos anos de tradição
    useEffect(() => {
        const interval = setInterval(() => {
            if (isVisible) {
                if (countYears < 15) {
                    setCountYears(countYears + 1);
                } else {
                    clearInterval(interval);
                }
            }
        }, 150);

        return () => clearInterval(interval);
    }, [countYears, isVisible]);

    //Configuração do slide
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    //cordenadas para o mapa
    const center = { lat: -25.755124, lng: -53.075229 };
    const zoom = 15;

    // URL do Google Maps com as coordenadas do marcador
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;
    const handleGoogleMapsClick = () => {
        window.open(googleMapsUrl, '_blank');
    };
    return (
        <>
            <Box id="sobrenos">
                <ContainerTitle>
                    <Contagem ref={myRef}>+{countYears}</Contagem>
                    <Title>anos de tradição</Title>
                </ContainerTitle>
                <ContainerAllSlide>
                    <div>
                        <h1>Conheça a Sorveteria Obah!</h1>
                        <CotainerSobre>
                            A sorveteria Obah tem na essência de seus produtos a fabricação
                            de forma semi-artesanal produzidas por uma Chef Profissional com mais de 25 anos
                            de experiencia na fabricação de sorvete.<br />
                            Acolhendo seus clientes em um ambiente de sorveteria tradicional
                            para a tranquilidade e casualidade.
                        </CotainerSobre>
                    </div>
                    <CotainerSlide>
                        <Slider {...settings}>
                            <div>
                                <div>
                                    <img src={sorveteriaExterna} alt="sorvete" width={400} />
                                </div>
                            </div>
                            <div>
                                <div>
                                    <img src={sorveteriaInterna} alt="sorvete" width={400} />
                                </div>
                            </div>
                        </Slider>
                    </CotainerSlide>
                </ContainerAllSlide>

                {/*toolTip */}

                <ToolTip tooltipRef={targetRef} />

                {/*Mapa */}

                <ContainerAllMap ref={targetRef}>
                    <MapContainer
                        center={center}
                        zoom={zoom}
                        style={{ height: "20rem", width: "35rem", boxShadow: "5px 5px 11px -1px rgb(0 0 0 / 45%)", marginRight: '4rem' }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={center} >
                            <Popup>
                                A sorveteria obah se localiza aqui <br />
                                <a href={googleMapsUrl} target='_blank' rel="noopener noreferrer"> Ver no Google Maps</a>
                            </Popup>
                            <ContainerButton>
                                <Button onClick={handleGoogleMapsClick} >Ver no Google Maps</Button>
                            </ContainerButton>
                        </Marker>
                    </MapContainer>
                    <ContainerInfo>
                        <div>
                            <h1>Telefone</h1>
                            <p>(46) 99935-8718</p>
                        </div>
                        <div>
                            <h1>Localização</h1>
                            <p>Rua Uruguai, 115 - Santa Luzia, Dois Vizinhos - PR</p>
                        </div>
                        <div>
                            <h1>Social</h1>
                            <ContainerIcons>
                                <a
                                    href="https://www.facebook.com/carloseduardo.bageston/"
                                    target="_blank" rel="noreferrer"
                                >
                                    <img src={iconFacebook} alt="icone facebook" /></a>
                                <a
                                    href="https://www.instagram.com/carlosbageston/"
                                    target="_blank" rel="noreferrer"
                                >
                                    <img src={iconinstagram} alt="icone instagram" /></a>
                                <a
                                    href="https://api.whatsapp.com/send?phone=5546999358718&text=Oi,%20tenho%20interesse%20em%20adquirir%20seus%20produtos%20:)"
                                    target="_blank" rel="noreferrer"
                                >
                                    <img src={iconwhatsapp} alt="icone whatsapp" />
                                </a>
                            </ContainerIcons>
                        </div>
                    </ContainerInfo>
                </ContainerAllMap>
            </Box>
        </>
    )
}