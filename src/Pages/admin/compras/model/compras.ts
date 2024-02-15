import SituacaoProduto from "../../../../enumeration/situacaoProduto"
/**
 * Modelo de Entrega
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
    cxProduto: number | null,
    kgProduto: number | null,
    qntMinima: number | null,
    nrOrdem?: number
    mpFabricado?: ComprasModel[]
    stEstoqueInfinito?: boolean
}
export default ComprasModel