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
    uid: string
    action?: ActionCartaoPontoEnum
    dtInicio?: string | Date,
    dtTermino?: string | Date,
    entrada?: Date
    saida?: Date
    nmColaborador?: string
}
export default CartaoPontoModel