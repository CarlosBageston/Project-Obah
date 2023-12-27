import ComprasModel from "../Pages/admin/compras/model/compras";



export function calculateTotalValue(mpList: ComprasModel[] | ComprasModel, comprasDataTable: ComprasModel[] | ComprasModel): number {
    let soma = 0;
    if (Array.isArray(comprasDataTable) && Array.isArray(mpList)) {
        for (const mp of mpList) {
            const produtoEncontrado = comprasDataTable.find(produto => produto.nmProduto === mp.nmProduto);
            
            if (produtoEncontrado) {
                soma += calcularValorParaProduto(mp, produtoEncontrado);
            }
        }
    } else if (!Array.isArray(comprasDataTable) && !Array.isArray(mpList)) {
        soma = calcularValorParaProduto(mpList, comprasDataTable);
    }

    return soma;
}
export function calcularValorParaProduto(mp: ComprasModel, produtoEncontrado: ComprasModel): number {
    let result = 0;
    if (produtoEncontrado.cxProduto) {
        result = produtoEncontrado.vlUnitario / produtoEncontrado.cxProduto * mp.quantidade;
    } else if (produtoEncontrado.kgProduto) {
        result = produtoEncontrado.vlUnitario / produtoEncontrado.kgProduto * mp.quantidade;
    } else {
        result = produtoEncontrado.vlUnitario / produtoEncontrado.quantidade * mp.quantidade;
    }
    return parseFloat(result.toFixed(2));
}