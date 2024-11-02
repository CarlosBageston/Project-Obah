
import { where } from "firebase/firestore";
import GenericTable from "../../../../Components/table";
import { TableKey } from "../../../../types/tableName";
import SituacaoProduto from "../../../../enumeration/situacaoProduto";
import { Box, Typography } from "@mui/material";

function EstoqueFabricados() {

    return (
        <Box sx={{ padding: '5rem' }}>
            <Typography variant="h4" gutterBottom>Estoque de Produtos Fabricados</Typography>
            <GenericTable
                columns={[
                    { label: 'Código', name: 'cdProduto', shouldApplyFilter: true },
                    { label: 'Nome', name: 'nmProduto', shouldApplyFilter: true },
                    { label: 'Quantidade', name: 'quantidade', isInfinite: true },
                    { label: 'Status', name: 'stEstoque' }
                ]}
                collectionName={TableKey.Estoque}
                constraints={[where('tpProduto', '==', SituacaoProduto.FABRICADO)]}
                isVisibleEdit
                isVisibledDelete
                checkStock
                pageSize={10}
            />
        </Box>
    );
}

export default EstoqueFabricados;