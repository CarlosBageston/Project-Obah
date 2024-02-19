import SituacaoProduto from "../../../../enumeration/situacaoProduto"

/**
 * Modelo de Estoque
*
* @author Carlos Bageston
*/



interface EstoqueModel {
    id?: string,
    nmProduto: string,
    cdProduto: string,
    quantidade: number,
    tpProduto: SituacaoProduto,
    stEstoque?: 'Bom' | 'Comprar',
    qntMinima: number,
    versaos: Versao[]
    stEstoqueInfinito?: boolean
}

export interface Versao {
    versao: number,
    vrQntd: number
}

export default EstoqueModel