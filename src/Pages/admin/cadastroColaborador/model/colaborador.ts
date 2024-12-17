import SituacaoSalarioColaboradorEnum from "../../../../enumeration/situacaoColaborador"

/**
* Modelo de Colaborador
*
* @author Carlos Bageston
*/

interface ColaboradorModel {
    id?: string,
    nmColaborador: string,
    tfColaborador: string,
    ruaColaborador: string,
    bairroColaborador: string,
    cidadeColaborador: string,
    nrCasaColaborador: string,
    idCartaoPonto: string,
    stSalarioColaborador: SituacaoSalarioColaboradorEnum | null
    vlHora?: number
}
export default ColaboradorModel