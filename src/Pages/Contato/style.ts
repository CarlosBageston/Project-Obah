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

// Estilos para o container
export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

// Estilos para o card
export const Card = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 350px;
  width: 300px;
  flex-direction: column;
  gap: 35px;
  border-radius: 15px;
  background: #e3e3e3;
  box-shadow: 16px 16px 32px #c8c8c8, -16px -16px 32px #fefefe;
  border-radius: 8px;
`;

// Estilos para os input boxes
export const InputBox = styled.div`
  position: relative;
  width: 250px;
`;

export const Label = styled.span`
  margin-top: 5px;
  position: absolute;
  left: 0;
  transform: translateY(-4px);
  margin-left: 10px;
  padding: 10px;
  pointer-events: none;
  font-size: 12px;
  color: #000;
  text-transform: uppercase;
  transition: 0.5s;
  letter-spacing: 3px;
  border-radius: 8px;
`;

export const InputStyle = styled.input`
  width: 100%;
  padding: 10px;
  outline: none;
  border: none;
  color: #000;
  font-size: 1em;
  background: transparent;
  border-left: 2px solid #000;
  border-bottom: 2px solid #000;
  transition: 0.1s;
  border-bottom-left-radius: 8px;
   &:focus ~ ${Label} {
  transform: translateX(113px) translateY(-15px);
  font-size: 0.8em;
  padding: 5px 10px;
  background: #000;
  letter-spacing: 0.2em;
  color: #fff;
  border: 2px;
  }
  &:focus{
    
  border: 2px solid #000;
  border-radius: 8px;
  }
`;



// Estilos para o botão de entrada
export const EnterButton = styled.button`
  height: 45px;
  width: 100px;
  border-radius: 5px;
  border: 2px solid #000;
  cursor: pointer;
  background-color: transparent;
  transition: 0.5s;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 2px;
  margin-bottom: 3em;
  
  &:hover {
    background-color: rgb(0, 0, 0);
    color: white;
  }
`;

export const SignupLink = styled.a`
  color: #000;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: block;
  font-weight: bold;
  font-size: x-large;
  margin-top: 1.5em;
`;