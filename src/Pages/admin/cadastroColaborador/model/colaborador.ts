

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
    vlHora: number | null
}
export default ColaboradorModel