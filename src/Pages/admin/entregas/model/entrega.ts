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
    nmCliente: string;
    nmClienteFormatted?: string;
    produtos: SubProdutoModel[];
    dtEntrega: Date | null | string;
}


