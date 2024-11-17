import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { Theme, CSSObject } from '@mui/material/styles';
import { styled as muiStyled } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Box, Collapse, IconButton, LinearProgress } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';

// Importando ícones e logo
import logo from '../../assets/Image/logo-admin.png';
import cliente from '../../assets/Icon/user.png';
import estoque from '../../assets/Icon/stock.png';
import compra from '../../assets/Icon/checklist.png';
import vendas from '../../assets/Icon/coupon.png';
import dashboard from '../../assets/Icon/dashboard.png';
import produto from '../../assets/Icon/add-product.png';
import entrega from '../../assets/Icon/entrega-rapida.png';
import gestao from '../../assets/Icon/gestao.png';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LogoutIcon from '@mui/icons-material/Logout';

import {
    Button,
    StyledListItemText,
    StyledListItemButton,
    Image,
} from './style';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage } from '../../store/reducer/reducer';
import { RootState } from '../../store/reducer/store';
import CustomSnackBar, { StateSnackBar } from '../snackBar/customsnackbar';
import Admin from '../../Pages/signup/authentication';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: '#0a0269',
    overflowY: 'visible',
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
    backgroundColor: '#0a0269',
    overflowY: 'hidden',
    '&::-webkit-scrollbar': {
        height: '0px',
        backgroundColor: '#0a0269',
    },
});

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}
const AppBar = muiStyled(MuiAppBar, {
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


interface MenuItem {
    label: string;
    route: string;
    icon?: string;
    subItems?: MenuItem[];
}
const menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: dashboard, route: '/dashboard' },
    { label: 'Cadastro Produto', icon: produto, route: '/cadastro-produto' },
    { label: 'Atualizar Estoque', icon: compra, route: '/atualizar-estoque' },
    { label: 'Cadastro Cliente', icon: cliente, route: '/cadastro-cliente' },
    { label: 'Painel de venda', icon: vendas, route: '/vendas' },
    { label: 'Entregas', icon: entrega, route: '/entregas' },
    {
        label: 'Estoques', icon: estoque, route: '', subItems: [
            { label: 'Fabricados', icon: estoque, route: '/estoque-fabricado' },
            { label: 'Comprados', icon: estoque, route: '/estoque-comprado' },
        ]
    },
    {
        label: 'Gestão', icon: gestao, route: '', subItems: [
            { label: 'Colaborador', route: '/colaborador' },
            { label: 'Cartão Ponto', route: '/cartao-ponto' }
        ]
    }
];
const Drawer = muiStyled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
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
    const [open, setOpen] = useState(false);
    const [openSubOptions, setOpenSubOptions] = useState<{ [key: string]: boolean }>({});
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const isLoading = useSelector((state: RootState) => state.loading.loadingGlobal);
    const message = useSelector((state: RootState) => state.user.message);
    const empresa = useSelector((state: RootState) => state.empresaOnline);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isAdmin, setIsAdmin] = useState(false);

    const toggleSubmenu = (label: string) => {
        setOpen(true)
        setOpenSubOptions((prevState) => ({
            ...prevState,
            [label]: !prevState[label]
        }));
    };

    const handleDrawerOpen = () => setOpen(true);

    const handleDrawerClose = () => {
        setOpen(false);
        setOpenSubOptions({});
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            dispatch(setMessage("Erro ao sair. Tente novamente."))
            setOpenSnackBar(prev => ({ ...prev, error: true }))
        }
    }
    useEffect(() => {
        if (empresa) {
            empresa.isAdmin ? setIsAdmin(true) : setIsAdmin(false)
        }
    }, [empresa])

    const renderMenuItems = () => (
        <List>
            {menuItems.map(({ label, icon, route, subItems }) => (
                <div key={label}>
                    <Link to={route || '#'} style={{ textDecoration: 'none', color: 'white' }}>
                        <StyledListItemButton onClick={() => subItems && toggleSubmenu(label)}>
                            <Tooltip title={label}>
                                <ListItemIcon>
                                    <Image src={icon} alt={label} width={30} />
                                </ListItemIcon>
                            </Tooltip>
                            <StyledListItemText primary={label} />
                            {subItems && <KeyboardArrowRightIcon
                                color='inherit'
                                style={
                                    openSubOptions[label] !== undefined
                                        ? {
                                            transform: openSubOptions[label] ? 'rotate(90deg)' : undefined,
                                            transition: 'transform 0.3s linear'
                                        }
                                        : undefined
                                }
                            />}
                        </StyledListItemButton>
                    </Link>
                    {subItems && (
                        <Collapse in={openSubOptions[label]} timeout={'auto'}>
                            <Box sx={{ backgroundColor: '#0b0083' }}>
                                {subItems.map((subItem) => (
                                    <Link to={subItem.route} key={subItem.label} style={{ textDecoration: 'none', color: 'white' }}>
                                        <StyledListItemButton sx={{ pl: 10 }}>
                                            <StyledListItemText primary={subItem.label} />
                                        </StyledListItemButton>
                                    </Link>
                                ))}
                            </Box>
                        </Collapse>
                    )}
                </div>
            ))}
        </List>
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
            <Drawer variant="permanent" open={open}
                sx={{
                    '& .MuiDrawer-paper': open ? openedMixin : closedMixin,
                }}
            >
                <Box onClick={handleDrawerClose}>
                    {open ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                            <img src={logo} alt="Logo da empresa" width={220} />
                        </Box>
                    ) : (
                        <img src={logo} alt="mini logo" width={70} />
                    )}
                </Box>
                <Divider color="#fafafad4" />
                {renderMenuItems()}
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }} onClick={handleDrawerClose}>
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 1 }}>
                    {isLoading && <LinearProgress />}
                </Box>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: '5rem',
                        zIndex: 10,
                        cursor: 'pointer'
                    }}
                >
                    {isAdmin && <Admin />}
                    <Tooltip title={'Perfil'} sx={{ mr: 2 }}>
                        <IconButton onClick={() => navigate('/perfil')}>
                            <PersonOutlineIcon fontSize='inherit' />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={'Sair'}>
                        <IconButton onClick={handleLogout}>
                            <LogoutIcon fontSize='inherit' />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Outlet />
                <CustomSnackBar message={message} open={openSnackBar} setOpen={setOpenSnackBar} />
            </Box>
        </Box>
    );
}
