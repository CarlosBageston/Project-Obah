import styled from "styled-components";

export const Box = styled.div`
height: 140vh;
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
`

export const CotainerSobre = styled.div`
width: 33rem;
`
export const CotainerSlide = styled.div`
width: 25rem;
margin-left: -10rem;
`

export const ContainerAllMap = styled.div`
display: flex;
padding-bottom: 6rem;
padding-top: 6rem;
justify-content: space-evenly;
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
`

export const ContainerIcons = styled.div`
display: flex;
justify-content: space-between;
width: 13rem;
`

 