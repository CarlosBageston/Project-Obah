import { Box, ContainerMenu, ContainerList, NavLinkScroll, ImageLogo, NavLinkRouterDom, Admin } from './styleMenu';
import logo from '../../assets/Image/logo.png'
import { MdAdminPanelSettings } from 'react-icons/md'


export default function Menu() {


    return (
        <>
            <Box id='menu'>
                <ContainerMenu>
                    <ImageLogo src={logo} alt="logo" width={150} />
                    <ContainerList >
                        <li>
                            <NavLinkScroll
                                to={'slide'}
                                spy={true}
                                smooth={true}
                                offset={-70}
                                duration={500}
                                activeClass="active"
                            >
                                Sorvetes
                            </NavLinkScroll>
                        </li>
                        <li>
                            <NavLinkScroll
                                to={'sobrenos'}
                                spy={true}
                                smooth={true}
                                offset={-70}
                                duration={500}
                                activeClass="active"
                            >
                                Sobre nós
                            </NavLinkScroll>
                        </li>
                        <li>
                            <NavLinkRouterDom to={'/contato'} target={'_blank'}>
                                <p>Contato</p>
                            </NavLinkRouterDom> {/*colocar icone que indica outra tela*/}
                        </li>
                        <Admin>
                            <NavLinkRouterDom to={'/login'}>
                                <MdAdminPanelSettings
                                    size={30}
                                />
                            </NavLinkRouterDom>
                        </Admin>
                    </ContainerList>
                </ContainerMenu>
            </Box>
        </>
    )
}