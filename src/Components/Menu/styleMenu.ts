import styled from "styled-components";
import { Link as Scroll } from 'react-scroll';
import { Link as RouterDom } from "react-router-dom";


export const Box = styled.div`
width: 100%;
height: 4rem;
display: flex;
margin-top: 1rem;
`
export const ContainerMenu = styled.div`
display: flex;
width: 100%;
align-items: center;
justify-content: center;
`
export const ContainerList = styled.ul`
display: flex;
width: 60%;
justify-content: space-evenly;
`
export const NavLinkScroll = styled(Scroll)`
color: ${props => props.theme.paletteColor.colorDefault};
font-weight: bold;
font-size: 1.2rem;
cursor: pointer;
`
export const NavLinkRouterDom = styled(RouterDom)`
color: ${props => props.theme.paletteColor.colorDefault};
font-weight: bold;
font-size: 1.2rem;
`
export const ImageLogo = styled.img`
z-index: 1;
margin-top: 4rem;
transform: rotate(5deg);
`

export const Admin = styled.li`
position: absolute;
    right: 0;
    margin-right: 8rem;
`