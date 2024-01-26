import { MapContainer } from "react-leaflet";
import styled from "styled-components";

export const Box = styled.div`
height: 100%;
`

export const ContainerTitle = styled.div`
margin-top: 6rem;
display: flex;
flex-direction: column;
align-items: center;
`

export const Contagem = styled.h1`
font-family: cursive;
font-size: 4rem;
`
export const Title = styled(Contagem)`
font-size: 2.5rem;
`

export const ContainerAllSlide = styled.div`
display: flex;
align-items: center;
justify-content: space-evenly;
width: 100%;
margin-top: 3rem;
@media (max-width: 700px){
    flex-direction: column;
}
@media (max-width: 1200px){
    justify-content: center;
}
`

export const CotainerSobre = styled.div`
width: 75%;
@media (max-width: 700px){
    width: 20rem;
    padding-bottom: 1rem
}
`
export const CotainerSlide = styled.div`
width: 60%;
@media (max-width: 1200px){
    width: 45%;
}
@media (max-width: 700px){
    width: 100%;
}
`

export const ContainerAllMap = styled.div`
display: flex;
padding-bottom: 6rem;
padding-top: 6rem;
justify-content: space-evenly;

@media (max-width: 700px){
    flex-direction: column;
    align-items: center;
    padding-top: 8rem;
}
`

export const ContainerButton = styled.div`
position: absolute;
right: 0;
margin-top: 4px;
margin-right: 4px;
z-index: 500;
`

export const Button = styled.button`
  height: 2rem;
  width: 8rem;
  align-items: center;
  background-image: linear-gradient(135deg, #f34079 40%, #fc894d);
  border: 0;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 3px;
  text-decoration: none;
  text-transform: uppercase;

&:active {
  outline: 0;
}
&:hover { 
  transform: scale(.9);
  opacity: .95;
}
`

export const ContainerInfo = styled.div`
display: flex;
flex-direction: column;
justify-content: space-between;
margin-left: -20rem;
@media (max-width: 700px){
    margin-left: 0;
    margin-top: 1rem;
    width: 80%;
}
@media (max-width: 1500px) and (min-width: 700px) {
    margin-left: 0;
}
`

export const ContainerIcons = styled.div`
display: flex;
justify-content: space-between;
width: 13rem;
`

export const MapContainerLeaflet = styled(MapContainer)`
height: 20rem;
width: 35rem;
margin-right: 4rem;
box-shadow: 5px 5px 11px -1px rgb(0 0 0 / 45%);

@media (max-width: 700px){
    height: 20rem;
    width: 80%;
    margin-right: 0;
}
@media (max-width: 1000px) and (min-width: 700px) {
    margin-right: 2rem;
    margin-left: 1rem;
}
`;

export const Image = styled.img`
  max-width: 50%;
  margin-left: 25%;
  @media (max-width: 1200px){
    max-width: 100%;
    padding: 0 8px;
    margin-left: 0;
  }
`;
 
export const TitleAbout = styled.h1`
@media (max-width: 700px){
    font-size: 1.6rem;
}
`;

export const DivText = styled.div`
display: flex;
flex-direction: column;
align-items: flex-start;
width: 37%;
@media (max-width: 700px){
    width: 90%;
}
`;