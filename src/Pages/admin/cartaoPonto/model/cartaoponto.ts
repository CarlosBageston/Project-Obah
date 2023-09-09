import ActionCartaoPontoEnum from "../../../../enumeration/action"


/**
* Modelo de Cartão Ponto
*
* @author Carlos Bageston
*/


interface CartaoPontoModel {
    id?: string
    vlHora?: number
    datetime?: Date
    uid?: number
    action?: ActionCartaoPontoEnum
    dtInicio: string | Date,
    dtTermino: string | Date,
}
export default CartaoPontoModel