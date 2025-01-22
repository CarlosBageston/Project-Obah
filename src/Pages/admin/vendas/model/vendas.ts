

/**
 * Modelo de Venda
*
* @author Carlos Bageston
*/

import { SubProdutoModel } from "../../cadastroProdutos/model/subprodutos"


interface VendaModel {
    id?: string,
    dtProduto: Date | null | string,
    vlLucroTotal: number,
    vlTotal: number ,
    vlRecebido: number,
    vlTroco: number,
    produtoEscaniado: SubProdutoModel[]
}
export default VendaModel
