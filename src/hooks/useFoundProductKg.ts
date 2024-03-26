import ProdutosModel from "../Pages/admin/cadastroProdutos/model/produtos";
import CompraHistoricoModel from "../Pages/admin/compras/model/comprahistoricoModel";


export function foundKgProduto(foundProduct: CompraHistoricoModel | ProdutosModel) {
    const clonedProduct = { ...foundProduct } as CompraHistoricoModel;
    if (clonedProduct.kgProduto && clonedProduct.kgProduto !== 1) {
        const vlUnitario = clonedProduct.vlUnitario / clonedProduct.kgProduto;
        clonedProduct.vlUnitario = vlUnitario;
    }
    return clonedProduct;
}