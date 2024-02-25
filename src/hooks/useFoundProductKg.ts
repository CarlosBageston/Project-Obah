import CompraHistoricoModel from "../Pages/admin/compras/model/comprahistoricoModel";


export function foundKgProduto(foundProduct: CompraHistoricoModel) {
    const clonedProduct = { ...foundProduct };
    if (clonedProduct.kgProduto && clonedProduct.kgProduto !== 1) {
        const vlUnitario = clonedProduct.vlUnitario / clonedProduct.kgProduto;
        clonedProduct.vlUnitario = vlUnitario;
    }
    return clonedProduct;
}