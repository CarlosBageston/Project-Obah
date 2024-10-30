import SituacaoProduto from "../../../../enumeration/situacaoProduto"
/**
 * Modelo de Compras/ Atualização de estoque
*
* @author Carlos Bageston
*/
interface ComprasModel {
    id?: string,
    dtCompra: Date | null,
    nmProduto: string,
    cdProduto: string,
    vlUnitario: number,
    quantidade: number,
    totalPago: number | null,
    tpProduto: SituacaoProduto | null,
    qntMinima: number | null,
    mpFabricado?: ComprasModel[]
    stEstoqueInfinito?: boolean
    stMateriaPrima?: boolean
    kgProduto?: number
}
export default ComprasModel