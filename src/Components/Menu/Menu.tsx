import { Box, ContainerImage, ContainerList, NavLinkScroll, ImageLogo, NavLinkRouterDom, Admin, ContainerMenu, ContainerMenuMobile, ContainerButtonMobile } from './styleMenu';
import logo from '../../assets/Image/logo.png'
import { MdAdminPanelSettings, MdClose, MdMenu } from 'react-icons/md'
import { useState } from 'react';

/**
 * Componente que exibe o menu da aplicação.
 * O menu contém links para as seções "Queridinhos", "Sobre nós" e "Contato", além de um link para o painel de administração.
 */

export default function Menu() {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleMenuToggle = () => {
        setMenuOpen(!menuOpen);
    };

    const menuItems = [
        { to: 'maisVendidos', label: 'Queridinhos', duration: 500 },
        { to: 'sobrenos', label: 'Sobre nós', duration: 500 },
        { to: 'contato', label: 'Contato', duration: 600 },
    ];

    return (
        <>
            <Box id="menu">
                <ContainerImage>
                    <ImageLogo src={logo} alt="logo" />
                </ContainerImage>
                <ContainerMenu>
                    <ContainerList>
                        {menuItems.map(item => (
                            <li key={item.to}>
                                <NavLinkScroll
                                    to={item.to}
                                    spy={true}
                                    smooth={true}
                                    offset={-70}
                                    duration={item.duration}
                                    activeClass="active"
                                >
                                    {item.label}
                                </NavLinkScroll>
                            </li>
                        ))}
                        <Admin>
                            <NavLinkRouterDom to={'/login'} aria-label="Admin">
                                <MdAdminPanelSettings size={30} />
                            </NavLinkRouterDom>
                        </Admin>
                    </ContainerList>
                    <ContainerButtonMobile onClick={handleMenuToggle}>
                        {menuOpen ? <MdClose size={30} /> : <MdMenu size={30} />}
                    </ContainerButtonMobile>
                    <ContainerMenuMobile menuOpen={menuOpen} >
                        {menuOpen ? menuItems.map(item => (
                            <div key={item.to} style={{ padding: '18px 0 34px ' }}>
                                <li >
                                    <NavLinkScroll
                                        to={item.to}
                                        spy={true}
                                        smooth={true}
                                        offset={-70}
                                        duration={item.duration}
                                        activeClass="active"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {item.label}
                                    </NavLinkScroll>
                                </li>
                            </div>
                        )) : null}
                    </ContainerMenuMobile>
                </ContainerMenu>
            </Box>
        </>
    );
}