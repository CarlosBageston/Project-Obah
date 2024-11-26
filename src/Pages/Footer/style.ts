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
top: -1px;
left: 0;
width: 98%;
margin-left: 2%;
`;

export const DivText = styled.div`
margin-left: -35rem;
@media (max-width: 700px){
    margin-left: 0;
}
`;

export const Text = styled.p`
font-size: 14px;
color: #dfdfdf;
margin-top: 1rem;

@media (max-width: 700px) {
    font-size: 10px;
    padding-left: 12px;
}
`;

export const Image = styled.img`
width: 12rem;
margin-top: 18px;

@media (max-width: 700px) {
 width: 10rem;
 margin: 8px;
}
`;
