import styled from 'styled-components';


export const Box = styled.div`
height: 100vh;
width: 100%;
display: flex;
align-items: center;
justify-content: center;
background-image: linear-gradient(to left top, #78a7ee, #a796e9, #d47fd0, #f26aa5, #fb6070);
@media screen and (max-width: 1024px) {
  justify-content: center;
}
`;

export const Image = styled.img`
 width: 400px;
margin-top: 280px;
position: absolute;
bottom: 0;
left: 0;
animation: slide-picole .8s linear normal 1 forwards;
transition: animation .4s;
@keyframes slide-picole {
  from {
    margin-left: -500px;
    opacity: 0;
  }
  to {
    margin-left: 0;
    opacity: 1;
  }
}
@media screen and (max-width: 540px) {
  width: 250px;
}
 @media screen and ((min-width: 541px) and (max-width: 1024px)) {
  width: 400px;
}
`;

export const Container = styled.div`
width: 400px;
height: 400px;
display: flex;
align-items: center;
flex-direction: column;
justify-content: center;
background: rgba(255, 255, 255, 0.12);
border-radius: 16px;
box-shadow: 0 4px 30px rgb(0 0 0 / 30%);
position: relative;
animation: slide-Box .8s linear normal 1 forwards;
transition: animation .4s;
@keyframes slide-Box {
  from {
    margin-top: -700px;
    background: rgb(200 1 1 / 12%);
    opacity: 0;
  }
  to {
    margin-top: 0;
    background: rgba(255, 255, 255, 0.12) ;
    opacity: 1;
  }
}
@media screen and (max-width: 1024px) {
  width: 85%;
  height: 400px;
  }
`;

export const Title = styled.h1 `
font-size: 52px;
color: white;
@media screen and (max-width: 1024px) {
  font-size: 32px;
}
`;

export const DivInput = styled.div`
display: flex;
flex-direction: column;
`;

export const Input = styled.input`
border: none;
border-radius: 24px;
background: #ffffff6b;
height: 44px;
width: 100%;
margin-top: 24px;
padding: 16px;
outline: none;
@media screen and (max-width: 1024px) {
 width: 100%;
}
`;

export const Error = styled.p`
font-size: 16px;
text-align: center;
padding: 12px;
color: red;
`;

export const Button = styled.button`
 --primary-color: #645bff;
  --secondary-color: #fff;
  --hover-color: #111;
  --arrow-width: 10px;
  --arrow-stroke: 2px;
  box-sizing: border-box;
  border: 0;
  border-radius: 20px;
  color: var(--secondary-color);
  padding: 1em 1.8em;
  background: var(--primary-color);
  display: flex;
  transition: 0.2s ;
  align-items: center;
  gap: 0.6em;
  font-weight: bold;
  cursor: pointer;

  .arrow-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .arrow {
    margin-top: 1px;
    width: var(--arrow-width);
    background: var(--primary-color);
    height: var(--arrow-stroke);
    position: relative;
    transition: 0.2s;
  }

  .arrow::before {
    content: "";
    box-sizing: border-box;
    position: absolute;
    border: solid var(--secondary-color);
    border-width: 0 var(--arrow-stroke) var(--arrow-stroke) 0;
    display: inline-block;
    top: -3px;
    right: 3px;
    transition: 0.2s;
    padding: 3px;
    transform: rotate(-45deg);
  }

  &:hover {
    background-color: var(--hover-color);
  }

  &:hover .arrow {
    background: var(--secondary-color);
  }

  &:hover .arrow:before {
    right: 0;
  }
`;