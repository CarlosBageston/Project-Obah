import { db } from "../firebase";
import GetData from "../firebase/getData";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import ComprasModel from "../Pages/admin/compras/model/compras";
import { ProdutoEscaniado } from "../Pages/admin/vendas/model/vendas";
import EstoqueModel, { Versao } from "../Pages/admin/estoque/model/estoque";
import { TableKey } from "../types/tableName";
import { ProdutosEntregaModel } from "../Pages/admin/entregas/model/entrega";

/**
 * Hook personalizado para manipulação de estoque.
 *
 * Este hook fornece métodos para atualizar o estoque com base em diversas operações,
 * como remoção de produtos por entrega, venda, ou compras.
 *
 * @returns Métodos relacionados à manipulação de estoque.
 */
export default function useEstoque(){
    const {
        dataTable: dataTableEstoque,
    } = GetData(TableKey.Estoque, true) as { dataTable: EstoqueModel[] };

    const {
        dataTable: dataTableCompras,
    } = GetData(TableKey.Compras, true) as { dataTable: ComprasModel[] };

    /**
     * Atualiza o estoque removendo a quantidade especificada.
     *
     * @param {EstoqueModel} estoque - Objeto representando o estoque a ser atualizado.
     */
    async function updateRemovedStock(estoque: EstoqueModel) {
        const estoqueExistente = dataTableEstoque.find(
            estoques => estoques.nmProduto === estoque.nmProduto
        );
        if (estoqueExistente) {
            const refID: string = estoqueExistente.id ?? '';
            const refTable = doc(db, TableKey.Estoque, refID);
            for (const versao of estoqueExistente.versaos) {
                if (versao.vrQntd <= 0) {
                    const compraCorrespondente = dataTableCompras.find(compra =>
                        compra.nmProduto === estoqueExistente.nmProduto && compra.nrOrdem === versao.versao
                    );
                    if (compraCorrespondente && compraCorrespondente.id) {
                        await deleteDoc(doc(db, TableKey.Compras, compraCorrespondente.id));
                    }

                }
            }
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
    async function removedStockEntrega(produtosList: ProdutosEntregaModel[]) {
        produtosList.forEach(async produto => {
            const estoqueMP = dataTableEstoque.find(estoque => estoque.nmProduto === produto.nmProduto);
            if (estoqueMP && produto.quantidade) {
                const listVersaoComQntd: Versao[] = [...estoqueMP.versaos];
                let quantidadeRestante = produto.quantidade;
                const versoesOrdenadas = estoqueMP.versaos.sort((a, b) => b.versao - a.versao);
                versoesOrdenadas.forEach(versao => {
                    if (quantidadeRestante > 0) {
                        quantidadeRestante = calculateStock(quantidadeRestante, versao, estoqueMP);
                    }
                })
                await updateRemovedStock({
                    nmProduto: estoqueMP.nmProduto,
                    cdProduto: estoqueMP.cdProduto,
                    quantidade: estoqueMP.quantidade,
                    tpProduto: estoqueMP.tpProduto,
                    qntMinima: estoqueMP.qntMinima,
                    versaos: listVersaoComQntd,
                });
            }

        })

    }

    /**
     * Atualiza o estoque removendo a quantidade especificada após uma venda.
     *
     * @param {ProdutoEscaniado[]} produtoEscaniado - Produtos escaneados na venda.
     */
    async function removedStockVenda(produtoEscaniado: ProdutoEscaniado[]) {
        if (!produtoEscaniado) return;
        produtoEscaniado.forEach(async produto => {
            const foundProduct = dataTableCompras.find(product => product.nmProduto === produto.nmProduto);
            if(foundProduct && foundProduct?.stEstoqueInfinito){
                const newProduct = {...foundProduct, quantidade: produto.quantidadeVenda}
                removedStockCompras(newProduct);
            }
            const estoqueProduto = dataTableEstoque.find(estoque => estoque.nmProduto === produto.nmProduto);
            if (estoqueProduto) {
                const listVersaoComQntd: Versao[] = [...estoqueProduto.versaos];
                const versoesOrdenadas = estoqueProduto.versaos.sort((a, b) => a.versao - b.versao);
                let quantidadeRestante = produto.quantidadeVenda;
                versoesOrdenadas.forEach(versao => {
                    if (produto.quantidadeVenda > 0) {
                        quantidadeRestante = calculateStock(quantidadeRestante, versao, estoqueProduto)
                    }
                })
                await updateRemovedStock({
                    nmProduto: estoqueProduto.nmProduto,
                    cdProduto: estoqueProduto.cdProduto,
                    quantidade: estoqueProduto.quantidade,
                    tpProduto: estoqueProduto.tpProduto,
                    qntMinima: estoqueProduto.qntMinima,
                    versaos: listVersaoComQntd,
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
        values: ComprasModel, 
        ) {
            if(!values.mpFabricado) return;
            for (const mp of values.mpFabricado) {
                const estoqueMP = dataTableEstoque.find(estoque => estoque.nmProduto === mp.nmProduto);
                if (estoqueMP) {
                    if(estoqueMP.quantidade !== 0) {
                        let qntdUsadaProducao = values.quantidade * mp.quantidade;
                        const listVersaoComQntd: Versao[] = [...estoqueMP.versaos];
                        const versoesOrdenadas = estoqueMP.versaos.sort((a, b) => a.versao - b.versao);
    
                        versoesOrdenadas.forEach(versao => {
                            if (qntdUsadaProducao > 0) {
                                qntdUsadaProducao = calculateStock(qntdUsadaProducao, versao, estoqueMP);
                            }
                        })
                        await updateRemovedStock({
                            nmProduto: estoqueMP.nmProduto,
                            cdProduto: estoqueMP.cdProduto,
                            quantidade: estoqueMP.quantidade,
                            tpProduto: estoqueMP.tpProduto,
                            qntMinima: estoqueMP.qntMinima,
                            versaos: listVersaoComQntd,
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
    async function updateStock(estoque: EstoqueModel, versao: number | undefined) {
        const estoqueExistente = dataTableEstoque.find(
            estoques => estoques.nmProduto === estoque.nmProduto
        );
        if (estoqueExistente) {
            const refID: string = estoqueExistente.id ?? '';
            const refTable = doc(db, TableKey.Estoque, refID);
            const versaoCorrespondente = estoqueExistente.versaos.find(versaoObjeto =>
                versaoObjeto.versao === versao
            );
            if (versaoCorrespondente) {
                // Atualiza a quantidade da versão correspondente
                versaoCorrespondente.vrQntd = estoque.quantidade;
    
                // Atualiza os outros valores do estoque
                estoqueExistente.qntMinima = estoque.qntMinima;
                estoqueExistente.nmProduto = estoque.nmProduto;
                estoqueExistente.cdProduto = estoque.cdProduto;
    
                // Soma a quantidade de todas as versões
                const totalQuantidadeVersoes = estoqueExistente.versaos.reduce((total, current) => {
                    return total + current.vrQntd;
                }, 0);
    
                // Atualiza a quantidade total no estoque
                estoqueExistente.quantidade = totalQuantidadeVersoes;

                await updateDoc(refTable, {
                    nmProduto: estoqueExistente.nmProduto,
                    cdProduto: estoqueExistente.cdProduto,
                    quantidade: estoqueExistente.quantidade,
                    tpProduto: estoqueExistente.tpProduto,
                    qntMinima: estoqueExistente.qntMinima,
                    versaos: estoqueExistente.versaos,
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
        const qntdMinima = Math.min(qntdUsadaProducao, versao.vrQntd)
        const novaQuantidade = estoqueMP.quantidade - qntdMinima;
        const novaQntdPorVersao = versao.vrQntd - qntdMinima
        if (novaQuantidade > 0) {
            versao.vrQntd = novaQntdPorVersao;
        } else {
            versao.vrQntd = 0
        }

        estoqueMP.quantidade = parseFloat(novaQuantidade.toFixed(2))
        return qntdUsadaProducao -= qntdMinima;
    }

    return {
        removedStockEntrega,
        removedStockVenda, 
        removedStockCompras,
        updateStock
    }
}