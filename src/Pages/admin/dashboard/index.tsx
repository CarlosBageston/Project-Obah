import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Grid, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HorizontalTabs from '../../../Components/horizontaltabs/horizontalTabs';
import DashboardCard from './dashboardCard';
import { useTableKeys } from '../../../hooks/tableKey';
import { DashboardCompraModel, DashboardGeneral, DashboardVendasEntregaModel } from '../../../hooks/useCalculateValueDashboard';
import SituacaoProduto from '../../../enumeration/situacaoProduto';
import { useFormik } from 'formik';
import useHandleInputKeyPress from '../../../hooks/useHandleInputKeyPress';
import { getSingleItemByQuery } from '../../../hooks/queryFirebase';
import { useDispatch, useSelector } from 'react-redux';
import { where } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { RootState } from '../../../store/reducer/store';
import Input from '../../../Components/input';
import { NumberFormatForBrazilianCurrency } from '../../../hooks/formatCurrency';

interface DashboardLogin {
    passwordDashboard: string
}

interface DataDashboard {
    vlTotal: string;
    vlLucro: string;
}

function Dashboard() {
    const [selectTab, setSelectTab] = useState<number>(0);
    const [showData, setShowData] = useState<boolean>(false);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState<boolean>(false);
    const [dataDashboard, setDataDashboard] = useState<DataDashboard>();

    const tableKeys = useTableKeys();
    const refInput = useRef<HTMLInputElement>(null);
    const { onKeyPressHandleSubmit } = useHandleInputKeyPress();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);

    const handleAuthSubmit = async (values: DashboardLogin) => {
        const res = await getSingleItemByQuery<DashboardLogin>(tableKeys.Empresa, [where('uid', '==', user?.uid)], dispatch)
        const hashedInputPassword = CryptoJS.SHA256(values.passwordDashboard).toString(CryptoJS.enc.Base64);
        if (res?.passwordDashboard) {
            if (hashedInputPassword === res.passwordDashboard) {
                setShowData(true);
                setIsAuthDialogOpen(false);
                formik.resetForm();
            } else {
                formik.setFieldError('passwordDashboard', 'Senha incorreta');
                formik.setFieldTouched('passwordDashboard', true, false);
            }
        } else {
            formik.setFieldError('passwordDashboard', 'Senha incorreta');
            formik.setFieldTouched('passwordDashboard', true, false);
        }
    };
    const formik = useFormik<DashboardLogin>({
        initialValues: {
            passwordDashboard: '',
        },
        onSubmit: handleAuthSubmit
    })

    const handleToggleVisibility = () => {
        if (showData) {
            setShowData(false);
        } else {
            setIsAuthDialogOpen(true);
        }
    };
    const cardStyle = {
        backgroundColor: '#047e00',
        borderRadius: '15px',
        opacity: showData ? 1 : 0.5,
        filter: showData ? 'none' : 'grayscale(100%)',
        cursor: showData ? 'default' : 'not-allowed',
    };
    useEffect(() => {
        const dataDashboard = async () => {
            await getSingleItemByQuery<DashboardGeneral>(
                tableKeys.DashboardGeral,
                [where('dtDashboard', '==', new Date().toISOString().split('-')[0])],
                dispatch
            ).then((res) => {
                const dados: DataDashboard = {
                    vlTotal: res?.vlTotalAnual ? NumberFormatForBrazilianCurrency(res.vlTotalAnual) : 'Erro ao Buscar',
                    vlLucro: res?.vlLucroAnual ? NumberFormatForBrazilianCurrency(res.vlLucroAnual) : 'Erro ao Buscar',
                }
                setDataDashboard(dados);
            });
        }
        dataDashboard()
    }, [dispatch])
    return (
        <>
            <Grid container justifyContent="flex-end" mt={5} mb={'-4rem'} paddingRight={'2rem'} >
                <IconButton onClick={handleToggleVisibility} style={{ marginRight: '1rem' }}>
                    {showData ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
                <Grid item xs={2} mr={5}>
                    <Card style={cardStyle}>
                        <CardContent>
                            <Typography variant="h6" width={'8rem'} color={'#fff'}>Receita Anual</Typography>
                            <Typography variant="h5" width={'11rem'} color={'#fff'}>
                                {showData ? dataDashboard?.vlTotal : 'R$ ********'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={2}>
                    <Card style={cardStyle}>
                        <CardContent>
                            <Typography variant="h6" width={'8rem'} color={'#fff'}>Lucro Anual</Typography>
                            <Typography variant="h5" width={'11rem'} color={'#fff'}>
                                {showData ? dataDashboard?.vlLucro : 'R$ ********'}
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

            <Dialog
                open={isAuthDialogOpen}
                onClose={() => setIsAuthDialogOpen(false)}
                TransitionProps={{
                    onEntered: () => {
                        if (refInput.current) {
                            refInput.current.focus();
                        }
                    },
                }}
            >
                <DialogTitle>Digite sua senha para acessar os dados</DialogTitle>
                <DialogContent>
                    <Input
                        label="Senha"
                        type="password"
                        fullWidth
                        variant='standard'
                        value={formik.values.passwordDashboard}
                        inputRef={refInput}
                        onKeyDown={(e) => onKeyPressHandleSubmit(e, formik.handleSubmit)}
                        onChange={(e) => formik.setFieldValue('passwordDashboard', e.target.value)}
                        error={formik.touched.passwordDashboard && formik.errors.passwordDashboard ? formik.errors.passwordDashboard : ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAuthDialogOpen(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={() => formik.handleSubmit()} color="primary">
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Dashboard;
