import ActionCartaoPontoEnum from "../../../../enumeration/action"


/**
* Modelo de Cartão Ponto
*
* @author Carlos Bageston
*/


interface CartaoPontoModel {
    id?: string
    vlHora?: number
    datetime?: string
    uid: string
    action?: ActionCartaoPontoEnum
    dtInicio?: string | Date,
    dtTermino?: string | Date,
    entrada?:  string
    saida?:  string
    nmColaborador?: string
    salarioPago?: boolean
    dtPagamento?: string
}
export default CartaoPontoModel