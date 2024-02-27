import ClienteModel from "../../cadastroClientes/model/cliente";

/**
 * Modelo de Entrega
*
* @author Carlos Bageston
*/
export interface EntregaModel {
    id?: string,
    vlEntrega: number;
    vlLucro: number;
    cliente?: ClienteModel;
    dtEntrega: Date | null;
    quantidades: []
}
