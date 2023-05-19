import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State, setuserLogado } from './reducer';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import Login from '../../Pages/login';
import MenuLateral from '../../Components/menuLateral';
import { Box, Dots } from '../assets/loadingStyle';
import logo from '../../assets/Image/logo.png';

export default function PrivateRoute() {
    const { userLogado } = useSelector((state: State) => state.user);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch(setuserLogado(true));
            } else {
                dispatch(setuserLogado(false));
            }
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, [dispatch]);

    if (loading) {
        return (
            <Box>
                <div>
                    <img src={logo} alt="logo da empresa" width={250} />
                </div>
                <Dots />
            </Box>
        );
    }

    if (!userLogado) {
        return <Login />;
    }

    return (
        <>
            <MenuLateral />
        </>
    );
}
