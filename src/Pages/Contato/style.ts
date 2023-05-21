import styled from "styled-components";

export const Box = styled.div`
height: 100%;
display: flex;
justify-content: space-around;
position: relative;
align-items: center;
`

export const Imagem = styled.div`
position: absolute;
background-image: url('../../../src/assets/Image/fundo.jpg');
background-size: cover;
background-repeat: no-repeat;
background-position: center;
height: 20rem;
width: 100%;
top: 0;

  &::before {
    position: absolute;
    display: block;
    content: '';
    background-image: url('../../../src/assets/Image/derreter.png');
    background-repeat: no-repeat;
    width: 100%;
    height: 10rem;
    background-size: 100%;
    top: 0;
}
`;

export const ContainerAll = styled.div`
margin-top: 20rem;
width: 100%;
`

export const ContainerTitle = styled.div`
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
margin-top: 1rem;
`

export const Title =styled.h1`
font-size: 3rem;
`


export const ContainerContato = styled.div`
display: flex;
justify-content: space-evenly;
margin-top: 4rem;
`
export const ContainerBox = styled.div`
width: 30em;
height: 35rem;
background-color: rgb(163 163 163);
padding: 1rem;
background-color: #72000c;
border-radius: 1rem;
box-shadow: 5px 5px 11px 0px rgb(0 0 0 / 60%);
`

export const TitleBox = styled.h1`
color: #ffc107;
font-size: 3rem;
`

export const SubTitleBox = styled(TitleBox)`
font-size: 2.1rem;
`

export const ContainerIcons = styled.div`
margin-top: 1rem;
height: 20rem;
display: flex;
flex-direction: column;
justify-content: space-evenly;
`

export const Ancora = styled.a`
display: flex;
align-items: center;
color: white;
font-weight: bold;
font-size: 20px;
`