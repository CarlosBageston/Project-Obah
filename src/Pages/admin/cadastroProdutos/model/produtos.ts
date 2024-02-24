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
    cdProduto: string,
    vlUnitario: number,
    vlVendaProduto: number,
    tpProduto: SituacaoProduto | null,
    stEntrega?: boolean,
    mpFabricado: ComprasModel[]
    valorItem?: number
    stMateriaPrima?: boolean
    kgProduto: number
}
export default ProdutosModel