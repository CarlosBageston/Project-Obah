import styled from "styled-components";

export const Box = styled.div`
height: 100%;
background-color: #e79e10;
display: flex;
align-items: center;
justify-content: center;
position: relative;
flex-direction: column;

`;

export const Title = styled.h1`
font-family: 'Lobster', cursive;
font-weight: 500;
font-size: 3rem;
margin-bottom: 3rem;
color: #fff;
text-shadow: 3px 3px 3px rgba(0, 0, 0, 1);
`;

export const NameIceCream = styled.h1`
color: #fff;
text-shadow: 3px 3px 3px rgba(0, 0, 0, 1);
font-family: 'Lobster', cursive;

@media (max-width: 700px) {
    font-size: 24px;
}
`;
export const ContainerAllImage = styled.div`
display: flex;
align-items: center;
justify-content: space-evenly;
width: 100%;
margin-bottom: 4rem;
flex-wrap: wrap;
`;

export const ContainerImgName = styled.div`
display: flex;
flex-direction: column;
align-items: center;
padding: 8px;
`;

export const ImageDetailTop = styled.img`
margin-top: -5%;
width: 100%;
`;
export const ImageDetailBottom = styled.img`
width: 100%;
margin-bottom: -5%;
transform: rotate(180deg);
`;