import { useSelector } from 'react-redux';
import { RootState } from '../store/reducer/store';


export const useTableKeys = () => {
    const user = useSelector((state: RootState) => state.user.user);

    if (user === null) {
        throw new Error("Usuário não autenticado");
    }

    return {
        Produtos: `UsersData/${user.uid}/Produtos`,
        DashboardCompra: `UsersData/${user.uid}/DashboardCompra`,
        DashboardVendas: `UsersData/${user.uid}/DashboardVendas`,
        DashboardEntregas: `UsersData/${user.uid}/DashboardEntregas`,
        DashboardGeral: `UsersData/${user.uid}/DashboardGeral`,
        Empresa: `UsersData/${user.uid}/Empresa`,
        Estoque: `UsersData/${user.uid}/Estoque`,
        Compras: `UsersData/${user.uid}/Compras`,
        Clientes: `UsersData/${user.uid}/Clientes`,
        Colaborador: `UsersData/${user.uid}/Colaborador`,
        Dashboard: `UsersData/${user.uid}/Dashboard`,
        Entregas: `UsersData/${user.uid}/Entregas`,
        Comanda: `UsersData/${user.uid}/Comanda`,
        Mesas: `UsersData/${user.uid}/Mesas`,
        UserAdmin: `UserAdmin`,
        RegistrationTokens: `RegistrationTokens`,
    };
};
