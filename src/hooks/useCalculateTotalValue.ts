import CompraHistoricoModel from "../Pages/admin/compras/model/comprahistoricoModel";
import ComprasModel from "../Pages/admin/compras/model/compras";
import SituacaoProduto from "../enumeration/situacaoProduto";
import useFormatCurrency from "./formatCurrency";
import { foundKgProduto } from "./useFoundProductKg";

const { convertToNumber } = useFormatCurrency();

/**
 * Classe de erro para representar uma exceção quando há produtos sem quantidade durante o cálculo do valor total.
 */
export class ProdutosSemQuantidadeError {
     /**
     * Lista de nomes de produtos sem quantidade.
     */
    produtosSemQuantidade: string;

    /**
     * Cria uma instância da classe de erro.
     * @param {string} produtosSemQuantidade - Nomes dos produtos sem quantidade.
     */
    constructor(produtosSemQuantidade: string) {
        this.produtosSemQuantidade = produtosSemQuantidade;
    }
}

/**
 * Calcula o valor total com base nas quantidades de produtos e nos valores unitários.
 * @param {ComprasModel[] | ComprasModel} mpList - Lista de produtos ou um único produto.
 * @param {CompraHistoricoModel[] | CompraHistoricoModel} comprasDataTable - Lista de compras históricas ou uma única compra.
 * @returns {number} - Valor total calculado.
 * @throws {ProdutosSemQuantidadeError} - Lança exceção se houver produtos sem quantidade.
 */
export function calculateTotalValue(mpList: ComprasModel[] | ComprasModel, comprasDataTable: CompraHistoricoModel[] | CompraHistoricoModel): number {
    let soma = 0;
    const produtosSemQuantidade: string[] = [];
    if (Array.isArray(comprasDataTable) && Array.isArray(mpList)) {
        comprasDataTable.forEach(compra => {
            if(compra.tpProduto === SituacaoProduto.FABRICADO || !compra.stMateriaPrima) return;
            if(!compra.vlUnitario || compra.quantidade === 0){
                produtosSemQuantidade.push(compra.nmProduto)
            }
        })
        if(produtosSemQuantidade.length > 0){
            const nomesSeparadosPorVirgula = produtosSemQuantidade.join(', ');
            throw new ProdutosSemQuantidadeError(nomesSeparadosPorVirgula);
        }
        for (const mp of mpList) {
            const produtoEncontrado = comprasDataTable.find(produto => produto.nmProduto === mp.nmProduto);
            if (produtoEncontrado) {
                const foundProduct = foundKgProduto(produtoEncontrado)
                soma += calcularValorParaProduto(mp, foundProduct);
            }
        }
    } else if (!Array.isArray(comprasDataTable) && !Array.isArray(mpList)) {
        soma = calcularValorParaProduto(mpList, comprasDataTable);
    }
    return soma;
}
/**
 * Calcula o valor total para um único produto com base na quantidade e no valor unitário.
 * @param {ComprasModel} mp - Produto a ser calculado.
 * @param {CompraHistoricoModel} produtoEncontrado - Informações históricas do produto.
 * @returns {number} - Valor total calculado para o produto.
 */
function calcularValorParaProduto(mp: ComprasModel, produtoEncontrado: CompraHistoricoModel): number {
    let result = 0;
    let quantidade = null
    if(typeof mp.quantidade === 'string') { quantidade = convertToNumber(mp.quantidade) } 
    else { quantidade = mp.quantidade }

    result = produtoEncontrado.vlUnitario * quantidade;
    return parseFloat(result.toFixed(2));
}