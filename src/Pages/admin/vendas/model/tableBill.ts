import { ProdutoEscaniado } from "./vendas"


/**
 * Modelo de Comanda Das Mesas
*
* @author Carlos Bageston
*/


interface TableBillModel {
    id?: string,
    nmTable: string,
    vlTotal: number,
    quantidade?: number,
    produtoEscaniado: ProdutoEscaniado[]
}
export default TableBillModel