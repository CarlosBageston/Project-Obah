import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Select, MenuItem, InputLabel, FormControl, IconButton, Autocomplete, TextField, AutocompleteChangeReason, FormHelperText } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Title, Legend } from 'chart.js';
import TooltipMui from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import { where } from 'firebase/firestore';
import { getItemsByQuery } from '../../../hooks/queryFirebase';
import { useDispatch } from 'react-redux';
import { useTableKeys } from '../../../hooks/tableKey';
import { NumberFormatForBrazilianCurrency } from '../../../hooks/formatCurrency';
import { formatDescription } from '../../../utils/formattedString';
import ProdutosModel from '../cadastroProdutos/model/produtos';
import useDebouncedSuggestions from '../../../hooks/useDebouncedSuggestions';
import { useFormik } from 'formik';
import SituacaoProduto from '../../../enumeration/situacaoProduto';
import * as Yup from 'yup';
import { theme } from '../../../theme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Title, Legend);

const months = Array.from({ length: 12 }, (_, index) =>
    new Date(0, index).toLocaleString('default', { month: 'long' })
);
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

interface DashboardModel {
    showData: boolean;
    collectionName: string;
    nameUnidade: string;
    nameGrafico: string;
    selectTab: number
    tpProduto?: SituacaoProduto
    stMateriaPrima?: boolean
}
interface DashboardCardProps {
    month: string;
    year?: number;
    nmProduto?: string
    vlTotalAnual?: number
    difference?: number
    vlTotalMonth?: number
    qntTotalMonth?: number
}
function DashboardCard<T>({ showData, collectionName, nameUnidade, nameGrafico, selectTab, tpProduto, stMateriaPrima }: DashboardModel) {
    const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long' });
    const anoAtual = new Date().getFullYear();
    const [dashboardData, setDashboardData] = useState<T[]>([]);
    const [annualData, setAnnualData] = useState<number[]>([]);
    const [key, setKey] = useState<number>(0);
    const tableKeys = useTableKeys();
    const dispatch = useDispatch();

    const { errors, touched, values, setFieldValue, handleSubmit, resetForm, setFieldTouched } = useFormik<DashboardCardProps>({
        initialValues: {
            month: showData ? mesAtual : '',
            year: showData ? anoAtual : undefined
        },
        validateOnBlur: true,
        validateOnChange: true,
        validationSchema: Yup.object({
            month: Yup.string().required('Campo Obrigatório'),
            year: Yup.number().required('Campo Obrigatório')
        }),
        onSubmit: () => handleMonthChange()
    })
    useEffect(() => {
        const loadAnnualData = async () => {
            const data = await getItemsByQuery<T>(
                collectionName,
                [where('dtProdutoAuxiliar', 'array-contains-any', months.map((_, index) => `${years[0]}/${(index + 1).toString().padStart(2, "0")}`))],
                dispatch
            );

            setDashboardData(data.data);

            const yearlyTotals = months.map((_, index) => getTotalForMonth(index, data.data));
            setAnnualData(yearlyTotals);
            const totalAnnualSum = yearlyTotals.reduce((sum, monthTotal) => sum + monthTotal, 0);
            setFieldValue('vlTotalAnual', totalAnnualSum);
        };

        if (showData) {
            loadAnnualData();
        }
        resetForm();
        setFieldValue('year', undefined);
        setKey(Math.random());
    }, [selectTab, showData]);


    const getTotalForMonth = (monthIndex: number, data = dashboardData) => {
        const formattedMonth = (monthIndex + 1).toString().padStart(2, "0");
        const monthYear = `${values.year ?? years[0]}/${formattedMonth}`;

        return data.reduce((total: any, produto: any) => {
            return total + (produto.totalMensal?.reduce((sum: any, item: any) => {
                return sum + (item.dtProduto === monthYear ? item.vlTotal ?? 0 : 0);
            }, 0) || 0);
        }, 0);
    };

    const handleMonthChange = async () => {
        if (values.nmProduto) {
            const foundProduto = await getItemsByQuery<T>(collectionName, [where('nmProduto', '==', values.nmProduto)], dispatch);
            if (foundProduto) {
                const monthIndex = months.indexOf(values.month);
                const totalMonth = getTotalForMonth(monthIndex, foundProduto.data);
                const previousMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
                const previousMonthTotal = getTotalForMonth(previousMonthIndex, foundProduto.data);
                setFieldValue('vlTotalMonth', totalMonth);
                const difference = totalMonth - previousMonthTotal;
                setFieldValue('difference', difference);
                const formattedMonth = (monthIndex + 1).toString().padStart(2, "0");
                const monthYear = `${values.year}/${formattedMonth}`;
                const totalQuantity = foundProduto.data.reduce((total: any, produto: any) => {
                    const monthQuantity = produto.totalMensal?.reduce((sum: any, item: any) => {
                        return sum + (item.dtProduto === monthYear
                            ? (nameGrafico === 'Compras' ? item.qntdTotal ?? 0 : item.quantidade ?? 0)
                            : 0);
                    }, 0) ?? 0;

                    return total + monthQuantity;
                }, 0);

                // Atualiza o valor de totalQuantity para o campo desejado
                setFieldValue('qntTotalMonth', totalQuantity);

            }
        } else {
            const monthIndex = months.indexOf(values.month);
            const totalMonth = getTotalForMonth(monthIndex);
            const previousMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
            const previousMonthTotal = getTotalForMonth(previousMonthIndex);
            setFieldValue('vlTotalMonth', totalMonth);
            const difference = totalMonth - previousMonthTotal;
            setFieldValue('difference', difference);
        }
    }

    const lineData = {
        labels: months,
        datasets: [
            {
                label: `${nameGrafico} Mensal`,
                data: showData ? annualData : [],
                backgroundColor: "#18455c",
            }
        ],
    };

    const suggestions: ProdutosModel[] = useDebouncedSuggestions<ProdutosModel>(formatDescription(values.nmProduto ?? ''), tableKeys.Produtos, dispatch, 'Produto', tpProduto, stMateriaPrima);
    function handleAutoComplete(_: React.SyntheticEvent<Element, Event>, newValue: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            resetForm();
            setKey(Math.random());
        } else if (newValue) {
            setFieldValue('nmProduto', newValue.nmProduto);
        }
    }
    const cardStyle = {
        backgroundColor: '#1c5a7a',
        borderRadius: '15px',
        opacity: showData ? 1 : 0.5,
        filter: showData ? 'none' : 'grayscale(100%)',
        cursor: showData ? 'default' : 'not-allowed',
    };
    const selectstyle = {
        opacity: showData ? 1 : 0.5,
        filter: showData ? 'none' : 'grayscale(100%)',
        cursor: showData ? 'pointer' : 'not-allowed',
    };
    return (
        <Box sx={{ padding: '2rem' }}>
            <Grid container spacing={3} mb={4}>
                <Grid item xs={2}>
                    <FormControl fullWidth variant='standard' style={selectstyle}>
                        <InputLabel >Mês</InputLabel>
                        <Select
                            value={values.month}
                            disabled={!showData}
                            key={key}
                            style={selectstyle}
                            onChange={(e) => setFieldValue('month', e.target.value)}
                            label="Mês"
                        >
                            {months.map((month, index) => (
                                <MenuItem key={index} value={month}>
                                    {month}
                                </MenuItem>
                            ))}
                        </Select>
                        {showData && errors.month && touched.month && (
                            <FormHelperText style={{ color: theme.paletteColor.error }}>{errors.month}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <FormControl style={selectstyle} fullWidth variant='standard'>
                        <InputLabel>Ano</InputLabel>
                        <Select
                            value={values.year ?? years[0]}
                            key={key}
                            onChange={(e) => setFieldValue('year', Number(e.target.value))}
                            label="Ano"
                            disabled={!showData}
                            style={selectstyle}
                        >
                            {years.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                        {showData && errors.year && touched.year && (
                            <FormHelperText style={{ color: theme.paletteColor.error }}>{errors.year}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={2} >
                    <Autocomplete
                        freeSolo
                        key={key}
                        disabled={!showData}
                        style={selectstyle}
                        options={suggestions}
                        value={suggestions.find((item: any) => item.nmProduto === values.nmProduto) || null}
                        getOptionLabel={(option: any) => option && option.nmProduto ? option.nmProduto : ""}
                        onChange={(_, newValue, reason) => handleAutoComplete(_, newValue, reason)}
                        onInputChange={(_, newInputValue, reason) => {
                            if (reason === 'clear') handleAutoComplete(_, null, 'clear');
                            setFieldValue('nmProduto', newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Nome do Produto" variant="standard" />
                        )}
                    />
                </Grid>
                <Grid item xs={1} mt={1}>
                    <TooltipMui title={'Pesquisar'}>
                        <IconButton
                            style={selectstyle}
                            onClick={async () => {
                                if (showData) {
                                    setFieldTouched('month', true, false);
                                    setFieldTouched('year', true, false);
                                    handleSubmit();
                                }
                            }}
                        >
                            <SearchIcon fontSize='inherit' />
                        </IconButton>
                    </TooltipMui>
                </Grid>
            </Grid>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={3}>
                    <Card style={cardStyle}>
                        <CardContent>
                            <Typography variant="h6" color={'#fff'}>Diferença Mês Anterior</Typography>
                            <Typography variant="h4" color={'#fff'}>
                                {NumberFormatForBrazilianCurrency(values.difference ?? 0)}
                            </Typography>
                            <Typography variant="body2" color={'#fff'}>
                                {values.difference !== undefined
                                    ? values.difference > 0
                                        ? 'Aumento '
                                        : values.difference < 0
                                            ? 'Diminuição '
                                            : 'Nenhuma Diferença '
                                    : 'Nenhuma Diferença '}
                                em relação ao mês anterior
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card style={cardStyle}>
                        <CardContent>
                            <Typography variant="h6" color={'#fff'}>Total no Mês Atual</Typography>
                            <Typography variant="h4" color={'#fff'}>{NumberFormatForBrazilianCurrency(values.vlTotalMonth ?? 0)}</Typography>
                            <Typography variant="body2" color={'#fff'}>
                                Total de compras realizadas neste mês
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card style={cardStyle}>
                        <CardContent>
                            <Typography variant="h6" color={'#fff'}>Unidades {nameUnidade}</Typography>
                            <Typography variant="h4" color={'#fff'}>{values.qntTotalMonth ?? 0}</Typography>
                            <Typography variant="body2" color={'#fff'}>
                                Valor aparece apenas se filtrar por produto
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card style={cardStyle}>
                        <CardContent>
                            <Typography variant="h6" color={'#fff'}>Total Receita Anual</Typography>
                            <Typography variant="h4" color={'#fff'}>{NumberFormatForBrazilianCurrency(values.vlTotalAnual ?? 0)}</Typography>
                            <Typography variant="body2" color={'#fff'}>
                                Total acumulado de compras ao longo do ano
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={8}>
                    <Typography variant="h6" gutterBottom>
                        {nameGrafico} Mensais ao Longo do Ano
                    </Typography>
                    <Box sx={{ height: 300 }}>
                        <Bar
                            data={lineData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'top' },
                                    tooltip: {
                                        callbacks: {
                                            label: function (context: any) {
                                                const label = context.dataset.label || '';
                                                const value = NumberFormatForBrazilianCurrency(context.raw);
                                                return `${label}: ${value}`;
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        ticks: {

                                            // Formata os valores no eixo Y
                                            callback: function (value: number | string) {
                                                return NumberFormatForBrazilianCurrency(value as number);
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

export default DashboardCard;
