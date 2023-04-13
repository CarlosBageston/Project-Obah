

/**
 * Modelo de Cliente
*
* @author Carlos Bageston
*/
export interface ValorProdutoModel {
    moreninha: string,
    loirinha: string,
    pote1L: string,
    pote2L: string,
    sundae: string,
    plItu: string,
    plFruta: string,
    plCreme: string,
    plPacote: string,
    Balde10L: string,
    plSkimo: string,
    plPaleta: string,
}



interface ClienteModel {
    id?: string,
    nmCliente: string,
    tfCleinte: string,
    ruaCliente: string,
    bairroCliente: string,
    cidadeCliente: string,
    nrCasaCliente: string,
    preco: ValorProdutoModel,
}
export default ClienteModel