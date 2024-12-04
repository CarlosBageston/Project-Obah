import * as Yup from 'yup';
import moment from 'moment';
import { useFormik } from 'formik';
import { db } from "../../../firebase";
import Input from "../../../Components/input";
import { EntregaModel } from "./model/entrega";
import Button from "../../../Components/button";
import { AiTwotonePrinter } from 'react-icons/ai';
import GenericTable from "../../../Components/table";
import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useRef } from "react";
import ClienteModel from "../cadastroClientes/model/cliente";
import formatDate from "../../../Components/masks/formatDate";
import { setMessage } from '../../../store/reducer/reducer';
import { addDoc, collection } from "firebase/firestore";
import { Autocomplete, AutocompleteChangeReason, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";

//hooks
import useEstoque from '../../../hooks/useEstoque';
import useDeleteOldData from '../../../hooks/useDeleteOldData';
import useDebouncedSuggestions from '../../../hooks/useDebouncedSuggestions';
import CustomSnackBar, { StateSnackBar } from '../../../Components/snackBar/customsnackbar';
import { RootState } from '../../../store/reducer/store';
import { useTableKeys } from '../../../hooks/tableKey';
import { formatDescription } from '../../../utils/formattedString';
import { convertToNumber, NumberFormatForBrazilianCurrency } from '../../../hooks/formatCurrency';
import { updateAddDashboardVendasEntregas } from '../../../hooks/useCalculateValueDashboard';
import { setLoadingGlobal } from '../../../store/reducer/loadingSlice';
import { format } from 'date-fns';

function Entregas() {
    const [key, setKey] = useState<number>(0);
    const [editData, setEditData] = useState<EntregaModel>();
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const message = useSelector((state: RootState) => state.user.message);
    const loadingGlobal = useSelector((state: RootState) => state.loading.loadingGlobal);
    const ref = useRef<HTMLDivElement>(null);
    const empresa = useSelector((state: RootState) => state.empresaOnline);
    const [horaAtual, setHoraAtual] = useState<string>('');
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const dispatch = useDispatch();
    const { removedStock } = useEstoque();
    const { deleteEntregas } = useDeleteOldData();
    const tableKeys = useTableKeys();



    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<EntregaModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues: {
            vlLucro: 0,
            vlEntrega: 0,
            dtEntrega: null,
            nmCliente: '',
            produtos: [],
        },
        validationSchema: Yup.object().shape({
            vlLucro: Yup.string().optional(),
            vlEntrega: Yup.string().required('Campo obrigatório'),
            dtEntrega: Yup.string().required('Campo obrigatório'),
        }),
        onSubmit: hundleSubmitForm,
    });


    //enviando formulario
    async function hundleSubmitForm() {
        dispatch(setLoadingGlobal(true))
        removedStock(values.produtos)
        values.dtEntrega = moment(values.dtEntrega, 'DD/MM/YYYY').format('YYYY/MM/DD')
        values.nmClienteFormatted = formatDescription(values.nmCliente)
        values.vlEntrega = convertToNumber(values.vlEntrega.toString())
        values.vlLucro = convertToNumber(values.vlLucro.toString())
        values.produtos = values.produtos.filter(produto => produto.quantidade !== null)
        updateAddDashboardVendasEntregas(values.produtos, values.dtEntrega ?? '', tableKeys.DashboardEntregas, dispatch)
        await addDoc(collection(db, tableKeys.Entregas), {
            ...values
        })
            .then(() => {
                dispatch(setLoadingGlobal(false))
                setEditData(values)
                setOpenSnackBar(prev => ({ ...prev, success: true }))
            })
            .catch(() => {
                dispatch(setLoadingGlobal(false))
                dispatch(setMessage('Erro ao Cadastrar Entrega'))
                setOpenSnackBar(prev => ({ ...prev, error: true }))
            });
        resetForm()
        setOpenDialog(false)
        setKey(Math.random());
    }

    //manupulando evento de onchange do Select
    function handleClienteChange(_: React.SyntheticEvent<Element, Event>, value: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            resetForm()
            setFieldValue('produtos', [])
            setKey(Math.random());
        } else {
            setFieldValue('nmCliente', value.nmCliente)
            setFieldValue('produtos', value.produtos)
            setFieldValue('dtEntrega', moment(new Date()).format('DD/MM/YYYY'))
        }
    }

    //fazendo a soma dos lucros e do valor total
    useEffect(() => {
        if (!values.produtos?.length) return;

        const { sumTotal, sumLucro } = values.produtos.reduce(
            (acc, produto) => {
                const quantidade = produto.quantidade || 0;
                const vlVendaProduto = produto.vlVendaProduto || 0;
                const vlUnitario = produto.vlUnitario || 0;

                const totalProduto = quantidade * vlVendaProduto;
                produto.valorItem = totalProduto;
                const lucroProduto = (vlVendaProduto - vlUnitario) * quantidade;

                return {
                    sumTotal: acc.sumTotal + totalProduto,
                    sumLucro: acc.sumLucro + lucroProduto,
                };
            },
            { sumTotal: 0, sumLucro: 0 }
        );

        // Formatar e setar os valores
        setFieldValue('vlEntrega', NumberFormatForBrazilianCurrency(sumTotal));
        setFieldValue('vlLucro', NumberFormatForBrazilianCurrency(sumLucro));
    }, [values.produtos]);

    useEffect(() => {
        deleteEntregas()
    }, [])

    const suggestions: ClienteModel[] = useDebouncedSuggestions<ClienteModel>(formatDescription(values.nmCliente), tableKeys.Clientes, dispatch, 'Cliente');
    useEffect(() => {
        const data = new Date();
        const dataFormatada = format(data, 'HH:mm');
        setHoraAtual(dataFormatada);
    }, []);

    function formatIndex(index: number): string {
        return index.toString().padStart(3, '0');
    }
    const handlePrint = () => {
        if (ref.current) {
            // Criar iframe invisível para manipulação de impressão
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);
            if (!iframe) return;
            if (!iframe.contentWindow) return;
            console.log(iframe.contentWindow)
            // Escrever o conteúdo da impressão no iframe
            const iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write('<html><head><title>Nota Fiscal</title>');
            iframeDoc.write(`
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                    }
                    th, td {
                        padding: 4px;
                        text-align: center;
                    }
                    th {
                        font-weight: bold;
                    }
                    td {
                        font-size: 12px;
                    }
                    .descricao {
                        text-align: left;
                    }
                    .line {
                        margin: 0;
                        padding: 4px 0;
                        line-height: 1.2;
                    }
                    .total {
                        font-weight: bold;
                        font-size: 18px;
                        margin-top: 10px;
                    }
                </style>
            `);
            iframeDoc.write('</head><body>');
            iframeDoc.write(ref.current.innerHTML);
            iframeDoc.write('</body></html>');
            iframeDoc.close();

            // Chamar o print no iframe (isso deve acionar o pop-up)
            iframe.contentWindow.print();

            // Após a impressão, remover o iframe
            iframe.onload = () => {
                setOpenDialog(true);
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 0);
            };
        }
    };
    const renderBox = () => {
        return (
            <Box sx={{ padding: "16px", display: 'none' }} ref={ref}>
                <Box>
                    <Typography className="line" variant="h4" align="center">SORVETERIA OBAH</Typography>
                    <Typography className="line" align="center" sx={{ fontWeight: "bold", fontSize: "22px", margin: "8px 0" }}>
                        {`${empresa.ruaEmpresa}, ${empresa.numeroEmpresa} - ${empresa.bairroEmpresa}, ${empresa.cidadeEmpresa} - ${empresa.estadoEmpresa}, ${empresa.cepEmpresa}`}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" sx={{ margin: "1rem 0", height: "10rem", flexDirection: "column" }}>
                        <Box>
                            <Typography className="line" sx={{ fontWeight: "bold", fontSize: "22px" }}>CNPJ: {empresa.cnpjEmpresa}</Typography>
                            <Typography className="line" sx={{ fontWeight: "bold", fontSize: "22px" }}>IE: {empresa.inscricaoEstadual || 'Isento'}</Typography>
                            <Typography className="line" sx={{ fontWeight: "bold", fontSize: "22px" }}>Telefone: {empresa.tfEmpresa}</Typography>
                        </Box>
                        <Box >
                            <Typography className="line" sx={{ fontWeight: "bold", fontSize: "22px" }}>Data e Hora da venda</Typography>
                            <Box>
                                <Typography className="line" sx={{ fontWeight: "bold", fontSize: "22px" }}>
                                    {values.dtEntrega ? `${values.dtEntrega.toString()} - ${horaAtual}` : ''}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <hr style={{ border: "1px dashed #000000" }} />

                {/* Table */}
                <Box sx={{ margin: "1rem 0" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontSize: 13 }}>ITEM</TableCell>
                                <TableCell style={{ fontSize: 13 }} className="descricao">DESC.</TableCell>
                                <TableCell style={{ fontSize: 13 }}>QNTD</TableCell>
                                <TableCell style={{ fontSize: 13 }}>UN</TableCell>
                                <TableCell style={{ fontSize: 13 }}>Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {values.produtos.filter(produto => produto.valorItem !== 0).map((produto, index) => (
                                <TableRow key={produto.nmProduto}>
                                    <TableCell style={{ fontSize: 13 }}>{formatIndex(index + 1)}</TableCell>
                                    <TableCell style={{ fontSize: 13 }} className="descricao">{produto.nmProduto}</TableCell>
                                    <TableCell style={{ fontSize: 13 }}>{produto.quantidade ?? 0}</TableCell>
                                    <TableCell style={{ fontSize: 13 }}>{NumberFormatForBrazilianCurrency(produto.vlVendaProduto).replace('R$', '')}</TableCell>
                                    <TableCell style={{ fontSize: 12 }}> {
                                        Number(produto.valorItem) % 1 === 0
                                            ? `${produto.valorItem?.toFixed(0)},00`
                                            : `${produto.valorItem?.toFixed(2).replace('.', ',')}`}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>

                <hr style={{ border: "1px dashed #000000" }} />

                <Box sx={{ margin: "1rem 0" }}>
                    <Typography className="total" variant="h6" align="center" sx={{ fontWeight: "bold" }}>VALOR TOTAL {values.vlEntrega}</Typography>
                </Box>
            </Box>
        )
    }
    return (
        <Box sx={{ padding: '5rem' }}>
            <Typography variant="h4" gutterBottom>
                Cadastro de Novas Entregas
            </Typography>
            <Box sx={{ display: "flex" }}>
                <Grid container spacing={2}>
                    <Grid item xs={5} sx={{ paddingRight: 10 }}>
                        <Autocomplete
                            id="tags-standard"
                            freeSolo
                            style={{ height: '70px' }}
                            options={suggestions}
                            getOptionLabel={(option: any) => option && option.nmCliente ? option.nmCliente : ""}
                            value={suggestions.find((item: any) => item.nmCliente === values.nmCliente) || null}
                            onChange={(_, newValue, reason) => handleClienteChange(_, newValue, reason)}
                            onInputChange={(_, newInputValue, reason) => {
                                if (reason === 'clear') handleClienteChange(_, null, 'clear');
                                setFieldValue('nmCliente', newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label="Cliente"
                                    placeholder="Selecione..."
                                />
                            )}
                        />
                        <Input
                            key={`dtEntrega-${key}`}
                            maxLength={10}
                            name="dtEntrega"
                            onBlur={handleBlur}
                            label="Data da Entrega"
                            value={values.dtEntrega ?? ''}
                            onChange={e => setFieldValue(e.target.name, formatDate(e.target.value))}
                            error={touched.dtEntrega && errors.dtEntrega ? errors.dtEntrega : ''}
                        />
                    </Grid>
                    <Grid item xs={5} sx={{ paddingRight: 10 }}>
                        <Input
                            key={`vlEntrega-${key}`}
                            label="Valor Total"
                            name="vlEntrega"
                            onBlur={handleBlur}
                            value={values.vlEntrega !== 0 ? values.vlEntrega : ''}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.vlEntrega && errors.vlEntrega ? errors.vlEntrega : ''}
                            disabled
                        />
                        <Input
                            key={`vlLucro-${key}`}
                            disabled
                            label="Lucro"
                            name="vlLucro"
                            onBlur={handleBlur}
                            value={values.vlLucro !== 0 ? values.vlLucro : ''}
                            onChange={e => setFieldValue(e.target.name, e.target.value)}
                            error={touched.vlLucro && errors.vlLucro ? errors.vlLucro : ''}
                        />
                    </Grid>
                </Grid>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%", }}>
                    <Box sx={{ height: "19rem", width: "100%", display: "flex", flexDirection: "column", mt: -1 }} >
                        <TableContainer component={Paper} className='style-scrollbar'>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nome Produto</TableCell>
                                        <TableCell>Valor Un.</TableCell>
                                        <TableCell>Valor Venda</TableCell>
                                        <TableCell>Quantidade</TableCell>
                                        <TableCell>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {values.produtos.length > 0 ? (
                                        values.produtos.map((produto, index) => (
                                            <TableRow key={produto.nmProduto}>
                                                <TableCell>{produto.nmProduto}</TableCell>
                                                <TableCell>{NumberFormatForBrazilianCurrency(produto.vlUnitario)}</TableCell>
                                                <TableCell>{NumberFormatForBrazilianCurrency(produto.vlVendaProduto)}</TableCell>

                                                {/* Célula Editável */}
                                                <TableCell>
                                                    <TextField
                                                        value={produto.quantidade || null}
                                                        onChange={(e) => {
                                                            const newQuantity = Number(e.target.value);
                                                            const updatedList = [...values.produtos];
                                                            updatedList[index] = {
                                                                ...produto,
                                                                quantidade: newQuantity
                                                            };
                                                            setFieldValue('produtos', updatedList);
                                                        }}
                                                        variant="outlined"
                                                        size="small"
                                                        type="number"
                                                        sx={{ width: '6rem' }}
                                                        fullWidth
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ width: '7rem', textAlign: 'center' }}>
                                                    {NumberFormatForBrazilianCurrency(produto.quantidade ? (produto.quantidade * produto.vlVendaProduto) : 0)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow >
                                            <TableCell colSpan={5} align="center">Selecione um Cliente</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                    </Box>

                    <Box display="flex" justifyContent="flex-end" mt={3}>
                        <Button
                            label={<AiTwotonePrinter size={30} />}
                            type='button'
                            disabled={
                                (!values.dtEntrega ||
                                    !values.produtos.some((produto) => produto.quantidade && produto.quantidade > 0)) || loadingGlobal
                            }
                            onClick={() => handlePrint()}
                            style={{ width: '6rem', height: '4rem', marginRight: "1rem" }}
                        />
                        <Button
                            label='Cadastrar Entrega'
                            type="button"
                            onClick={handleSubmit}
                            disabled={
                                (!values.dtEntrega ||
                                    !values.produtos.some((produto) => produto.quantidade && produto.quantidade > 0)) || loadingGlobal
                            }
                            style={{ width: '12rem', height: '4rem' }}
                        />
                    </Box>
                    <Dialog
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}
                        maxWidth="xs"
                        fullWidth
                    >
                        <DialogTitle>Confirmar Cadastro</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Você deseja cadastrar esta entrega?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions sx={{ justifyContent: 'space-between', padding: '1rem' }}>
                            <Button label="Cancelar" type="button" onClick={() => setOpenDialog(false)} />
                            <Button label="Confirmar" type="button" onClick={() => hundleSubmitForm()} />
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
            {/*Tabala */}
            <GenericTable<EntregaModel>
                columns={[
                    { label: 'Nome', name: 'nmCliente', shouldApplyFilter: true },
                    { label: 'Data Entrega', name: 'dtEntrega' },
                    { label: 'Valor Total', name: 'vlEntrega', isCurrency: true },
                    { label: 'Lucro', name: 'vlLucro', isCurrency: true },
                ]}
                collectionName={tableKeys.Entregas}
                isVisibleEdit
                editData={editData}
                setEditData={setEditData}
            />
            <CustomSnackBar
                message={message || "Cadastrado Entrega com sucesso"}
                open={openSnackBar}
                setOpen={setOpenSnackBar}
            />
            {renderBox()}
        </Box>
    );
}

export default Entregas;