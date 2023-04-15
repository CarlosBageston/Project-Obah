import ProdutosModel from "../../cadastroProdutos/model/produtos"
import SituacaoProduto from "../../compras/enumeration/situacaoProduto"


/**
 * Modelo de Estoque
*
* @author Carlos Bageston
*/


interface EstoqueModel {
    id?: string,
    nmProduto: string,
    cdProduto: string,
    quantidadeTotal: number,
    tpProduto?: SituacaoProduto | null

}
export default EstoqueModel