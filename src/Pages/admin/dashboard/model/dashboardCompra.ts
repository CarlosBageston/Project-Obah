import TelaDashboard from "../../../../enumeration/telaDashboard"
/**
 * Modelo do dasboard Compras
*
* @author Carlos Bageston
*/
interface Dashboard {
    id?: string;
    mes: string;
    tela: TelaDashboard;
    qntdTotal: number;
    nrTotal: number;
    qntdLucro?: number;
}
export default Dashboard