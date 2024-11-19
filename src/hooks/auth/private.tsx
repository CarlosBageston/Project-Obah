import { useSelector } from 'react-redux';
import MenuLateral from '../../Components/menuLateral';
import { RootState } from '../../store/reducer/store';
import { Navigate } from 'react-router-dom';

function PrivateRoute() {
    const isAuthenticated = useSelector((store: RootState) => store.user.userLogado)
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return <MenuLateral />;
}

export default PrivateRoute;