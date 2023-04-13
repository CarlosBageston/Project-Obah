import styled from "styled-components";
import { TitleDefault } from "../cadastroClientes/style";


export const Box = styled.div`
height: 100%;
`;

export const Title = styled(TitleDefault)``;

export const Container = styled.div`
display: flex;
justify-content: space-evenly;
`;

export const ContainerGrafic = styled.div`
display: flex;
flex-direction: column;
`;

export const DivGraficHortizontal = styled.div`
width: 100%;
height: 25rem;
background-image: linear-gradient(to right bottom, #2e294e, #2e2858, #2f2761, #2f256b, #2f2374);
border-radius: 20px;
display: flex;
align-items: center;
justify-content: center;
box-shadow: 5px 5px 15px 0px rgba(0,0,0,0.57);
`;


export const ContainerTwoGrafic = styled.div`
display: flex;
width: 100%;
justify-content: space-between;
`;

export const DivGraficVertical = styled(DivGraficHortizontal)`
width: 30rem;
height: 20rem;
margin-top: 2rem;
`;
export const DivGraficLine = styled(DivGraficHortizontal)`
width: 30rem;
height: 20rem;
margin-top: 2rem;
margin-right: 2rem;
`;

export const ContainerResult = styled.div`
display: flex;
flex-direction: column;
justify-content: space-around;
margin-left: 2rem;
`;

export const DivResult = styled.div`
height: 15rem;
width: 20rem;
background-image: linear-gradient(to right bottom, #2e294e, #2e2858, #2f2761, #2f256b, #2f2374);
border-radius: 20px;
box-shadow: 5px 5px 15px 2px rgba(0,0,0,0.45);
display: flex;
flex-direction: column;
justify-content: space-between;
`;

export const TextResult = styled.p`
color: #FFF;
text-align: center;
padding: 1rem 4rem 0rem 4rem;
font-size: 2rem;
`;
export const SumResult = styled(TextResult)`
padding: 0;
font-size: 3rem;
`;

export const Paragraph = styled.p`
color: #fff;
font-size: small;
text-align: center;
padding-bottom: 1rem;
`;