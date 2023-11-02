import styled from 'styled-components';


export const Box = styled.div`
background-color: #fb374b;
display: flex;
height: 10rem;
align-items: center;
justify-content: space-around;
position: relative;
margin-top: 3rem;

`;
export const ImageDetail = styled.img`
position: absolute;
top: 0;
left: 0;
width: 100%;
`;

export const Text = styled.p`
font-size: 14px;
color: #dfdfdf;
margin-top: 1rem;

@media screen and (max-width: 540px) {
    font-size: 10px;
    padding-left: 12px;
}
`;

export const Image = styled.img`
width: 7rem;
margin-top: 18px;

@media screen and (max-width: 540px) {
 width:90px ;
 margin: 8px;
}
`;
