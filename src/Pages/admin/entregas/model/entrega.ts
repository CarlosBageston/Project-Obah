import ClienteModel from "../../cadastroClientes/model/cliente";

/**
 * Modelo de Entrega
*
* @author Carlos Bageston
*/
export interface EntregaModel {
    id?: string,
    vlEntrega: string,
    vlLucro: string,
    cliente?: ClienteModel,
    dtEntrega: string;
    quantidades: []
}
