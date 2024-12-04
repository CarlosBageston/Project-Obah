import SituacaoProduto from "../../../../enumeration/situacaoProduto"
import { SubProdutoModel } from "./subprodutos"

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
    mpFabricado: SubProdutoModel[]
    valorItem?: number
    stMateriaPrima?: boolean
    stEstoqueInfinito?: boolean
    qntMinima: number | null
    kgProduto: number
}
export default ProdutosModel