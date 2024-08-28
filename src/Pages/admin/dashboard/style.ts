import styled from "styled-components";
import { GiPadlock } from 'react-icons/gi';

export const Box = styled.div`
height: 100%;
`;

export const Title = styled.p`
padding-left: 1rem;
font-size: 3rem;
text-align: center;
background-image: linear-gradient(to right bottom, rgb(46, 41, 78), rgb(46, 40, 88), rgb(47, 39, 97), rgb(47, 37, 107), rgb(47, 35, 116));
color: #fff;
padding: 1rem 2rem;
border-radius: 10px;
text-shadow: 2px 2px 4px rgb(38 19 156);
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
margin: 2rem 1.1rem 2rem 1.1rem;
`;

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

export const ContainerResult = styled.div<{open: boolean}>`
position: ${props => props.open ? 'relative' : 'none'};
display: flex;
flex-direction: column;
justify-content: space-between;
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

export const BlockedInformation = styled.div<{isVisible: boolean}>`
position: absolute;
backdrop-filter: blur(8px) saturate(147%);
background-color: rgb(35 37 41 / 62%);
border-radius: 12px;
border: 1px solid rgba(255, 255, 255, 0.125);
height: 50rem;
width: 91%;
display: ${props => props.isVisible ? 'none' : 'flex'};
align-items: center;
justify-content: center;
`;

export const StyledGiPadlock = styled(GiPadlock)<{isLocked: boolean}>`
width: 150px;
height: 150px;
color: #fff;
display: ${props => props.isLocked ? 'block' : 'none'};
transition: transform 0.3s;
&:hover{
  transform: rotate(-10deg);
  cursor: pointer;
}
`;


export const Input = styled.input`
border: none;
border-radius: 24px;
background: rgb(255 255 255 / 82%);
height: 44px;
width: 80%;
padding: 16px;
outline: none;
z-index: 9999;
@media screen and (max-width: 1024px) {
 width: 100%;
}
`;

export const ContainerPassword = styled.div<{isLocked: boolean}>`
width: 400px;
height: 400px;
display: ${props => props.isLocked ? 'none' : 'flex'};
align-items: center;
flex-direction: column;
z-index: 9999;
justify-content: center;
background: rgb(51 51 51 / 84%);
border-radius: 16px;
box-shadow: 0 4px 30px rgb(0 0 0 / 30%);
position: relative;
animation: slide-Box .8s linear normal 1 forwards;
transition: animation .4s;

@keyframes slide-Box {
  from {
    transform: scale(0.2);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
`;

export const TitlePassword = styled.p`
font-size: 2rem;
text-align: center;
color: #fff;
z-index: 9999;
padding: 3rem 2rem;
text-shadow: 2px 2px 4px rgb(38 19 156);
margin-top: -4rem;
`;

export const Error = styled.p`
font-size: 22px;
font-weight: bold;
text-align: center;
padding: 8px;
color: red;
width: 12rem;
height: 3rem;
text-shadow: 1px 1px 1px #080808;
`;

export const DivPadLock = styled.div`
display: flex;
justify-content: flex-end;
`;

export const StyledGiPadlockInternal = styled(GiPadlock)`
width: 50px;
height: 50px;
color: #000;
transition: transform 0.3s;
&:hover{
  transform: rotate(-10deg);
  cursor: pointer;
}
`;