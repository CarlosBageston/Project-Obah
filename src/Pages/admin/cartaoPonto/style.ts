import styled from "styled-components";

export const Box = styled.div`
height: 100%;
min-height: 64vh;
`;

export const BoxDate = styled.div`
width: 40rem;
display: flex;
justify-content: space-around;
`;

export const DivFull = styled.div`
display: flex; 
margin-top: 3rem; 
align-items: center; 
justify-content: center;
`;

export const DivTable = styled.div`
display: flex;
align-items: center;
justify-content: center;
margin-top: 5rem;
flex-direction: column;
`;

export const TotalValue = styled.p`
margin-left: 13.5rem;
margin-top: 2rem;
font-size: 2rem;
font-weight: 700;
`;

export const DivTableTitle = styled.div`
display: flex;
width: 80%;
justify-content: space-around;
border: 1px solid #004e85;
border-top-right-radius: 4px;
border-top-left-radius: 4px;
padding: 8px;
`;

export const DivTableBody = styled.div`
display: flex;
flex-direction: column;
max-height: 24rem;
width: 80%;
overflow-y: auto;
border-left: 1px solid #004e85;
border-right: 1px solid #004e85;
`;

export const DivTableRow = styled.div`
display: flex;
justify-content: space-around;
border-bottom: 1px solid #004e85;
padding: 8px;
`;