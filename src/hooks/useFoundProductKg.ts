import ProdutosModel from "../Pages/admin/cadastroProdutos/model/produtos";


export function foundKgProduto(foundProduct: ProdutosModel): ProdutosModel {
    const clonedProduct = { ...foundProduct };
    if (clonedProduct.kgProduto && clonedProduct.kgProduto !== 1) {
        if(typeof clonedProduct.kgProduto === 'string') {
            clonedProduct.kgProduto = Number(clonedProduct.kgProduto);
        }
        const vlUnitario = clonedProduct.vlUnitario / clonedProduct.kgProduto;
        clonedProduct.vlUnitario = vlUnitario;
    }
    return clonedProduct;
}