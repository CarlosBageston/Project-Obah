import styled from "styled-components";
import { Link } from 'react-scroll';
import { BsFillArrowUpCircleFill } from 'react-icons/bs';

export const Box = styled(Link)`
position: fixed;
bottom: 20%;
right: 5rem;
width: 10rem;
display: flex;
justify-content: space-evenly;
background-color: black;
border-radius: 2rem;
height: 3rem;
align-items: center;
cursor: pointer;
z-index: 9999;

@media (max-width: 700px) {
    right: 3rem;
    width: 8rem;
}
`

export const StyledIcon = styled(BsFillArrowUpCircleFill)`
  color: #ffff;
  font-size: 24px;
@media (max-width: 700px) {
  font-size: 18px;
}
`;
export const Title = styled.p`
  color: #ffff;
  font-size: 1.1rem;
@media (max-width: 700px) {
  font-size: 1rem;
}
`;