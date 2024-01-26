import styled from "styled-components";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export const BoxDefault = styled.div`
height: calc(100vh - 5rem);
background-image: linear-gradient(to bottom, #e5077b, #ea1e7b, #ef2d7b, #f4397b, #f9437b);
width: 100%;
`

export const ContainerCarousel = styled.div`
display: flex;
justify-content: center;

@media (max-width: 700px) {
    flex-direction: column;
    padding-top: 6rem;
}
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

export const ImageDetail = styled.img`
position: absolute;
top: 78px;
width: 100%;
`;

