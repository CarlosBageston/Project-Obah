import { useEffect, useState } from 'react';
import SituacaoProduto from '../enumeration/situacaoProduto';
import ComprasModel from '../Pages/admin/compras/model/compras';
import CompraHistoricoModel from '../Pages/admin/compras/model/comprahistoricoModel';

/**
 * Hook personalizado para obter nomes únicos com base em determinados critérios.
 *
 * Este hook processa uma lista de compras e retorna os nomes únicos dos produtos
 * de acordo com o tipo de produto especificado (COMPRADO ou FABRICADO). Além disso,
 * pode considerar a edição de dados para atualizar dinamicamente a lista de nomes únicos.
 *
 * @param dataTable - Lista de compras a ser processada.
 * @param tpProduto - Tipo de produto atual selecionado.
 * @param optionTpProduto - Tipo de produto para filtrar (COMPRADO ou FABRICADO).
 * @param isEdit - Indica se os dados estão sendo editados.
 * 
 * @returns Lista de nomes únicos de produtos com base nos parâmetros fornecidos.
 */
export function useUniqueNames(
    dataTable: CompraHistoricoModel[], 
    tpProduto: SituacaoProduto | null, 
    optionTpProduto: SituacaoProduto | null,
    isEdit?: boolean
    ) {
    const [uniqueNames, setUniqueNames] = useState<any>([]);

  /**
     * Função para realizar a busca no banco de dados de acordo com o tipo de produto selecionado.
     * @returns {ComprasModel[] | ProdutosModel[]} Lista de compras ou produtos do banco de dados.
     */
    function databaseSearch(): ComprasModel[] | CompraHistoricoModel[] {
        if (optionTpProduto === SituacaoProduto.COMPRADO) {
            const databaseCompras = dataTable.filter((produto) =>
            (produto.tpProduto === SituacaoProduto.FABRICADO && produto.stMateriaPrima) || produto.tpProduto === SituacaoProduto.COMPRADO 
            );
            return databaseCompras as ComprasModel[];
        } else {
            const databaseProduto = dataTable.filter((produto) =>
                (produto.tpProduto === SituacaoProduto.FABRICADO && produto.stMateriaPrima) || produto.tpProduto === SituacaoProduto.FABRICADO
            );
            return databaseProduto || [] as ComprasModel[];
        }
    }

    useEffect(() => {
            setUniqueNames(databaseSearch);
    }, [tpProduto, isEdit]);
    return uniqueNames;
}
