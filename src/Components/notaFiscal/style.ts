import styled from "styled-components";
import { ContainerFlutuante, DivClose } from "../isEdit/style";

export const ContainerFlutuantePrint = styled(ContainerFlutuante)`
height: auto;
padding-top: 28px;
`;
export const Box = styled.div`
border: 1px solid #dddddd;
border-radius: 8px;
margin: 12px 0;
`;

export const DivSubHeader = styled.div`
display: flex;
justify-content: space-between;
margin: 1rem 0 1rem 0;
`;

export const Title = styled.h1`
text-align: center;
`;

export const TotalValue = styled.p`
font-size: 2rem;
font-weight: bold;
`;

export const DivClosePrint = styled(DivClose)`
top: -28px;
`;