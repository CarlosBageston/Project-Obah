
import { useState } from 'react'
import HorizontalTabs from '../../../Components/horizontaltabs/horizontalTabs';
import DashboardCard from './dashboardCard';
import { Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTableKeys } from '../../../hooks/tableKey';
import { DashboardCompraModel, DashboardVendasEntregaModel } from '../../../hooks/useCalculateValueDashboard';
import SituacaoProduto from '../../../enumeration/situacaoProduto';

function Dashboard() {
    const [selectTab, setSelectTab] = useState<number>(0);
    const [showData, setShowData] = useState<boolean>(false);
    const tableKeys = useTableKeys();


    const toggleVisibility = () => {
        setShowData((prevShowData) => !prevShowData);
    };
    return (
        <>
            <Grid container justifyContent="flex-end" mt={5} mb={'-4rem'} paddingRight={'2rem'} >
                <IconButton onClick={toggleVisibility} aria-label="toggle visibility" style={{ marginRight: '1rem' }}>
                    {showData ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
                <Grid item xs={2} mr={5}>
                    <Card style={{ maxWidth: 300, backgroundColor: '#047e00', borderRadius: '15px' }}>
                        <CardContent>
                            <Typography variant="h6" width={'8rem'} color={'#fff'}>Receita Anual</Typography>
                            <Typography variant="h5" width={'11rem'} color={'#fff'}>
                                {showData ? 'R$ 60.000,00' : 'R$ ********'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={2}>
                    <Card style={{ maxWidth: 300, backgroundColor: '#047e00', borderRadius: '15px' }}>
                        <CardContent>
                            <Typography variant="h6" width={'8rem'} color={'#fff'}>Lucro Anual</Typography>
                            <Typography variant="h5" width={'11rem'} color={'#fff'}>
                                {showData ? 'R$ 70.000,00' : 'R$ ********'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <HorizontalTabs
                selectedIndex={selectTab}
                onChangeIndex={setSelectTab}
                title="Registros e comparativos"
                tabs={[
                    {
                        label: 'Compras',
                        content: (
                            <DashboardCard<DashboardCompraModel>
                                showData={showData}
                                collectionName={tableKeys.DashboardCompra}
                                nameGrafico='Compras'
                                nameUnidade='Compradas'
                                selectTab={selectTab}
                                tpProduto={SituacaoProduto.COMPRADO}
                                stMateriaPrima
                            />
                        )
                    },
                    {
                        label: 'Vendas',
                        content: (
                            <DashboardCard<DashboardVendasEntregaModel>
                                showData={showData}
                                collectionName={tableKeys.DashboardVendas}
                                nameGrafico='Vendas'
                                nameUnidade='Vendidas'
                                selectTab={selectTab}
                            />
                        )
                    },
                    {
                        label: 'Entregas',
                        content: (
                            <DashboardCard<DashboardVendasEntregaModel>
                                showData={showData}
                                collectionName={tableKeys.DashboardEntregas}
                                nameGrafico='Entregas'
                                nameUnidade='Entregues'
                                selectTab={selectTab}
                            />
                        )
                    }
                ]}
            />
        </>
    )
}

export default Dashboard;