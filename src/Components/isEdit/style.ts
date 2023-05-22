import styled from "styled-components";

export const BoxUp = styled.div`
width: 80%;
height: 15rem;
display: flex;
flex-direction: column;
-webkit-box-pack: justify;
justify-content: space-between;
-webkit-box-align: stretch;
align-items: stretch;
overflow-x: auto;
padding-top: 1rem;
::-webkit-scrollbar {
      width: 8px; /* largura da barra de rolagem */
      background-color: #f0f0f0; /* cor do fundo da barra de rolagem */
    }

    ::-webkit-scrollbar-thumb {
      background-color: #9999; /* cor da barra de rolagem */
      border-radius: 4px; /* borda arredondada da barra de rolagem */
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: #999; /* cor da barra de rolagem ao passar o mouse */
    }

    ::-webkit-scrollbar-track {
      background-color: #f0f0f0; /* cor do fundo da trilha da barra de rolagem */
    }

    ::-webkit-scrollbar-track:hover {
      background-color: #d3d3d3; /* cor do fundo da trilha ao passar o mouse */
    }
`;
export const ContainerFlutuante = styled.div`
position: absolute;
display: flex;
width: 600px;
height: 650px;
top: 12%;
left: 32%;
background-color: #ffffff;
border-radius: 8px;
box-shadow: 1px 4px 5px 1px #00000070;
justify-content: space-around;
align-items: center;
flex-direction: column;
animation: scale-in-hor-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) 200ms both;
@keyframes scale-in-hor-center {
  0% {
    transform: scaleX(0);
    opacity: 1;
  }
  100% {
    transform: scaleX(1);
    opacity: 1;
  }
}
`;

export const Paragrafo = styled.p`
width: 30rem;
font-size: 16px;
text-align: center;
`;

export const ContianerMP = styled.div`
height: 16rem;
overflow-y: auto;
`;

export const DivLineMP = styled.div`
display: flex;
align-items: center;
justify-content: flex-start;
width: 30rem;
margin-top: 2rem;
height: 45px;
`;

export const ButtonStyled = styled.button`
  --color: #7371f2;
  padding: 0.8em 1.7em;
  background-color: transparent;
  border-radius: .3em;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: .5s;
  font-weight: bold;
  font-size: 17px;
  border: 1px solid;
  font-family: inherit;
  text-transform: uppercase;
  color: var(--color);
  z-index: 1;
  margin-bottom: 1rem;

  &::before,
  &::after {
    content: '';
    display: block;
    width: 50px;
    height: 50px;
    transform: translate(-50%, -50%);
    position: absolute;
    border-radius: 50%;
    z-index: -1;
    background-color: var(--color);
    transition: 1s ease;
  }

  &::before {
    top: -1em;
    left: -1em;
  }

  &::after {
    left: calc(100% + 1em);
    top: calc(100% + 1em);
  }

  &:hover::before,
  &:hover::after {
    height: 410px;
    width: 410px;
  }

  &:hover {
    color: white;
  }

  &:active {
    filter: brightness(.8);
  }
`;

