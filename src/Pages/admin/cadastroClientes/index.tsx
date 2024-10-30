import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState } from 'react';
import { db } from '../../../firebase';
import ClienteModel from './model/cliente';
import Input from '../../../Components/input';
import Button from '../../../Components/button';
import { TableKey } from '../../../types/tableName';
import GenericTable from '../../../Components/table';
import { useDispatch, useSelector } from 'react-redux';
import useFormatCurrency from '../../../hooks/formatCurrency';
import formatPhone from '../../../Components/masks/maskTelefone';
import { setError, setLoading } from '../../../store/reducer/reducer';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';


import CollapseListProduct from '../../../Components/collapse/collapseListProduct';
import _ from 'lodash';
import SituacaoProduto from '../../../enumeration/situacaoProduto';
import { Box, Grid, Typography } from '@mui/material';
import CustomSnackBar, { StateSnackBar } from '../../../Components/snackBar/customsnackbar';
import { RootState } from '../../../store/reducer/store';

function CadastroCliente() {
    const [key, setKey] = useState<number>(0);
    const [editData, setEditData] = useState<ClienteModel>();
    const [openSnackBar, setOpenSnackBar] = useState<StateSnackBar>({ error: false, success: false });
    const error = useSelector((state: RootState) => state.user.error);

    const dispatch = useDispatch();
    const { convertToNumber } = useFormatCurrency();


    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ClienteModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues: {
            nmCliente: '',
            tfCliente: '',
            ruaCliente: '',
            nrCasaCliente: '',
            bairroCliente: '',
            cidadeCliente: '',
            produtos: []
        },
        validationSchema: Yup.object().shape({
            nmCliente: Yup.string().required('Campo obrigatório'),
            tfCliente: Yup.string().required('Campo obrigatório'),
            ruaCliente: Yup.string().required('Campo obrigatório'),
            nrCasaCliente: Yup.string().required('Campo obrigatório'),
            bairroCliente: Yup.string().required('Campo obrigatório'),
            cidadeCliente: Yup.string().required('Campo obrigatório'),
            produtos: Yup.array().test("array vazio", 'Obrigatório pelo menos 1 produto', function (value) {
                if ((!value || value.length === 0)) return false;
                return true;
            }).nullable()
        }),
        onSubmit: editData ? handleEditRow : hundleSubmitForm,
    });

    //editar uma linha da tabela e do banco de dados
    async function handleEditRow() {
        if (values) {
            const refID: string = values.id ?? '';
            const refTable = doc(db, TableKey.Clientes, refID);
            values.produtos.forEach(product => {
                if (typeof product.vlVendaProduto === 'string') {
                    product.vlVendaProduto = convertToNumber(product.vlVendaProduto)
                }
            })
            console.log(_.isEqual(values, editData))
            if (!_.isEqual(values, editData)) {
                console.log('entrou')
                await updateDoc(refTable, { ...values })
                    .then(() => {
                        setEditData(values)
                    });
            }
            resetForm()
            setKey(Math.random());
        }
    }

    //envia informações para o banco
    async function hundleSubmitForm() {
        dispatch(setLoading(true))
        values.produtos.forEach((produto) => {
            produto.vlVendaProduto = convertToNumber(produto.vlVendaProduto.toString())
        })
        await addDoc(collection(db, TableKey.Clientes), {
            ...values
        }).then(() => {
            dispatch(setLoading(false))
            setOpenSnackBar(prev => ({ ...prev, success: true }))
            setEditData(values)
        }).catch(() => {
            dispatch(setLoading(false))
            dispatch(setError('Erro ao Cadastrar Cliente'))
            setOpenSnackBar(prev => ({ ...prev, error: true }))
        });
        resetForm()
        setKey(Math.random());
    }

    //TODO: Não ta exibindo o erro quando a lista de produtos ta vazia
    return (
        <Box sx={{ padding: '5rem' }}>
            <Typography variant="h4" gutterBottom>Cadastro De Novos Clientes</Typography>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Input
                        key={`nmCliente-${key}`}
                        label="Nome"
                        name="nmCliente"
                        onBlur={handleBlur}
                        value={values.nmCliente}
                        onChange={(e) => setFieldValue(e.target.name, e.target.value)}
                        error={touched.nmCliente && errors.nmCliente ? errors.nmCliente : ""}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Input
                        key={`tfCliente-${key}`}
                        maxLength={12}
                        label="Telefone"
                        name="tfCliente"
                        onBlur={handleBlur}
                        value={formatPhone(values.tfCliente)}
                        onChange={(e) => setFieldValue(e.target.name, e.target.value)}
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
                        label="Rua"
                        name="ruaCliente"
                        onBlur={handleBlur}
                        value={values.ruaCliente}
                        onChange={(e) => setFieldValue(e.target.name, e.target.value)}
                        error={touched.ruaCliente && errors.ruaCliente ? errors.ruaCliente : ""}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Input
                        key={`nrCasaCliente-${key}`}
                        label="Número"
                        name="nrCasaCliente"
                        onBlur={handleBlur}
                        value={values.nrCasaCliente}
                        onChange={(e) => setFieldValue(e.target.name, e.target.value)}
                        error={touched.nrCasaCliente && errors.nrCasaCliente ? errors.nrCasaCliente : ""}
                    />
                </Grid>
            </Grid>

            <CollapseListProduct
                isVisible={true}
                tpProdutoSearch={SituacaoProduto.FABRICADO}
                nameArray="produtos"
                collectionName={TableKey.Produtos}
                initialItems={values.produtos}
                labelInput="Valor venda"
                typeValueInput="currency"
                setFieldValueExterno={setFieldValue}
            />

            <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                    type="button"
                    label="Cadastrar Cliente"
                    onClick={handleSubmit}
                    style={{ height: "4rem", width: "14rem" }}
                />
            </Box>

            {/* Tabela */}
            <GenericTable
                columns={[
                    { label: "Nome", name: "nmCliente" },
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
                    setKey(Math.random());
                }}
                editData={editData}
                setEditData={setEditData}
                collectionName={TableKey.Clientes}
            />
            <CustomSnackBar message={error ? error : "Cadastrado Cliente com sucesso"} open={openSnackBar} setOpen={setOpenSnackBar} />
        </Box>
    )
}

export default CadastroCliente;