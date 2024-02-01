import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import EstoqueModel, { Versao } from "../Pages/admin/estoque/model/estoque";
import GetData from "../firebase/getData";
import ComprasModel from "../Pages/admin/compras/model/compras";
import { db } from "../firebase";
import ClienteModel from "../Pages/admin/cadastroClientes/model/cliente";
import { ProdutoEscaniado } from "../Pages/admin/vendas/model/vendas";
import { Dispatch, SetStateAction } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../store/reducer/reducer";

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
    const {
        dataTable: dataTableEstoque,
    } = GetData('Estoque', true) as { dataTable: EstoqueModel[] };

    const {
        dataTable: dataTableCompras,
    } = GetData('Compras', true) as { dataTable: ComprasModel[] };

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
            const refTable = doc(db, "Estoque", refID);
            for (const versao of estoqueExistente.versaos) {
                if (versao.vrQntd <= 0) {
                    const compraCorrespondente = dataTableCompras.find(compra =>
                        compra.nmProduto === estoqueExistente.nmProduto && compra.nrOrdem === versao.versao
                    );
                    if (compraCorrespondente && compraCorrespondente.id) {
                        await deleteDoc(doc(db, "Compras", compraCorrespondente.id));
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
     * @param {ClienteModel | undefined} clienteCurrent - Cliente atual.
     * @param {Object} quantidades - Quantidades a serem removidas do estoque.
     */
    async function removedStockEntrega(clienteCurrent: ClienteModel | undefined, quantidades:{ [key: string]: number }) {
        if (!clienteCurrent) return;
        clienteCurrent.produtos.forEach(async produto => {
            const estoqueMP = dataTableEstoque.find(estoque => estoque.nmProduto === produto.nmProduto);
            if (estoqueMP) {
                const listVersaoComQntd: Versao[] = [...estoqueMP.versaos];
                const versoesOrdenadas = estoqueMP.versaos.sort((a, b) => a.versao - b.versao);
                versoesOrdenadas.forEach(versao => {
                    if (quantidades[produto.nmProduto] > 0) {
                        const qntdMinima = Math.min(quantidades[produto.nmProduto], versao.vrQntd)
                        const novaQuantidade = estoqueMP.quantidade - qntdMinima;
                        const novaQntdPorVersao = versao.vrQntd - qntdMinima
                        if (novaQuantidade > 0) {
                            versao.vrQntd = novaQntdPorVersao;
                        } else {
                            versao.vrQntd = 0
                        }

                        estoqueMP.quantidade = parseFloat(novaQuantidade.toFixed(2))
                        quantidades[produto.nmProduto] -= qntdMinima;
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
            const estoqueProduto = dataTableEstoque.find(estoque => estoque.nmProduto === produto.nmProduto);
            if (estoqueProduto) {
                const listVersaoComQntd: Versao[] = [...estoqueProduto.versaos];
                const versoesOrdenadas = estoqueProduto.versaos.sort((a, b) => a.versao - b.versao);
                versoesOrdenadas.forEach(versao => {
                    if (produto.quantidadeVenda > 0) {
                        const qntdMinima = Math.min(produto.quantidadeVenda, versao.vrQntd)
                        const novaQuantidade = estoqueProduto.quantidade - qntdMinima;
                        const novaQntdPorVersao = versao.vrQntd - qntdMinima
                        if (novaQuantidade > 0) {
                            versao.vrQntd = novaQntdPorVersao;
                        } else {
                            versao.vrQntd = 0
                        }

                        estoqueProduto.quantidade = parseFloat(novaQuantidade.toFixed(2))
                        produto.quantidadeVenda -= qntdMinima;
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
     * @param {Dispatch<SetStateAction<boolean>>} setOpenDialog - Função para abrir o diálogo.
     * @param {Dispatch<SetStateAction<boolean>>} setEstoqueVazio - Função para sinalizar estoque vazio.
     * @param {Dispatch<SetStateAction<string>>} setNmProduto - Função para definir o nome do produto.
     */
    async function removedStockCompras(
        values: ComprasModel, 
        setOpenDialog: Dispatch<SetStateAction<boolean>>, 
        setEstoqueVazio: Dispatch<SetStateAction<boolean>>,
        setNmProduto: Dispatch<SetStateAction<string>>
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
                                const qntdMinima = Math.min(qntdUsadaProducao, versao.vrQntd)
                                const novaQuantidade = estoqueMP.quantidade - qntdMinima;
                                const novaQntdPorVersao = versao.vrQntd - qntdMinima
                                if (novaQuantidade > 0) {
                                    versao.vrQntd = novaQntdPorVersao;
                                } else {
                                    versao.vrQntd = 0
                                }
    
                                estoqueMP.quantidade = parseFloat(novaQuantidade.toFixed(2))
                                qntdUsadaProducao -= qntdMinima;
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
                    } else {
                        dispatch(setLoading(false))
                        setNmProduto(estoqueMP.nmProduto)
                        setOpenDialog(true);
                        setEstoqueVazio(true);
                        throw new Error('estoque Vazio');
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
            const refTable = doc(db, "Estoque", refID);
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

    return {
        removedStockEntrega,
        removedStockVenda, 
        removedStockCompras,
        updateStock
    }
}