import styled from "styled-components";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export const BoxDefault = styled.div`
height: calc(100vh - 5rem);
background-image: linear-gradient(to bottom, #e5077b, #ea1e7b, #ef2d7b, #f4397b, #f9437b);
width: 100%;
&::before {
    position: relative;
    display: block;
    content: '';
    background-image: url('../../../src/assets/Image/derreter.png');
    background-repeat: no-repeat;
    width: 100%;
    height: 10rem;
    background-size: 100%;
    top: 0;
}
`

export const ContainerCarousel = styled.div`
    display: flex;
    justify-content: center;
`

export const ContainerTitle = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
`;

export const Title = styled.h3`
font-size: 1.5rem;
text-align: center;
color: #ffffff;
font-family: ${props => props.theme.fontsDefault.secondaryFont};
`;

export const SubTitle = styled(Title) `
font-size: 2rem;
`

export const ImageLogo = styled.img`
z-index: 1;
margin-top: 4rem;
transform: rotate(5deg);
`

