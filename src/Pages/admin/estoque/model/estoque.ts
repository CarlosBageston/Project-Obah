import ProdutosModel from "../../cadastroProdutos/model/produtos"
import SituacaoProduto from "../../compras/enumeration/situacaoProduto"
import ComprasModel from "../../compras/model/compras"


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
    cxProduto?: number | null,
    kgProduto?: number | null,
    tpProduto?: SituacaoProduto | null,
    mpFabricado?: ComprasModel[]

}
export default EstoqueModel