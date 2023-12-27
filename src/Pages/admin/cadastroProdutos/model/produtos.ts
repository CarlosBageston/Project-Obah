
import SituacaoProduto from "../../../../enumeration/situacaoProduto"
import ComprasModel from "../../compras/model/compras"

/**
 * Modelo de Entrega
*
* @author Carlos Bageston
*/


interface ProdutosModel {
    id?: string,
    nmProduto: string,
    cdProduto: string,
    vlUnitario: number,
    vlVendaProduto: string,
    tpProduto: SituacaoProduto | null,
    stEntrega?: boolean,
    mpFabricado: ComprasModel[]
    valorItem?: number
    nrOrdem?: number
}
export default ProdutosModel