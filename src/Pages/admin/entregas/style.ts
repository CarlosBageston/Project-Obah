import styled from "styled-components";
import { TitleDefault } from "../cadastroClientes/style";

export const Box = styled.div`
height: 100%;
`;

export const Title = styled(TitleDefault)``;

export const TextTable = styled.p`
font-size: 20px;
font-weight: bold;
padding: 24px 8px 8px 8px;
`

export const DivProduto = styled.div`
display: flex;
align-items: center;
padding-bottom: 8px;
margin-top: 4px;
margin-bottom: 6px;
height: 3rem;
`;
export const NameProduto = styled.div`
width: 18rem;
padding: 34px 8px 0 8px;
border: 2px solid #6a93ed;
border-top: none;
`;
export const ValueProduto = styled.div`
width: 10rem;
padding: 34px 8px 0 8px;
border: 2px solid #6a93ed;
border-top: none;
border-left: none;
`;
export const QntProduto = styled.div`
width: 10rem;
padding: 0 8px;
border: 2px solid #6a93ed;
border-top: none;
border-left: none;
height: 6rem;
display: flex;
align-items: flex-end;
`;
export const ResultProduto = styled.div`
width: 10rem;
padding: 34px 8px 0 8px;
border: 2px solid #6a93ed;
border-top: none;
border-left: none;
`;

export const ContainerTableCliente = styled.div<{isVisible?: boolean}>`
overflow: auto;
height: 19rem;
display: flex;
width: 42.25rem;
justify-content: flex-start;
opacity: ${({ isVisible }) => isVisible ? 0 : 1};
flex-direction: column;
margin-top: -8px;

::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background-color: #F5F5F5;
  }
::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
  }
::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`;

export const ContainerCliente = styled.div`
display: flex;
  align-items: center;
  justify-content: center;
  width: 40rem;
  position: relative;
`;


export const ContainerAll = styled.div`
display: flex;
padding: 0 4rem 0 4rem;
`;
export const DivButtonAndTable = styled.div`
display: flex;
flex-direction: column;
align-items: flex-end;
`;

export const DivInputs = styled.div`
display: flex;
width: 37rem;
justify-content: space-around;
`;
export const BoxLabels = styled.div<{isVisible?: boolean}>`
display: flex;
width: 100%;
padding-bottom: 8px;
opacity: ${({ isVisible }) => isVisible ? 0 : 1};
`;
export const DivColumn = styled.div<{scrollActive: boolean}>`
padding: 8px;
width: ${({scrollActive}) => scrollActive ? '15.45rem' : '15.6rem'} ;
border: 2px solid #6a93ed;
border-radius: 20px;
background-color: rgba(106, 147, 237, 0.13);
display: flex;
align-items: center;
justify-content: center;
box-shadow: 0px 9px 11px -5px rgb(106, 147, 237);
margin-left: -2px;
`;

export const DivColumnPrice = styled(DivColumn)`
 width:${({scrollActive}) => scrollActive ? '8.75rem' : '8.89rem'}  
`;
export const DivColumnQntTotal = styled(DivColumn)`
width: ${({scrollActive}) => scrollActive ? '8.7rem' : '8.81rem'}
`;
export const DivColumnTotal = styled(DivColumn)`
width: ${({scrollActive}) => scrollActive ? '8.88rem' : '8.95rem'}
`;

export const LabelsHeader = styled.p`
font-weight: bold;
color: #333333;
text-transform: uppercase;
font-size: 16px;
margin: 0;
`;

export const DivButtons = styled.div`
display: flex;
align-items: center;
justify-content: space-around;
width: 19rem;
`;

export const DivFlutuante = styled.div`
height: 23px;
margin-top: 19px;
border: 1px solid rgb(106, 147, 237);
`;