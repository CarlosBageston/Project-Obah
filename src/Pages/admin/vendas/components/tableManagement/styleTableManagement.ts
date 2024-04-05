import styled from 'styled-components';

export const ContainerFlutuante = styled.div`
position: absolute;
display: flex;
width: 80%;
height: 70%;
top: 22.4%;
left: 9%;
background-color: #ffffff;
border-radius: 8px;
box-shadow: 1px 4px 5px 1px #00000070;
justify-content: space-around;
align-items: center;
flex-direction: column;
z-index: 5;
animation: scale-up-tr 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
@keyframes scale-up-tr {
  0% {
        transform: scale(0.2);
        transform-origin: 100% 0%;
  }
  100% {
        transform: scale(1);
        transform-origin: 100% 0%;
  }
}
`;

export const BoxTable = styled.div<{empty: boolean}>`
width: 100%;
height: 80%;
display: grid;
grid-template-columns: ${props => props.empty ? 'none' : 'repeat(3, 1fr)'};
grid-auto-rows:  ${props => props.empty ? 'none' : '150px'};
grid-column-gap: 20px;
grid-row-gap: 20px;
align-items: center;
justify-items: center;
overflow: auto;
`;

export const BoxTableHeader = styled.div`
width: 100%;
display: grid;
height: 20%;
place-items: center;
grid-template-columns: repeat(3, 1fr);
`;

export const ContainerFlutuanteNewTable = styled.div`
position: absolute;
display: flex;
width: 20%;
height: 50%;
top: 13.5%;
left: 9.5%;
background-color: #ffffff;
border-radius: 8px;
box-shadow: 1px 4px 5px 1px #00000070;
justify-content: space-around;
align-items: center;
flex-direction: column;
z-index: 5;
animation: scale-up-tr 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
@keyframes scale-up-tr {
  0% {
        transform: scale(0.2);
        transform-origin: 0% 0%;
  }
  100% {
        transform: scale(1);
        transform-origin: 0% 0%;
  }
}
`;

export const BoxButton = styled.div`
display: flex;
align-items: center;
width: 100%;
justify-content: center;
`;

export const BoxButtonIcon = styled.div`
padding: 8px;
margin-left: 1rem;
cursor: pointer;
&:hover {
    background-color: #f3f3f394
}
`;

export const BoxTableEmpty = styled.div`
display: flex;
align-items: center;
flex-direction: column;

`;
