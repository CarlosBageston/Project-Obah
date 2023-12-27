import { useEffect, useState } from 'react';
import ComprasModel from '../Pages/admin/compras/model/compras';
import ProdutosModel from '../Pages/admin/cadastroProdutos/model/produtos';
import SituacaoProduto from '../enumeration/situacaoProduto';


export function useUniqueNames(
    dataTable: ComprasModel[], 
    produtoDataTable: ProdutosModel[], 
    tpProduto: SituacaoProduto | null, 
    optionTpProduto: SituacaoProduto | null,
    isEdit?: boolean
    ) {
    const [uniqueNames, setUniqueNames] = useState<any[]>([]);
    function lastProduct(filterUniqueNames: (ComprasModel | ProdutosModel)[], names: string[]) {
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
        if (optionTpProduto === SituacaoProduto.COMPRADO) {
            const filterUniqueNames = dataTable.filter((produtos: ComprasModel) => produtos.tpProduto === SituacaoProduto.COMPRADO);
            const uniqueNames: string[] = Array.from(new Set(filterUniqueNames.map((nome: ComprasModel) => nome.nmProduto)));
            const maxProductsByUniqueNames = lastProduct(filterUniqueNames, uniqueNames);
            setUniqueNames(maxProductsByUniqueNames);
        } else {
            const filterUniqueNames = produtoDataTable.filter((produtos:ProdutosModel) => produtos.tpProduto === SituacaoProduto.FABRICADO)
            const uniqueNames = Array.from(new Set(filterUniqueNames.map((nome: ProdutosModel) => nome.nmProduto)));
            const maxProductsByUniqueNames = lastProduct(filterUniqueNames, uniqueNames);
            setUniqueNames(maxProductsByUniqueNames);
        }
    }, [tpProduto, isEdit])
    return uniqueNames;
}
