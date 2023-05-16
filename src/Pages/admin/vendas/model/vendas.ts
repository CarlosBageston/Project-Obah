import SituacaoProduto from "../../compras/enumeration/situacaoProduto"
import ComprasModel from "../../compras/model/compras"


/**
 * Modelo de Entrega
*
* @author Carlos Bageston
*/

interface ProdutoEscaniado{
            nmProduto: string,
            cdProduto: string,
            vlVendaProduto: string,
            quantidadeVenda: number,
            tpProduto: SituacaoProduto | null,
            mpFabricado: ComprasModel[],
            vlLucro?: string,
            vlTotalMult?: string
        }

interface VendaModel {
    dtProduto: string | null,
    vlLucroTotal?: number,
    vlTotal: number | null,
    vlRecebido: string,
    vlTroco: number | null,
    id?: string,
    produtoEscaniado: ProdutoEscaniado[]
}
export default VendaModel