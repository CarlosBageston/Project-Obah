import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState } from 'react';
import { db } from '../../../firebase';
import ClienteModel from './model/cliente';
import Input from '../../../Components/input';
import Button from '../../../Components/button';
import GenericTable from '../../../Components/table';
import { useDispatch, useSelector } from 'react-redux';
import formatPhone from '../../../Components/masks/maskTelefone';
import { setMessage } from '../../../store/reducer/reducer';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import MUIButton from "@mui/material/Button";


import CollapseListProduct from '../../../Components/collapse/collapseListProduct';
import _ from 'lodash';
import SituacaoProduto from '../../../enumeration/situacaoProduto';
import { Box, Dialog, Divider, FormControlLabel, Grid, Switch, Typography } from '@mui/material';
import CustomSnackBar, { StateSnackBar } from '../../../Components/snackBar/customsnackbar';
import { RootState } from '../../../store/reducer/store';
import { formatDescription } from '../../../utils/formattedString';
import { useTableKeys } from '../../../hooks/tableKey';
import { setLoadingGlobal } from '../../../store/reducer/loadingSlice';
import { convertToNumber } from '../../../hooks/formatCurrency';

function CadastroCliente() {
    const [key, setKey] = useState<number>(0);
    const [editData, setEditData] = useState<ClienteModel>();
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const message = useSelector((state: RootState) => state.user.message);
    const tableKeys = useTableKeys();
    const dispatch = useDispatch();
    const [openDialog, setOpenDialog] = useState(false);
    const loadingGlobal = useSelector((state: RootState) => state.loading.loadingGlobal);


    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ClienteModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues: {
            nmCliente: '',
            tfCliente: '',
            ruaCliente: '',
            nrCasaCliente: null,
            bairroCliente: '',
            cidadeCliente: '',
            produtos: [],
            nmClienteFormatted: '',
            noHouseNumber: false
        },
        validationSchema: Yup.object().shape({
            nmCliente: Yup.string().required('Campo obrigatório'),
            tfCliente: Yup.string().required('Campo obrigatório'),
            ruaCliente: Yup.string().required('Campo obrigatório'),
            noHouseNumber: Yup.boolean(),
            nrCasaCliente: Yup.string()
                .nullable()
                .test("check-noHouseNumber", "Campo obrigatório", function (value) {
                    const { noHouseNumber } = this.parent;
                    if (noHouseNumber) {
                        return true;
                    }
                    return !!value;
                }),
            bairroCliente: Yup.string().required('Campo obrigatório'),
            cidadeCliente: Yup.string().required('Campo obrigatório'),
            produtos: Yup.array().test("array vazio", 'Obrigatório pelo menos 1 produto', function (value) {
                if ((!value || value.length === 0)) return false
                return true;
            }).nullable()
        }),
        onSubmit: editData ? handleEditRow : hundleSubmitForm,
    });

    //editar uma linha da tabela e do banco de dados
    async function handleEditRow() {
        if (values) {
            dispatch(setLoadingGlobal(true))
            const refID: string = values.id ?? '';
            const refTable = doc(db, tableKeys.Clientes, refID);
            values.produtos.forEach(product => {
                if (typeof product.vlVendaProduto === 'string') {
                    product.vlVendaProduto = convertToNumber(product.vlVendaProduto)
                }
            })
            if (!_.isEqual(values, editData)) {
                await updateDoc(refTable, { ...values })
                    .then(() => {
                        setEditData(values)
                    });
            }
            resetForm()
            setKey(Math.random());
            dispatch(setLoadingGlobal(false))
        }
    }

    //envia informações para o banco
    async function hundleSubmitForm() {
        dispatch(setLoadingGlobal(true))
        values.produtos.forEach((produto) => {
            produto.vlVendaProduto = convertToNumber(produto.vlVendaProduto.toString())
        })
        await addDoc(collection(db, tableKeys.Clientes), {
            ...values
        }).then(() => {
            setOpenSnackBar(prev => ({ ...prev, success: true }))
            setEditData(values)
        }).catch(() => {
            dispatch(setMessage('Erro ao Cadastrar Cliente'))
            setOpenSnackBar(prev => ({ ...prev, error: true }))
        })
            .finally(() => dispatch(setLoadingGlobal(false)));
        resetForm()
        setKey(Math.random());
    }

    function handleSubmitForm() {
        if (!values.produtos.length) setOpenDialog(true)
        else handleSubmit()
    }
    return (
        <Box sx={{ padding: '5rem' }}>
            <Typography variant="h4" gutterBottom>Cadastro de Novos Clientes</Typography>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Input
                        key={`nmCliente-${key}`}
                        label="Nome"
                        name="nmCliente"
                        onBlur={handleBlur}
                        value={values.nmCliente}
                        onChange={(e) => {
                            setFieldValue(e.target.name, e.target.value)
                            setFieldValue('nmClienteFormatted', formatDescription(e.target.value));
                        }}
                        error={touched.nmCliente && errors.nmCliente ? errors.nmCliente : ""}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Input
                        key={`tfCliente-${key}`}
                        label="Telefone"
                        name="tfCliente"
                        onBlur={handleBlur}
                        value={values.tfCliente}
                        onChange={(e) => setFieldValue(e.target.name, formatPhone(e.target.value))}
                        error={touched.tfCliente && errors.tfCliente ? errors.tfCliente : ""}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Input
                        key={`cidadeCliente-${key}`}
                        label="Cidade"
                        name="cidadeCliente"
                        onBlur={handleBlur}
                        value={values.cidadeCliente}
                        onChange={(e) => setFieldValue(e.target.name, e.target.value)}
                        error={touched.cidadeCliente && errors.cidadeCliente ? errors.cidadeCliente : ""}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Input
                        key={`bairroCliente-${key}`}
                        label="Bairro"
                        name="bairroCliente"
                        onBlur={handleBlur}
                        value={values.bairroCliente}
                        onChange={(e) => setFieldValue(e.target.name, e.target.value)}
                        error={touched.bairroCliente && errors.bairroCliente ? errors.bairroCliente : ""}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Input
                        key={`ruaCliente-${key}`}
                        label="Logradouro"
                        name="ruaCliente"
                        onBlur={handleBlur}
                        value={values.ruaCliente}
                        onChange={(e) => setFieldValue(e.target.name, e.target.value)}
                        error={touched.ruaCliente && errors.ruaCliente ? errors.ruaCliente : ""}
                    />
                </Grid>
                <Grid item xs={2}>
                    <Input
                        key={`nrCasaCliente-${key}`}
                        label="Número"
                        name="nrCasaCliente"
                        type='number'
                        disabled={values.noHouseNumber}
                        onBlur={handleBlur}
                        value={values.nrCasaCliente}
                        onChange={(e) => setFieldValue(e.target.name, e.target.value)}
                        error={touched.nrCasaCliente && errors.nrCasaCliente ? errors.nrCasaCliente : ""}
                    />
                </Grid>
                <Grid item xs={2} display="flex" alignItems="center">
                    <FormControlLabel
                        control={
                            <Switch
                                checked={values.noHouseNumber}
                                onChange={(e) => {
                                    if (e.target.checked) setFieldValue("nrCasaCliente", '')
                                    setFieldValue("noHouseNumber", e.target.checked)
                                }}
                                color="primary"
                            />
                        }
                        label="Sem Número"
                    />
                </Grid>
            </Grid>

            <CollapseListProduct
                isVisible={true}
                tpProdutoSearch={SituacaoProduto.FABRICADO}
                nameArray="produtos"
                collectionName={tableKeys.Produtos}
                initialItems={values.produtos}
                labelInput="Valor venda"
                typeValueInput="currency"
                setFieldValueExterno={setFieldValue}
            />

            <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                    type="button"
                    label={editData ? "Atualizar" : "Cadastrar"}
                    onClick={() => handleSubmitForm()}
                    style={{ height: "4rem", width: "14rem" }}
                    disabled={loadingGlobal}
                />
            </Box>
            <Dialog open={openDialog}>
                <Typography variant="body1" component="p" sx={{ p: 3 }}>
                    É Obrigatório ter pelo menos um produto cadastrado
                </Typography>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <MUIButton onClick={() => setOpenDialog(false)}>OK</MUIButton>
                </Box>
            </Dialog>
            {/* Tabela */}
            <GenericTable
                columns={[
                    { label: "Nome", name: "nmCliente", shouldApplyFilter: true },
                    { label: "Telefone", name: "tfCliente" },
                    { label: "Cidade", name: "cidadeCliente" },
                    { label: "Bairro", name: "bairroCliente" },
                    { label: "Rua", name: "ruaCliente" },
                    { label: "Número Casa", name: "nrCasaCliente" },
                ]}
                onEdit={(row: ClienteModel | undefined) => {
                    if (!row) return;
                    setEditData(row);
                    setFieldValue("nmCliente", row.nmCliente);
                    setFieldValue("tfCliente", formatPhone(row.tfCliente));
                    setFieldValue("ruaCliente", row.ruaCliente);
                    setFieldValue("nrCasaCliente", row.nrCasaCliente);
                    setFieldValue("bairroCliente", row.bairroCliente);
                    setFieldValue("cidadeCliente", row.cidadeCliente);
                    setFieldValue("produtos", row.produtos);
                    setFieldValue("id", row.id);
                    setFieldValue("nmClienteFormatted", row.nmClienteFormatted);
                    setKey(Math.random());
                }}
                editData={editData}
                setEditData={setEditData}
                collectionName={tableKeys.Clientes}
            />
            <CustomSnackBar message={message ? message : "Cadastrado Cliente com sucesso"} open={openSnackBar} setOpen={setOpenSnackBar} />
        </Box>
    )
}

export default CadastroCliente;