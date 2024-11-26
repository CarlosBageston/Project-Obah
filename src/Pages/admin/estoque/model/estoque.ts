import SituacaoProduto from "../../../../enumeration/situacaoProduto"

/**
 * Modelo de Estoque
*
* @author Carlos Bageston
*/



interface EstoqueModel {
    id?: string,
    nmProduto: string,
    nmProdutoFormatted?: string,
    cdProduto: string,
    quantidade: number,
    tpProduto: SituacaoProduto | null,
    idsVersoes?: string[],
    stEstoque?: 'Bom' | 'Comprar' | 'Fabricar',
    qntMinima: number | null,
    versaos: Versao[]
    stEstoqueInfinito?: boolean
}

export interface Versao {
    idVersao?: string,
    vrQntd: number
}

export default EstoqueModel