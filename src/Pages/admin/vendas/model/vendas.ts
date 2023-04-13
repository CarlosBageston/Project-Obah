

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
        }

interface VendaModel {
    dtProduto: string | null
    vlTotal: number | null,
    vlRecebido: string,
    vlTroco: number | null,
    id?: string
    produtoEscaniado: ProdutoEscaniado[]
}
export default VendaModel