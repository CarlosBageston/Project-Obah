import ProdutosModel from "../../cadastroProdutos/model/produtos"


/**
 * Modelo de Estoque
*
* @author Carlos Bageston
*/


interface EstoqueModel {
    id?: string,
    nmProduto: string,
    cdProduto: string,
    quantidadeTotal: number

}
export default EstoqueModel