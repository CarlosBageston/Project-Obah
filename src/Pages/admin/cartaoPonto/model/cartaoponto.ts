import ColaboradorModel from "../../cadastroColaborador/model/colaborador"


/**
* Modelo de Cartão Ponto
*
* @author Carlos Bageston
*/


interface CartaoPontoModel {
    id?: string,
    colaborador?: ColaboradorModel,
    dtInicio: string | Date,
    dtTermino: string | Date,
    dtTrabalhada: string,
    hrInicio: string,
    hrTermino: string,
    vlPagoColaborador: number | null
}
export default CartaoPontoModel