/**
 * Modelo de Entrega
*
* @author Carlos Bageston
*/


interface ComprasModel {
    id?: string,
    dtCompra: string,
    nmProduto: string,
    cdProduto: string,
    vlUnitario: string,
    quantidade: number | null,
    totalPago: number | null
}
export default ComprasModel