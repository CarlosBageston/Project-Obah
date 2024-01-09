import { useEffect, useState } from 'react';
import ComprasModel from '../Pages/admin/compras/model/compras';
import SituacaoProduto from '../enumeration/situacaoProduto';
import ProdutosModel from '../Pages/admin/cadastroProdutos/model/produtos';
import EstoqueModel from '../Pages/admin/estoque/model/estoque';

/**
 * Hook personalizado para obter nomes únicos com base em determinados critérios.
 *
 * Este hook processa uma lista de compras e retorna os nomes únicos dos produtos
 * de acordo com o tipo de produto especificado (COMPRADO ou FABRICADO). Além disso,
 * pode considerar a edição de dados para atualizar dinamicamente a lista de nomes únicos.
 *
 * @param {ComprasModel[]} dataTable - Lista de compras a ser processada.
 * @param {SituacaoProduto | null} tpProduto - Tipo de produto atual selecionado.
 * @param {SituacaoProduto | null} optionTpProduto - Tipo de produto para filtrar (COMPRADO ou FABRICADO).
 * @param {boolean} [isEdit] - Indica se os dados estão sendo editados.
 * 
 * @returns {any[]} - Lista de nomes únicos de produtos com base nos parâmetros fornecidos.
 */
export function useUniqueNames(
    dataTable: ComprasModel[], 
    tpProduto: SituacaoProduto | null, 
    optionTpProduto: SituacaoProduto | null,
    dataTableProduto?: ProdutosModel[],
    dataTableEstoque?: EstoqueModel[],
    isEdit?: boolean
    ) {
    const [uniqueNames, setUniqueNames] = useState<any[]>([]);

    function lastProduct(filterUniqueNames: (ComprasModel)[], names: string[]) {
        const maxProductsByUniqueNames = names.map((uniqueName: string) => {
            const filteredProducts = filterUniqueNames
                .filter((prod) => prod.nmProduto === uniqueName && prod.nrOrdem !== undefined)
                .sort((a, b) => (a.nrOrdem || 0) - (b.nrOrdem || 0));

            if (filteredProducts.length > 0) {
                return filteredProducts[filteredProducts.length - 1];
            } else {
                return null;
            }
        });
        return maxProductsByUniqueNames;
    }

    function databaseSearch() {
        const databaseCompras = dataTable.filter((produtos: ComprasModel) => produtos.tpProduto === SituacaoProduto.COMPRADO)
        if(dataTableEstoque && optionTpProduto === SituacaoProduto.COMPRADO){
            dataTableEstoque.forEach(stock => {
                if(stock.quantidade === 0){
                    const newCompra: ComprasModel ={
                        cdProduto: stock.cdProduto,
                        cxProduto: null,
                        dtCompra: null,
                        kgProduto: null,
                        nmProduto: stock.nmProduto,
                        qntMinima: stock.qntMinima,
                        nrOrdem: 0,
                        quantidade: 0,
                        totalPago: null,
                        tpProduto: stock.tpProduto,
                        vlUnitario: 0
                    } 
                    databaseCompras.push(newCompra)
                }
            })
            return databaseCompras;
        }
        if (dataTableProduto && optionTpProduto === SituacaoProduto.FABRICADO) {
            const arrayCompras: ComprasModel[] = [];
        
            dataTableProduto.forEach(produto => {
                const matchingCompra = dataTable.find(compra => compra.nmProduto === produto.nmProduto);
        
                if (matchingCompra) {
                    // Se houver correspondência, adiciona a compra existente ao array
                    const newCompra = {...matchingCompra, mpFabricado: produto.mpFabricado}
                    arrayCompras.push(newCompra);
                } else {
                    // Se não houver correspondência, cria um novo objeto ComprasModel com base no produto
                    const newCompra: ComprasModel = {
                        cdProduto: produto.cdProduto,
                        cxProduto: null,
                        dtCompra: null,
                        kgProduto: null,
                        nmProduto: produto.nmProduto,
                        mpFabricado: produto.mpFabricado,
                        qntMinima: null, // Preencha com o valor apropriado ou ajuste conforme necessário
                        nrOrdem: produto.nrOrdem,
                        quantidade: 0,
                        totalPago: null,
                        tpProduto: SituacaoProduto.FABRICADO,
                        vlUnitario: produto.vlUnitario
                    };
                    arrayCompras.push(newCompra);
                }
            });
        
            return arrayCompras;
        }
    }

    useEffect(() => {
        if (optionTpProduto === SituacaoProduto.COMPRADO ) {
            const filterUniqueNames = databaseSearch();
            if(filterUniqueNames){
                const uniqueNames: string[] = Array.from(new Set(filterUniqueNames.map((nome: ComprasModel) => nome.nmProduto)));
                const maxProductsByUniqueNames = lastProduct(filterUniqueNames, uniqueNames);
                setUniqueNames(maxProductsByUniqueNames);
            }
        } else {
            const filterUniqueNames = databaseSearch()
            if(filterUniqueNames){
                const uniqueNames = Array.from(new Set(filterUniqueNames.map((nome: ComprasModel) => nome.nmProduto)));
                const maxProductsByUniqueNames = lastProduct(filterUniqueNames, uniqueNames);
                setUniqueNames(maxProductsByUniqueNames);
            }
        }
        
    }, [tpProduto, isEdit, optionTpProduto]);
    return uniqueNames;
}
