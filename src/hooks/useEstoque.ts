import { db } from "../firebase";
import { doc, updateDoc, where } from "firebase/firestore";
import ComprasModel from "../Pages/admin/compras/model/compras";
import EstoqueModel, { Versao } from "../Pages/admin/estoque/model/estoque";
import { getSingleItemByQuery } from "./queryFirebase";
import { useDispatch } from "react-redux";
import { SubProdutoModel } from "../Pages/admin/cadastroProdutos/model/subprodutos";
import { useTableKeys } from "./tableKey";

/**
 * Hook personalizado para manipulação de estoque.
 *
 * Este hook fornece métodos para atualizar o estoque com base em diversas operações,
 * como remoção de produtos por entrega, venda, ou compras.
 *
 * @returns Métodos relacionados à manipulação de estoque.
 */
export default function useEstoque(){
    const dispatch = useDispatch();
    const tableKeys = useTableKeys();

    /**
     * Atualiza o estoque removendo a quantidade especificada.
     *
     * @param {EstoqueModel} estoque - Objeto representando o estoque a ser atualizado.
     */
    async function updateRemovedStock(estoque: EstoqueModel) {
        const estoqueExistente = await getSingleItemByQuery<EstoqueModel>(tableKeys.Estoque, [where('nmProduto', '==', estoque.nmProduto)], dispatch);
        if (estoqueExistente) {
            const refID: string = estoqueExistente.id ?? '';
            const refTable = doc(db, tableKeys.Estoque, refID);
            const versoesValidas = estoque.versaos.filter(versao => versao.vrQntd > 0);
            await updateDoc(refTable, {
                nmProduto: estoque.nmProduto,
                cdProduto: estoque.cdProduto,
                quantidade: estoque.quantidade,
                tpProduto: estoque.tpProduto,
                qntMinima: estoque.qntMinima,
                versaos: versoesValidas
            })
        }
    }

    /**
     * Atualiza o estoque removendo a quantidade especificada após uma entrega.
     *
     * 
     * @param {Object} quantidades - Quantidades a serem removidas do estoque.
     */
    async function removedStock(produtosList: SubProdutoModel[]) {
        const produtoListFiltered = produtosList.filter(produto => produto.quantidade !== null);
        produtoListFiltered.forEach(async produto => {
            const foundProduct = await getSingleItemByQuery<ComprasModel>(tableKeys.Compras, [where('nmProduto', '==', produto.nmProduto)], dispatch);
            if(foundProduct && foundProduct?.stEstoqueInfinito){
                removedStockCompras(foundProduct.mpFabricado, produto.quantidade ?? 0 );
            }
            const estoque = await getSingleItemByQuery<EstoqueModel>(tableKeys.Estoque, [where('nmProduto', '==', produto.nmProduto)], dispatch);
            if (estoque && produto.quantidade) {
                let quantidadeRestante = produto.quantidade;
                const versoesOrdenadas = estoque.versaos.sort((a, b) => a.vrQntd - b.vrQntd);

                // Agora as versões estão ordenadas pela data de criação
                
                for (const versao of versoesOrdenadas) {
                    if (quantidadeRestante <= 0) break;
                    quantidadeRestante = calculateStock(quantidadeRestante, versao, estoque);
                }
                await updateRemovedStock({
                    nmProduto: estoque.nmProduto,
                    cdProduto: estoque.cdProduto,
                    quantidade: estoque.quantidade,
                    tpProduto: estoque.tpProduto,
                    qntMinima: estoque.qntMinima,
                    versaos: estoque.versaos,
                });
            }

        })

    }

     /**
     * Atualiza o estoque removendo a quantidade utilizada em uma compra.
     *
     * @param {ComprasModel} values - Dados da compra.
     */
    async function removedStockCompras(
        mpFabricado: SubProdutoModel[] | undefined, 
        quantidadeUsada: number
        ) {
            if(!mpFabricado) return;
            for (const mp of mpFabricado) {
                const estoqueMP = await getSingleItemByQuery<EstoqueModel>(tableKeys.Estoque, [where('nmProduto', '==', mp.nmProduto)], dispatch);
                if (estoqueMP) {
                    if(estoqueMP.quantidade !== 0) {
                        let qntdUsadaProducao = quantidadeUsada * (mp.quantidade ?? 0);
                        const versoesOrdenadas = estoqueMP.versaos.sort((a, b) => a.vrQntd - b.vrQntd);
                        
                        for (const versao of versoesOrdenadas) {
                            if (qntdUsadaProducao <= 0) break;
                            qntdUsadaProducao = calculateStock(qntdUsadaProducao, versao, estoqueMP);
                        }
                        await updateRemovedStock({
                            nmProduto: estoqueMP.nmProduto,
                            cdProduto: estoqueMP.cdProduto,
                            quantidade: estoqueMP.quantidade,
                            tpProduto: estoqueMP.tpProduto,
                            qntMinima: estoqueMP.qntMinima,
                            versaos: estoqueMP.versaos,
                        });
                    } 
                }
            }
        }

    /**
     * Atualiza o estoque.
     *
     * @param {EstoqueModel} estoque - Objeto representando o estoque a ser atualizado.
     * @param { number | undefined} versao - Numero da versão que está sendo atualizado.
     */
    async function updateStock(estoque: EstoqueModel, idVersao: string | undefined) {
        const stockFound = await getSingleItemByQuery<EstoqueModel>(tableKeys.Estoque, [where('idsVersoes', 'array-contains', idVersao)], dispatch);
        if (stockFound) {
            const refID: string = stockFound.id ?? '';
            const refTable = doc(db, tableKeys.Estoque, refID);
            const versao = stockFound.versaos.find(versaoObjeto => versaoObjeto.idVersao === idVersao);
            if (versao) {
                versao.vrQntd = estoque.quantidade;
                if(stockFound.qntMinima !== estoque.qntMinima) stockFound.qntMinima = estoque.qntMinima;
                if(stockFound.cdProduto !== estoque.cdProduto) stockFound.cdProduto = estoque.cdProduto;
    
                // Soma a quantidade de todas as versões
                const totalQuantidadeVersoes = stockFound.versaos.reduce((total, current) => {
                    return total + current.vrQntd;
                }, 0);
    
                // Atualiza a quantidade total no estoque
                stockFound.quantidade = totalQuantidadeVersoes;

                await updateDoc(refTable, {
                    nmProduto: stockFound.nmProduto,
                    cdProduto: stockFound.cdProduto,
                    quantidade: stockFound.quantidade,
                    tpProduto: stockFound.tpProduto,
                    qntMinima: stockFound.qntMinima,
                    versaos: stockFound.versaos,
                });
            }
        }
    }

    /**
     * Calcula e atualiza o estoque com base na quantidade usada na produção.
     *
     * @param {number} qntdUsadaProducao - Quantidade usada na produção.
     * @param {Versao} versao - Objeto representando a versão do produto.
     * @param {EstoqueModel} estoqueMP - Objeto representando o estoque do produto.
     * @returns {number} - A quantidade restante após o cálculo.
     */
    function calculateStock(qntdUsadaProducao: number, versao: Versao, estoqueMP: EstoqueModel): number {
        const qntdMinima = Math.min(qntdUsadaProducao, versao.vrQntd);
        
        // Atualiza as quantidades da versão e do estoque diretamente
        versao.vrQntd -= qntdMinima;
        estoqueMP.quantidade = parseFloat((estoqueMP.quantidade - qntdMinima).toFixed(2));
        
        // Retorna a quantidade restante a ser usada
        return qntdUsadaProducao - qntdMinima;
    }
    

    return {
        removedStock,
        removedStockCompras,
        updateStock
    }
}