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
    cliente: ClienteModel,
    dtEntrega: string;
    quantidades: {
        Moreninha: number | null;
        Loirinha: number | null;
        Pote1L: number | null;
        Pote2L: number | null;
        Sundae: number | null;
        Creme: number | null;
        Fruta: number | null;
        Itu: number | null;
        Pacote: number | null;
        balde10L: number | null;
        Skimo: number | null;
        Paleta: number | null;
    };
}
