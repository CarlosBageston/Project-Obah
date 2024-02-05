import SituacaoProduto from "../../../../enumeration/situacaoProduto"


/**
 * Modelo de Entrega
*
* @author Carlos Bageston
*/

export interface ProdutoEscaniado{
            nmProduto: string,
            cdProduto: string,
            vlVendaProduto: number,
            quantidadeVenda: number,
            tpProduto: SituacaoProduto | null,
            vlLucro?: number,
            vlTotalMult?: number
        }

interface VendaModel {
    dtProduto: string | null,
    vlLucroTotal: number,
    vlTotal: number ,
    vlRecebido: number,
    vlTroco: number ,
    id?: string,
    produtoEscaniado: ProdutoEscaniado[]
}
export default VendaModel