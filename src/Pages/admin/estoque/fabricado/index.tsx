
import { where } from "firebase/firestore";
import GenericTable from "../../../../Components/table";
import SituacaoProduto from "../../../../enumeration/situacaoProduto";
import { Box, Typography } from "@mui/material";
import { useTableKeys } from "../../../../hooks/tableKey";

function EstoqueFabricados() {
    const tableKeys = useTableKeys();

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
                collectionName={tableKeys.Estoque}
                constraints={[where('tpProduto', '==', SituacaoProduto.FABRICADO)]}
                isVisibleEdit
                isVisibledDelete
                checkStock
                pageSize={7}
            />
        </Box>
    );
}

export default EstoqueFabricados;