
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
    versaos: Versao[]

}

export interface Versao {
    versao: number,
    vrQntd: number
}

export default EstoqueModel