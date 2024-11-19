

/**
 * Modelo de Sub-Produto
*
* @author Carlos Bageston
*/
export interface SubProdutoModel {
    nmProduto: string;
    quantidade: number | null;
    vlUnitario: number;
    vlVendaProduto: number;
    valorItem: number
    vlLucro?: number,
    vlTotalMult?: number
}