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
 * @param dataTable - Lista de compras a ser processada.
 * @param tpProduto - Tipo de produto atual selecionado.
 * @param optionTpProduto - Tipo de produto para filtrar (COMPRADO ou FABRICADO).
 * @param dataTableProduto - Lista de produtos para considerar no filtro.
 * @param dataTableEstoque - Lista de estoque para considerar no filtro.
 * @param isEdit - Indica se os dados estão sendo editados.
 * 
 * @returns Lista de nomes únicos de produtos com base nos parâmetros fornecidos.
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

    /**
     * Retorna o último produto correspondente a cada nome único.
     *
     * @param filterUniqueProducts - Lista de compras filtradas.
     * @param uniqueNames - Lista de nomes únicos.
     * 
     * @returns Lista dos últimos produtos correspondentes aos nomes únicos.
     */
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

    function createCompraModel(
        cdProduto: string,
        nmProduto: string,
        optionTpProduto: SituacaoProduto,
        qntMinima?: number,
        nrOrdem?: number,
        vlUnitario?: number,
        mpFabricado?: ComprasModel[]
        ) {
        const defaultProps: ComprasModel = {
            cdProduto: cdProduto,
            cxProduto: null,
            dtCompra: null,
            kgProduto: null,
            nmProduto: nmProduto,
            qntMinima: qntMinima ? qntMinima : null,
            nrOrdem: nrOrdem ? nrOrdem : 0,
            quantidade: 0,
            mpFabricado: mpFabricado ? mpFabricado : undefined,
            totalPago: null,
            vlUnitario: vlUnitario ? vlUnitario : 0,
            tpProduto: null
        };
    
        if (optionTpProduto === SituacaoProduto.COMPRADO) {
            defaultProps.tpProduto = SituacaoProduto.COMPRADO;
        } else if (optionTpProduto === SituacaoProduto.FABRICADO) {
            defaultProps.tpProduto = SituacaoProduto.FABRICADO;
        }
    
        return { ...defaultProps };
    }
    /**
     * Realiza a busca de produtos na base de dados com base no tipo de produto e outras condições.
     * 
     * @returns Lista de produtos encontrados com base nas condições especificadas.
     */
    function databaseSearch() {
        const databaseCompras = dataTable.filter((produtos: ComprasModel) => produtos.tpProduto === SituacaoProduto.COMPRADO)
        if(dataTableEstoque && optionTpProduto === SituacaoProduto.COMPRADO && dataTableProduto){
            dataTableEstoque.forEach(stock => {
                if(stock.quantidade === 0){
                    const newCompra: ComprasModel = createCompraModel(stock.cdProduto, stock.nmProduto, stock.tpProduto, stock.qntMinima)
                    databaseCompras.push(newCompra)
                }
            })
            dataTableProduto.forEach(produto => {
                const matchingCompra = dataTable.find(compra => compra.nmProduto === produto.nmProduto);
                if (!matchingCompra && produto.tpProduto === SituacaoProduto.COMPRADO) {
                    const newCompra: ComprasModel = createCompraModel(
                        produto.cdProduto, 
                        produto.nmProduto, 
                        SituacaoProduto.COMPRADO,
                        undefined, 
                        produto.nrOrdem,
                        produto.vlUnitario, 
                        produto.mpFabricado
                        )
                    databaseCompras.push(newCompra);
                }
            });
            return databaseCompras;
        }
        if (dataTableProduto && optionTpProduto === SituacaoProduto.FABRICADO) {
            const arrayCompras: ComprasModel[] = [];
        
            dataTableProduto.forEach(produto => {
                if(produto.tpProduto === SituacaoProduto.COMPRADO) return;
                const matchingCompra = dataTable.find(compra => compra.nmProduto === produto.nmProduto);
                if (matchingCompra ) {
                    const newCompra = {...matchingCompra, mpFabricado: produto.mpFabricado}
                    arrayCompras.push(newCompra);
                } else {
                    const newCompra: ComprasModel = createCompraModel(
                        produto.cdProduto, 
                        produto.nmProduto, 
                        SituacaoProduto.FABRICADO,
                        undefined, 
                        produto.nrOrdem,
                        produto.vlUnitario, 
                        produto.mpFabricado
                        )
                    arrayCompras.push(newCompra);
                }
            });
        
            return arrayCompras;
        }
        return databaseCompras
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
