

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
    idCartaoPonto?: number,
    vlHora?: number
}
export default ColaboradorModel