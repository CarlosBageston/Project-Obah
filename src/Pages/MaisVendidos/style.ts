import styled, { css } from "styled-components";

export const Box = styled.div`
height: 50vh;
background-color: #40cad8;
display: flex;
align-items: center;
justify-content: center;
position: relative;

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
    top: 456px;
    transform: rotate(180deg);
}
`
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