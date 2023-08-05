import styled, { css } from "styled-components";

export const Box = styled.div`
height: 50vh;
background-color: #40cad8;
display: flex;
align-items: center;
justify-content: center;
position: relative;
flex-direction: column;

&::before {
    display: block;
    position: absolute;
    content: '';
    background-image: url('../../../src/assets/Svg/transition.svg');
    width: 100%;
    height: 5rem;
    background-size: 100%;
    background-repeat: no-repeat;    
    top: -70px;
}
&::after{
    display: block;
    position: absolute;
    content: '';
    background-image: url('../../../src/assets/Svg/transition.svg');
    width: 100%;
    height: 5rem;
    background-size: 100%;
    background-repeat: no-repeat;
    top: 98%;
    transform: rotate(180deg);
}
`

export const Title = styled.h1`
font-family: 'DynaPuff', cursive;
font-weight: 500;
font-size: 3rem;
margin-bottom: 3rem;
color: #fffa00;
text-shadow: 3px 3px 3px rgba(0, 0, 0, 1);
`

export const NameIceCream = styled.h1`
color: #fffa00;
text-shadow: 3px 3px 3px rgba(0, 0, 0, 1);
font-family: 'DynaPuff', cursive;
`;
export const ContainerAllImage = styled.div`
display: flex;
align-items: center;
justify-content: space-evenly;
width: 100%;
`
export const ContainerImgName = styled.div`
display: flex;
flex-direction: column;
align-items: center;
`