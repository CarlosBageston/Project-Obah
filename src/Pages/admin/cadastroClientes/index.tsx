import * as Yup from 'yup';
import { lazy, useState } from 'react';
import { useFormik } from 'formik';
import { db } from '../../../firebase';
import ClienteModel from './model/cliente';
import Input from '../../../Components/input';
import GetData from '../../../firebase/getData';
import Button from '../../../Components/button';
import GenericTable from '../../../Components/table';
import FiltroGeneric from '../../../Components/filtro';
import ProdutosModel from '../cadastroProdutos/model/produtos';
import FormAlert from '../../../Components/FormAlert/formAlert';
import formatPhone from '../../../Components/masks/maskTelefone';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
const IsEdit = lazy(() => import('../../../Components/isEdit/isEdit'));
const IsAdding = lazy(() => import('../../../Components/isAdding/isAdding'));

//import do styled components
import {
    Box,
    ContainerInfoCliente,
    DivCliente,
    ButtonStyled,
    ContainerButton,
    TitleDefault,
} from './style';
import { BoxTitleDefault } from '../estoque/style';
import useFormatCurrency from '../../../hooks/formatCurrency';


const objClean: ClienteModel = {
    nmCliente: '',
    tfCliente: '',
    ruaCliente: '',
    nrCasaCliente: '',
    bairroCliente: '',
    cidadeCliente: '',
    produtos: []
}

function CadastroCliente() {
    const [key, setKey] = useState<number>(0);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [isVisibleTpProuto, setIsVisibleTpProduto] = useState<boolean>(false)
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [selected, setSelected] = useState<ClienteModel>();

    const { convertToNumber } = useFormatCurrency();

    const [initialValues, setInitialValues] = useState<ClienteModel>({ ...objClean });
    const inputsConfig = [
        { label: 'Nome', propertyName: 'nmCliente' },
        { label: 'Telefone', propertyName: 'tfCliente' },
        { label: 'Cidade', propertyName: 'cidadeCliente' },
        { label: 'Bairro', propertyName: 'bairroCliente' },
        { label: 'Rua', propertyName: 'ruaCliente' },
        { label: 'Numero', propertyName: 'nrCasaCliente' },
    ];

    //realizando busca no banco de dados
    const {
        dataTable,
        loading,
        setDataTable
    } = GetData('Clientes', recarregue) as { dataTable: ClienteModel[], loading: boolean, setDataTable: (data: ClienteModel[]) => void };
    const {
        dataTable: produtosDataTable,
    } = GetData('Produtos', recarregue) as { dataTable: ProdutosModel[] };

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ClienteModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmCliente: Yup.string().required('Campo obrigatório'),
            tfCliente: Yup.string().required('Campo obrigatório'),
            ruaCliente: Yup.string().required('Campo obrigatório'),
            nrCasaCliente: Yup.string().required('Campo obrigatório'),
            bairroCliente: Yup.string().required('Campo obrigatório'),
            cidadeCliente: Yup.string().required('Campo obrigatório'),
            produtos: Yup.array().test("array vazio", 'Obrigatório pelo menos 1 produto', function (value) {
                if ((!value || value.length === 0)) {
                    return false;
                } else {
                    return true;
                }
            }).nullable()
        }),
        onSubmit: hundleSubmitForm,
    });

    //editar uma linha da tabela e do banco de dados
    async function handleEditRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            const refTable = doc(db, "Clientes", refID);

            if (JSON.stringify(selected) !== JSON.stringify(initialValues)) {
                await updateDoc(refTable, { ...selected })
                    .then(() => {
                        const index = dataTable.findIndex((item) => item.id === selected.id);
                        const updatedDataTable = [
                            ...dataTable.slice(0, index),
                            selected,
                            ...dataTable.slice(index + 1)
                        ];
                        setDataTable(updatedDataTable);
                    });
            }
        }
        setIsEdit(false)
        setSelected(undefined)
    }

    //deleta uma linha da tabela e do banco de dados
    async function handleDeleteRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            await deleteDoc(doc(db, "Clientes", refID)).then(() => {
                const newDataTable = dataTable.filter(row => row.id !== selected.id);
                setDataTable(newDataTable);
            });
        }
        setSelected(undefined)
    }

    function cleanState() {
        setInitialValues({
            nmCliente: '',
            tfCliente: '',
            ruaCliente: '',
            nrCasaCliente: '',
            bairroCliente: '',
            cidadeCliente: '',
            produtos: []
        })
        setKey(Math.random());
    }

    //envia informações para o banco
    async function hundleSubmitForm() {
        values.produtos.forEach((produto) => {
            produto.vlVendaProduto = convertToNumber(produto.vlVendaProduto.toString())
        })
        await addDoc(collection(db, "Clientes"), {
            ...values
        }).then(() => {
            setSubmitForm(true);
            setDataTable([...dataTable, values]);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        }).catch(() => {
            setSubmitForm(false);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        });
        resetForm()
        cleanState()
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
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
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
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                            <Input
                                key={`cidadeCliente-${key}`}
                                label='Cidade'
                                name='cidadeCliente'
                                onBlur={handleBlur}
                                value={formatPhone(values.cidadeCliente)}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.cidadeCliente && errors.cidadeCliente ? errors.cidadeCliente : ''}
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
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
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                            <Input
                                key={`ruaCliente-${key}`}
                                label='Rua'
                                name='ruaCliente'
                                onBlur={handleBlur}
                                value={values.ruaCliente}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.ruaCliente && errors.ruaCliente ? errors.ruaCliente : ''}
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                            <Input
                                key={`nrCasaCliente-${key}`}
                                label='Numero'
                                name='nrCasaCliente'
                                onBlur={handleBlur}
                                value={values.nrCasaCliente}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.nrCasaCliente && errors.nrCasaCliente ? errors.nrCasaCliente : ''}
                                styleDiv={{ marginTop: 4 }}
                                style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            />
                        </DivCliente>
                        <div>
                            {touched.produtos && errors.produtos && (
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                //@ts-ignore
                                <div style={{ color: 'red' }}>{errors.produtos}</div>
                            )}
                            <ButtonStyled onClick={() => setIsVisibleTpProduto(true)}> Adicionar Produtos</ButtonStyled>
                        </div>
                    </ContainerInfoCliente>
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
                {/*Adicionar Produtos */}
                <IsAdding
                    data={produtosDataTable}
                    isAdding={isVisibleTpProuto}
                    setFieldValue={setFieldValue}
                    setIsVisibleTpProduto={setIsVisibleTpProduto}
                    products={values.produtos}
                    addingScreen='Cliente'
                />


                {/* Editar o cliente */}
                <IsEdit
                    editingScreen='Cliente'
                    selected={selected}
                    handleEditRow={handleEditRow}
                    inputsConfig={inputsConfig}
                    isEdit={isEdit}
                    products={selected ? selected.produtos : []}
                    setSelected={setSelected}
                    setIsEdit={setIsEdit}
                />

                {/*Tabela */}
                <BoxTitleDefault>
                    <div>
                        <FiltroGeneric data={dataTable} setFilteredData={setDataTable} carregarDados={setRecarregue} type="cliente" />
                    </div>
                </BoxTitleDefault>
                <GenericTable
                    columns={[
                        { label: 'Nome', name: 'nmCliente' },
                        { label: 'Telefone', name: 'tfCliente' },
                        { label: 'Cidade', name: 'cidadeCliente' },
                        { label: 'Bairro', name: 'bairroCliente' },
                        { label: 'Rua', name: 'ruaCliente' },
                        { label: 'Numero Casa', name: 'nrCasaCliente' },
                    ]}
                    data={dataTable}
                    isLoading={loading}
                    onSelectedRow={setSelected}
                    onEdit={() => {
                        if (selected) {
                            setIsEdit(true)
                            setInitialValues(selected)
                        } else {
                            return
                        }
                    }}
                    onDelete={handleDeleteRow}
                    isdisabled={selected ? false : true}
                />
            </Box>
        </>
    )
}

export default CadastroCliente;