import styled from 'styled-components';


export const ContainerComanda = styled.div`
position: absolute;
display: flex;
width: 40%;
height: 90%;
top: 5%;
left: 35%;
background-color: #ffffff;
border-radius: 8px;
box-shadow: 1px 4px 5px 1px #00000070;
justify-content: space-around;
align-items: center;
flex-direction: column;
z-index: 5;
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

export const BoxButton = styled.div` 
height: 25%;
display: flex;
flex-direction: column;
justify-content: space-around;
align-items: center;
`;

export const BoxAddProduct = styled.div`
display: flex;
align-items: center;
justify-content: space-around;
width: 90%;
`;

export const BoxList = styled.div`
width: 90%;
`;
export const BoxProduct = styled.div`
overflow-y: auto;
width: 100%;
height: 13rem;
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

export const DivLi = styled.div`
display: flex;
align-items: center;
justify-content: space-between;
width: 100%;
color: ${props => props.theme.paletteColor.primaryGreen};
font-weight: 600;
`;
export const BoxNameProduct = styled.div`
display: flex;
`;

export const Title = styled.p`
color: ${props => props.theme.paletteColor.tertiaryBlue};
font-size: 1rem;
font-weight: bold;
`
export const ContainerTitle = styled.div`
display: flex;
align-items: center;
padding-right: 8px;
justify-content: space-between;
`

export const TextTotal = styled.p`
font-size: 1.5rem;
`;

export const LiValor = styled.li`
width: 5rem;
display: flex;
justify-content: flex-end;
`;