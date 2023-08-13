import ProdutosModel from "../../cadastroProdutos/model/produtos"


/**
* Modelo de Cliente
*
* @author Carlos Bageston
*/




interface ClienteModel {
    id?: string,
    nmCliente: string,
    tfCliente: string,
    ruaCliente: string,
    bairroCliente: string,
    cidadeCliente: string,
    nrCasaCliente: string,
    produtos: ProdutosModel[]
}
export default ClienteModel