import ClienteModel from "../../cadastroClientes/model/cliente";
import { SubProdutoModel } from "../../cadastroProdutos/model/subprodutos";

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
    produtos: SubProdutoModel[];
    dtEntrega: Date | null;
    quantidades: []
}


