import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState } from 'react';
import { db } from '../../../firebase';
import ClienteModel from './model/cliente';
import Input from '../../../Components/input';
import Button from '../../../Components/button';
import { TableKey } from '../../../types/tableName';
import GenericTable from '../../../Components/table';
import { useDispatch } from 'react-redux';
import useFormatCurrency from '../../../hooks/formatCurrency';
import FormAlert from '../../../Components/FormAlert/formAlert';
import formatPhone from '../../../Components/masks/maskTelefone';
import { setLoading } from '../../../store/reducer/reducer';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';


//import do styled components
import {
    Box,
    ContainerInfoCliente,
    DivCliente,
    ContainerButton,
    TitleDefault,
} from './style';
import CollapseListProduct from '../../../Components/collapse/collapseListProduct';
import _ from 'lodash';
import SituacaoProduto from '../../../enumeration/situacaoProduto';

function CadastroCliente() {
    const [key, setKey] = useState<number>(0);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [editData, setEditData] = useState<ClienteModel>();

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
            console.log(values)
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
            setSubmitForm(true);
            setTimeout(() => { setSubmitForm(undefined) }, 3000);
            setEditData(values)
        }).catch(() => {
            dispatch(setLoading(false))
            setSubmitForm(false);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        });
        resetForm()
        setKey(Math.random());
    }

    return (
        <>
            <Box>
                <div>
                    <TitleDefault>Cadastro De Novos Clientes</TitleDefault>
                    <ContainerInfoCliente>
                        <DivCliente>
                            <Input
                                key={`nmCliente-${key}`}
                                label='Nome'
                                name='nmCliente'
                                onBlur={handleBlur}
                                value={values.nmCliente}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.nmCliente && errors.nmCliente ? errors.nmCliente : ''}
                            />
                            <Input
                                key={`tfCliente-${key}`}
                                maxLength={12}
                                label='Telefone'
                                name='tfCliente'
                                onBlur={handleBlur}
                                value={formatPhone(values.tfCliente)}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.tfCliente && errors.tfCliente ? errors.tfCliente : ''}
                            />
                            <Input
                                key={`cidadeCliente-${key}`}
                                label='Cidade'
                                name='cidadeCliente'
                                onBlur={handleBlur}
                                value={formatPhone(values.cidadeCliente)}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.cidadeCliente && errors.cidadeCliente ? errors.cidadeCliente : ''}
                            />
                        </DivCliente>
                        <DivCliente>
                            <Input
                                key={`bairroCliente-${key}`}
                                label='Bairro'
                                name='bairroCliente'
                                onBlur={handleBlur}
                                value={values.bairroCliente}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.bairroCliente && errors.bairroCliente ? errors.bairroCliente : ''}
                            />
                            <Input
                                key={`ruaCliente-${key}`}
                                label='Rua'
                                name='ruaCliente'
                                onBlur={handleBlur}
                                value={values.ruaCliente}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.ruaCliente && errors.ruaCliente ? errors.ruaCliente : ''}
                            />
                            <Input
                                key={`nrCasaCliente-${key}`}
                                label='Numero'
                                name='nrCasaCliente'
                                onBlur={handleBlur}
                                value={values.nrCasaCliente}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.nrCasaCliente && errors.nrCasaCliente ? errors.nrCasaCliente : ''}
                            />
                        </DivCliente>
                    </ContainerInfoCliente>
                    <CollapseListProduct
                        isVisible={true}
                        tpProdutoSearch={SituacaoProduto.FABRICADO}
                        nameArray='produtos'
                        collectionName={TableKey.Produtos}
                        initialItems={values.produtos}
                        labelInput='Valor venda'
                        typeValueInput='currency'
                        setFieldValueExterno={setFieldValue}
                    />
                    <FormAlert submitForm={submitForm} name={'Cliente'} />
                </div>
                <ContainerButton>
                    <Button
                        type={'button'}
                        label={'Cadastrar Cliente'}
                        onClick={handleSubmit}
                        style={{ margin: '1rem 0 3rem 0', height: '4rem', width: '14rem' }}
                    />
                </ContainerButton>

                {/*Tabela */}
                <GenericTable
                    columns={[
                        { label: 'Nome', name: 'nmCliente' },
                        { label: 'Telefone', name: 'tfCliente' },
                        { label: 'Cidade', name: 'cidadeCliente' },
                        { label: 'Bairro', name: 'bairroCliente' },
                        { label: 'Rua', name: 'ruaCliente' },
                        { label: 'Numero Casa', name: 'nrCasaCliente' },
                    ]}
                    onEdit={(row: ClienteModel | undefined) => {
                        if (!row) return;
                        setEditData(row)
                        setFieldValue('nmCliente', row.nmCliente);
                        setFieldValue('tfCliente', formatPhone(row.tfCliente));
                        setFieldValue('ruaCliente', row.ruaCliente);
                        setFieldValue('nrCasaCliente', row.nrCasaCliente);
                        setFieldValue('bairroCliente', row.bairroCliente);
                        setFieldValue('cidadeCliente', row.cidadeCliente);
                        setFieldValue('produtos', row.produtos);
                        setFieldValue('id', row.id);
                        setKey(Math.random());
                    }}
                    editData={editData}
                    setEditData={setEditData}
                    collectionName={TableKey.Clientes}
                />
            </Box>
        </>
    )
}

export default CadastroCliente;