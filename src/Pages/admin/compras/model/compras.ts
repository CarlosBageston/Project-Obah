import SituacaoProduto from "../../../../enumeration/situacaoProduto"
import { SubProdutoModel } from "../../cadastroProdutos/model/subprodutos"

/**
 * Modelo de Compras/ Atualização de estoque
*
* @author Carlos Bageston
*/
interface ComprasModel {
    id?: string,
    dtCompra: Date | null | string, 
    nmProduto: string,
    nmProdutoFormatted: string,
    cdProduto: string,
    vlUnitario: number,
    quantidade: number,
    totalPago: number | null,
    tpProduto: SituacaoProduto | null,
    qntMinima: number | null,
    mpFabricado?: SubProdutoModel[]
    stEstoqueInfinito?: boolean
    stMateriaPrima?: boolean
    kgProduto?: number
}
export default ComprasModel