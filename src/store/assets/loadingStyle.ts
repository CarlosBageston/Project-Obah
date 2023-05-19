import styled, { keyframes } from 'styled-components';


export const Box = styled.div`
height: 100vh;
width: 100%;
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
`;
const dotsAnimation = keyframes`
   16.67% {
      box-shadow: -67.2px 16.8px, -67.2px 16.8px, 21.3px 16.8px;
   }

   33.33% {
      box-shadow: -67.2px 16.8px, 0px 16.8px, 21.3px 16.8px;
   }

   40%, 60% {
      box-shadow: -21.3px 16.8px, 0px 16.8px, 21.3px 16.8px;
   }

   66.67% {
      box-shadow: -21.3px 16.8px, 0px 16.8px, 67.2px 16.8px;
   }

   83.33% {
      box-shadow: -21.3px 16.8px, 67.2px 16.8px, 67.2px 16.8px;
   }

   100% {
      box-shadow: 67.2px 16.8px, 67.2px 16.8px, 67.2px 16.8px;
   }
`;

export const Dots = styled.div`
   width: 13.4px;
   height: 13.4px;
   border-radius: 50%;
   clip-path: inset(-50.4px);
   color: #474bff;
   box-shadow: -67.2px 16.8px, -67.2px 16.8px, -67.2px 16.8px;
   transform: translateY(-16.8px);
   animation: ${dotsAnimation} 1s infinite linear;
`;