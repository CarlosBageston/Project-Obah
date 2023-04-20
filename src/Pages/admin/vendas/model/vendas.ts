

/**
 * Modelo de Entrega
*
* @author Carlos Bageston
*/

import SituacaoProduto from "../../compras/enumeration/situacaoProduto"

interface ProdutoEscaniado{
            nmProduto: string,
            cdProduto: string,
            vlVendaProduto: string,
            quantidadeVenda: number,
            tpProduto: SituacaoProduto | null
        }

interface VendaModel {
    dtProduto: string | null
    vlTotal: number | null,
    vlRecebido: string,
    vlTroco: number | null,
    id?: string,
    produtoEscaniado: ProdutoEscaniado[]
}
export default VendaModel