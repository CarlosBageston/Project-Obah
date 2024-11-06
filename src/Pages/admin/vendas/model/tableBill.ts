import { SubProdutoModel } from "../../cadastroProdutos/model/subprodutos"


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
    produtoEscaniado: SubProdutoModel[]
}
export default TableBillModel