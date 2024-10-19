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
    cliente: ClienteModel | null;
    nmCliente: string;
    produtos: ProdutosEntregaModel[];
    dtEntrega: Date | null;
    quantidades: []
}

export interface ProdutosEntregaModel {
    nmProduto: string;
    quantidade: number | null;
    vlUnitario: number;
    vlVendaProduto: number;
    valorItem: number
}
