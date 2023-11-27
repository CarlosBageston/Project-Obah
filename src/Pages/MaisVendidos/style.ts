import styled from "styled-components";

export const Box = styled.div`
height: 50vh;
background-color: #e79e10;
display: flex;
align-items: center;
justify-content: center;
position: relative;
flex-direction: column;

`

export const Title = styled.h1`
font-family: 'Lobster', cursive;
font-weight: 500;
font-size: 3rem;
margin-bottom: 3rem;
color: #fff;
text-shadow: 3px 3px 3px rgba(0, 0, 0, 1);
`

export const NameIceCream = styled.h1`
color: #fff;
text-shadow: 3px 3px 3px rgba(0, 0, 0, 1);
font-family: 'Lobster', cursive;
`;
export const ContainerAllImage = styled.div`
display: flex;
align-items: center;
justify-content: space-evenly;
width: 100%;
`;

export const ContainerImgName = styled.div`
display: flex;
flex-direction: column;
align-items: center;
`;

export const ImageDetailTop = styled.img`
position: absolute;
top: -20%;
left: 0;
width: 100%;
`;
export const ImageDetailBottom = styled.img`
position: absolute;
top: 98%;
left: 0px;
width: 100%;
transform: rotate(180deg);
`;