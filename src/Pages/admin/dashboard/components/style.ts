import styled from 'styled-components';


export const ContainerFlutuante = styled.div`
position: absolute;
display: flex;
width: 90%;
height: 34%;
top: 80px;
left: 18px;
background-color: #ffffff;
border-radius: 8px;
box-shadow: 1px 4px 5px 1px #00000070;
justify-content: space-around;
align-items: center;
flex-direction: column;
z-index: 5;
animation: scale-up-ver-top 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
@keyframes scale-up-ver-top {
  0% {
    -webkit-transform: scaleY(0.4);
            transform: scaleY(0.4);
    -webkit-transform-origin: 100% 0%;
            transform-origin: 100% 0%;
  }
  100% {
    -webkit-transform: scaleY(1);
            transform: scaleY(1);
    -webkit-transform-origin: 100% 0%;
            transform-origin: 100% 0%;
  }
}
`;
