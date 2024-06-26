import { useState } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import { Link, Outlet } from 'react-router-dom';
import logo from '../../assets/Image/logo-admin.png';
import ListItemIcon from '@mui/material/ListItemIcon';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';

//import de icon para menu
import cliente from '../../assets/Icon/user.png';
import estoque from '../../assets/Icon/stock.png';
import compra from '../../assets/Icon/checklist.png';
import vendas from '../../assets/Icon/acquisition.png';
import dashboard from '../../assets/Icon/dashboard.png';
import produto from '../../assets/Icon/add-product.png';
import entrega from '../../assets/Icon/entrega-rapida.png';
import colaborador from '../../assets/Icon/employee.png';
import gestao from '../../assets/Icon/gestao.png'
import cartaoPonto from '../../assets/Icon/cartao-ponto.png'

import {
    Image,
    Title,
    Button,
    BoxTitle,
    StyledListItemText,
    StyledListItemButton,
    StyledListItemButtonSubOpcao,
    Icon,
    Box
} from './style';
import { Tooltip } from '@mui/material';



const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundImage: 'linear-gradient(to right bottom, #2e294e, #2e2858, #2f2761, #2f256b, #2f2374)',
    overflowY: 'visible'
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
    backgroundImage: 'linear-gradient(to right bottom, #2e294e, #2e2858, #2f2761, #2f256b, #2f2374)',
    overflowY: 'hidden',
    '&::-webkit-scrollbar': {
        height: '0px',
        backgroundImage: 'linear-gradient(to right bottom, #2e294e, #2e2858, #2f2761, #2f256b, #2f2374)',
    },
});

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
    width: '4rem',
    left: 70,
    backgroundColor: 'transparent',
    boxShadow: 'none',
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),

);

/**
 * Componente que exibe um menu lateral com opções de navegação.
 * O menu inclui links para as seguintes páginas: Dashboard, Atualizar Estoque,
 * Cadastro de Produto, Cadastro de Cliente, Painel de Venda, Entregas e Estoque.
 * O menu pode ser aberto e fechado, exibindo ou ocultando as opções de navegação.
 */

export default function MenuLateral() {
    const [open, setOpen] = useState(false);
    const [openSubOpcao, setOpenSubOpcao] = useState<boolean>(false);

    const handleClick = () => {
        setOpenSubOpcao(!openSubOpcao);
        setOpen(true);
    };
    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
        setOpenSubOpcao(false)
    };
    const list = () => (
        <Box
            sx={{ width: 240 }}
            role="presentation"
        >
            <List>
                <Link to="/dashboard" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <Tooltip
                            title={"Dashboard"}
                        >
                            <ListItemIcon>
                                <Image src={dashboard} alt="Dashboard" width={32} />
                            </ListItemIcon>
                        </Tooltip>
                        <StyledListItemText primary="Dashboard" />
                    </StyledListItemButton>
                </Link>
                <Link to="/cadastro-produto" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <Tooltip
                            title={"Cadastro Produto"}
                        >
                            <ListItemIcon>
                                <Image src={produto} alt="Cadastro Produto" width={30} />
                            </ListItemIcon>
                        </Tooltip>
                        <StyledListItemText primary="Cadastro Produto" />
                    </StyledListItemButton>
                </Link>
                <Link to="/atualizar-estoque" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <Tooltip
                            title={"Atualizar Estoque"}
                        >
                            <ListItemIcon>
                                <Image src={compra} alt="Atualizar Estoque" width={30} />
                            </ListItemIcon>
                        </Tooltip>
                        <StyledListItemText primary="Atualizar Estoque" />
                    </StyledListItemButton>
                </Link>
                <Link to="/cadastro-cliente" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <Tooltip
                            title={"Cadastro Cliente"}
                        >
                            <ListItemIcon>
                                <Image src={cliente} alt="cadastro cliente" width={30} />
                            </ListItemIcon>
                        </Tooltip>
                        <StyledListItemText primary="Cadastro Cliente" />
                    </StyledListItemButton>
                </Link>
                <Link to="/vendas" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <Tooltip
                            title={"Painel de venda"}
                        >
                            <ListItemIcon>
                                <Image src={vendas} alt="Painel de venda" width={30} />
                            </ListItemIcon>
                        </Tooltip>
                        <StyledListItemText primary="Painel de venda" />
                    </StyledListItemButton>
                </Link>
                <Link to="/entregas" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <Tooltip
                            title={"Entregas"}
                        >
                            <ListItemIcon>
                                <Image src={entrega} alt="Entregas" width={30} />
                            </ListItemIcon>
                        </Tooltip>
                        <StyledListItemText primary="Entregas" />
                    </StyledListItemButton>
                </Link>
                <Link to="/estoque" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <Tooltip
                            title={"Estoque"}
                        >
                            <ListItemIcon>
                                <Image src={estoque} alt="Estoque" width={30} />
                            </ListItemIcon>
                        </Tooltip>
                        <StyledListItemText primary="Estoque" />
                    </StyledListItemButton>
                </Link>
                <StyledListItemButton onClick={handleClick}>
                    <Tooltip
                        title={"Gestão"}
                    >
                        <ListItemIcon>
                            <Image src={gestao} alt="Gestão" width={30} />
                        </ListItemIcon>
                    </Tooltip>
                    <StyledListItemText primary="Gestão" />
                    <Icon opensubopcao={openSubOpcao.toString()} />
                </StyledListItemButton>
                {openSubOpcao &&
                    <div style={{ backgroundColor: '#3b2e87' }}>
                        <Link to="/colaborador" style={{ textDecoration: 'none', color: 'white' }} onClick={handleClick}>
                            <StyledListItemButtonSubOpcao>
                                <ListItemIcon>
                                    <Image src={colaborador} alt="Colaborador" width={30} />
                                </ListItemIcon>
                                <StyledListItemText primary="Colaborador" />
                            </StyledListItemButtonSubOpcao>
                        </Link>
                        <Link to="/cartao-ponto" style={{ textDecoration: 'none', color: 'white' }} onClick={handleClick}>
                            <StyledListItemButtonSubOpcao>
                                <ListItemIcon>
                                    <Image src={cartaoPonto} alt="Cartão Ponto" width={30} />
                                </ListItemIcon>
                                <StyledListItemText primary="Cartão Ponto" />
                            </StyledListItemButtonSubOpcao>
                        </Link>
                    </div>
                }
            </List>
        </Box>
    );
    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" open={open}>
                <Button
                    onClick={handleDrawerOpen}
                    open={open}
                >
                    <span className="icon">
                        <svg viewBox="0 0 175 80" width="30" height="30">
                            <rect width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                            <rect y="30" width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                            <rect y="60" width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                        </svg>
                    </span>
                    <span className="text">MENU</span>
                </Button>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <div onClick={handleDrawerClose}>
                    {open ? (
                        <BoxTitle>
                            <img src={logo} alt="Logo da empresa" width={220} />
                            <Title>Sorveteria Obah!</Title>
                        </BoxTitle>
                    ) : (
                        <img src={logo} alt="mini logo" width={70} />
                    )}
                </div>
                <Divider color="#fafafad4" />
                {list()}
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }} onClick={handleDrawerClose}>
                <Outlet />
            </Box>
        </Box>
    );
}
