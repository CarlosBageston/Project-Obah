import { useEffect, useState } from 'react';
import ComprasModel from '../Pages/admin/compras/model/compras';
import SituacaoProduto from '../enumeration/situacaoProduto';

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
    isEdit?: boolean
    ) {
    const [uniqueNames, setUniqueNames] = useState<any[]>([]);

    function filterDataByType(type: SituacaoProduto) {
        return dataTable.filter((produto: ComprasModel) => produto.tpProduto === type);
      }

    function lastProduct(filterUniqueNames: (ComprasModel )[], names: string[]) {
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
    useEffect(() => {
        let filterUniqueNames: ComprasModel[] = [];
    
        if (optionTpProduto === SituacaoProduto.COMPRADO) {
          filterUniqueNames = filterDataByType(SituacaoProduto.COMPRADO);
        } else {
          filterUniqueNames = filterDataByType(SituacaoProduto.FABRICADO);
        }
    
        const uniqueNames: string[] = Array.from(new Set(filterUniqueNames.map((produto: ComprasModel) => produto.nmProduto)));
        const maxProductsByUniqueNames = lastProduct(filterUniqueNames, uniqueNames);
        setUniqueNames(maxProductsByUniqueNames);
      }, [tpProduto, isEdit, optionTpProduto]);
    return uniqueNames;
}
