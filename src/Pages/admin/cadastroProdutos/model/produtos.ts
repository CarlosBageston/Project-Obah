import SituacaoProduto from "../../../../enumeration/situacaoProduto"
import ComprasModel from "../../compras/model/compras"

/**
 * Modelo de Produto
*
* @author Carlos Bageston
*/
interface ProdutosModel {
    id?: string,
    nmProduto: string,
    nmProdutoFormatted: string,
    cdProduto: string,
    vlUnitario: number,
    vlVendaProduto: number,
    tpProduto: SituacaoProduto | null,
    stEntrega?: boolean,
    mpFabricado: ComprasModel[]
    valorItem?: number
    stMateriaPrima?: boolean
    qntMinima: number | null
    kgProduto: number
}
export default ProdutosModel