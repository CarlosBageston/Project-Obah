import { Box, ContainerMenu, ContainerList, NavLinkScroll, ImageLogo, NavLinkRouterDom, Admin } from './styleMenu';
import logo from '../../assets/Image/logo.png'
import { MdAdminPanelSettings } from 'react-icons/md'

/**
 * Componente que exibe o menu da aplicação.
 * O menu contém links para as seções "Queridinhos", "Sobre nós" e "Contato", além de um link para o painel de administração.
 */

export default function Menu() {
    return (
        <>
            <Box id='menu'>
                <ContainerMenu>
                    <ImageLogo src={logo} alt="logo" width={150} />
                    <ContainerList >
                        <li>
                            <NavLinkScroll
                                to={'maisVendidos'}
                                spy={true}
                                smooth={true}
                                offset={-70}
                                duration={500}
                                activeClass="active"
                            >
                                Queridinhos
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
                            <NavLinkScroll
                                to={'contato'}
                                spy={true}
                                smooth={true}
                                offset={-70}
                                duration={600}
                                activeClass="active"
                            >
                                Contato
                            </NavLinkScroll>
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