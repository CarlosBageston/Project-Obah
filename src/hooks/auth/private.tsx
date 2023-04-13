import Login from '../../Pages/login';
import { useAuth } from '.';
import MenuLateral from '../../Components/menuLateral';


export default function PrivateRoute() {
    const { logado } = useAuth();

    if (logado === null) {
        return <Login />;
    } else {
        return (
            <>
                <MenuLateral />
            </>
        );
    }
}