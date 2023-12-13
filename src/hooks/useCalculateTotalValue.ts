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
    const valorPago = produtoEncontrado.vlUnitario;
    const valueFormat = valorPago.match(/\d+/g)?.join('.');
    let result = 0;
    if (produtoEncontrado.cxProduto) {
        result = Number(valueFormat) / produtoEncontrado.cxProduto * Number(mp.quantidade);
    } else if (produtoEncontrado.kgProduto) {
        result = Number(valueFormat) / produtoEncontrado.kgProduto * Number(mp.quantidade);
    } else {
        result = Number(valueFormat) / Number(produtoEncontrado.quantidade) * Number(mp.quantidade);
    }
    return parseFloat(result.toFixed(2));
}