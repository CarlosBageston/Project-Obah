import styled from "styled-components";
import { Link as Scroll } from 'react-scroll';
import { Link as RouterDom } from "react-router-dom";


export const Box = styled.div`
width: 100%;
height: 4rem;
display: flex;
margin-top: 1rem;
`
export const ContainerImage = styled.div`
display: flex;
width: 40%;
align-items: center;
justify-content: flex-end;
`;

export const ContainerMenu = styled.div`
width: 100%;
display: flex;
align-items: center;
@media (max-width: 750px) {
    flex-direction: column;
    align-items: flex-end;
    width: 60%;
    padding-right: 4rem;
    justify-content: flex-start;
}
`;

export const ContainerList = styled.ul`
display: flex;
width: 60%;
justify-content: space-evenly;
@media (max-width: 750px) {
    display: none ;
}
`
export const NavLinkScroll = styled(Scroll)`
color: ${props => props.theme.paletteColor.colorDefault};
font-weight: bold;
z-index: 5;
font-size: 1.2rem;
cursor: pointer;
`
export const NavLinkRouterDom = styled(RouterDom)`
color: ${props => props.theme.paletteColor.colorDefault};
font-weight: bold;
font-size: 1.2rem;
`;

export const ImageLogo = styled.img`
z-index: 1;
width: 15rem;
margin-right: -4.5rem;
margin-top: 3rem;
transform: rotate(5deg);
@media (max-width: 700px) {
    margin-top: 1rem;
}
@media (max-width: 1400px) and (min-width: 700px) {
    margin-right: -1.5rem;
}
`;

export const Admin = styled.li`
position: absolute;
    right: 0;
    margin-right: 8rem;
`;

export const ContainerMenuMobile = styled.div<{menuOpen: boolean}>`
display: none;
@media (max-width: 750px) {
    display: ${props => props.menuOpen ? 'flex' : 'none'};
    align-items: center;
    position: relative;
    z-index: 2;
    width: 23rem;
    backdrop-filter: blur(10px) saturate(100%);
    background-color: rgba(37, 15, 34, 0.8);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    flex-direction: column;
    margin-right: -3rem;
}
`;
export const ContainerButtonMobile = styled.div`
display: none;
@media (max-width: 750px) {
    display: flex ;
}
`;