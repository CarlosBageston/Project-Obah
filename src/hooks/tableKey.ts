import { useSelector } from 'react-redux';
import { RootState } from '../store/reducer/store';


export const useTableKeys = () => {
    const user = useSelector((state: RootState) => state.user.user);

    if (user === null) {
        throw new Error("Usuário não autenticado");
    }

    return {
        Produtos: `UsersData/${user.uid}/Produtos`,
        Vendas: `UsersData/${user.uid}/Vendas`,
        DadosDashboard: `UsersData/${user.uid}/Dados Dashboard`,
        Estoque: `UsersData/${user.uid}/Estoque`,
        Compras: `UsersData/${user.uid}/Compras`,
        Clientes: `UsersData/${user.uid}/Clientes`,
        Colaborador: `UsersData/${user.uid}/Colaborador`,
        Dashboard: `UsersData/${user.uid}/Dashboard`,
        Entregas: `UsersData/${user.uid}/Entregas`,
        Comanda: `UsersData/${user.uid}/Comanda`,
        Mesas: `UsersData/${user.uid}/Mesas`,
    };
};
