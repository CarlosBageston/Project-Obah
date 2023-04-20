import * as React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Link, Outlet } from 'react-router-dom';
import {
    BoxTitle,
    Title,
    Image,
    StyledListItemButton,
    StyledListItemText,
    Button
} from './style';

import { RiMenuUnfoldFill } from 'react-icons/ri'
import logo from '../../assets/Image/logo.png';

//import de icon para menu
import vendas from '../../assets/Icon/acquisition.png';
import entrega from '../../assets/Icon/entrega-rapida.png';
import compra from '../../assets/Icon/checklist.png';
import dashboard from '../../assets/Icon/dashboard.png';
import produto from '../../assets/Icon/add-product.png';
import cliente from '../../assets/Icon/user.png';
import estoque from '../../assets/Icon/stock.png';

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

export default function MenuLateral() {
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };
    const list = () => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
        >
            <List>
                <Link to="/dashboard" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <ListItemIcon>
                            <Image src={dashboard} alt="Dashboard" width={32} />
                        </ListItemIcon>
                        <StyledListItemText primary="Dashboard" />
                    </StyledListItemButton>
                </Link>
                <Link to="/compras" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <ListItemIcon>
                            <Image src={compra} alt="Novas Compras" width={32} />
                        </ListItemIcon>
                        <StyledListItemText primary="Novas Compras" />
                    </StyledListItemButton>
                </Link>
                <Link to="/cadastro-produto" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <ListItemIcon>
                            <Image src={produto} alt="Cadastro Produto" width={32} />
                        </ListItemIcon>
                        <StyledListItemText primary="Cadastro Produto" />
                    </StyledListItemButton>
                </Link>
                <Link to="/cadastro-cliente" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <ListItemIcon>
                            <Image src={cliente} alt="cadastro cliente" width={32} />
                        </ListItemIcon>
                        <StyledListItemText primary="Cadastro Cliente" />
                    </StyledListItemButton>
                </Link>
                <Link to="/vendas" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <ListItemIcon>
                            <Image src={vendas} alt="Painel de venda" width={32} />
                        </ListItemIcon>
                        <StyledListItemText primary="Painel de venda" />
                    </StyledListItemButton>
                </Link>
                <Link to="/entregas" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <ListItemIcon>
                            <Image src={entrega} alt="Entregas" width={32} />
                        </ListItemIcon>
                        <StyledListItemText primary="Entregas" />
                    </StyledListItemButton>
                </Link>
                <Link to="/estoque" style={{ textDecoration: 'none', color: 'white' }}>
                    <StyledListItemButton>
                        <ListItemIcon>
                            <Image src={estoque} alt="Estoque" width={32} />
                        </ListItemIcon>
                        <StyledListItemText primary="Estoque" />
                    </StyledListItemButton>
                </Link>
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
                            <img src={logo} alt="Logo da empresa" width={100} />
                            <Title>Sorveteria Obah!</Title>
                        </BoxTitle>
                    ) : (
                        <img src={logo} alt="mini logo" width={60} style={{ marginLeft: 4 }} />
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
