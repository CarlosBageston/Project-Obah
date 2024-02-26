import SituacaoProduto from "../../../../enumeration/situacaoProduto";
import ComprasModel from "./compras";

// Omitir os atributos
interface OmittedAttributes {
    dtCompra: Date | null;
    stEstoqueInfinito?: boolean;
    totalPago?: number | null;
    quantidade: number;
}

// Crie um novo tipo que estende ComprasModel e omite os atributos indesejados
type CompraHistoricoModel = Omit<ComprasModel, keyof OmittedAttributes> & {
    id?: string;
    nmProduto: string;
    cdProduto: string;
    vlUnitario: number;
    mpFabricado?: ComprasModel[];
    qntMinima: number | null;
    tpProduto: SituacaoProduto | null;
    stMateriaPrima?: boolean;
    kgProduto?: number;
    nrOrdem?: number;
};

export default CompraHistoricoModel;