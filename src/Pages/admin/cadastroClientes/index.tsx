import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import Input from '../../../Components/input';
import Button from '../../../Components/button';
import ClienteModel, { ValorProdutoModel } from './model/cliente';
import formatPhone from '../../../Components/masks/maskTelefone';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { orderBy } from 'lodash';


//import do styled components
import {
    Box,
    ContainerInfoCliente,
    DivCliente,
    DivPreco,
    TextDivisao,
    ContainerButton,
    TitleDefault,
    ContainerAlert
} from './style';
import { addDoc, collection, CollectionReference, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Alert, AlertTitle, Paper } from '@mui/material';
import FiltroGeneric from '../../../Components/filtro';
import GenericTable from '../../../Components/table';
import GetData from '../../../firebase/getData';

const objClean = {
    nmCliente: '',
    tfCleinte: '',
    ruaCliente: '',
    nrCasaCliente: '',
    bairroCliente: '',
    cidadeCliente: '',
    preco: {
        moreninha: null,
        loirinha: null,
        plCreme: null,
        plFruta: null,
        plItu: null,
        pote1L: null,
        pote2L: null,
        sundae: null,
        plPacote: null,
        Balde10L: null,
        plSkimo: null,
        plPaleta: null
    } as unknown as ValorProdutoModel,
}

export default function CadastroCliente() {
    const [key, setKey] = useState<number>(0);
    const [fail, setFail] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [recarregue, setRecarregue] = useState<boolean>(true)

    const [initialValues, setInitialValues] = useState<ClienteModel>({ ...objClean });

    //realizando busca no banco de dados
    const { dataTable, loading, setDataTable } = GetData('Clientes', recarregue);

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ClienteModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmCliente: Yup.string().required('Campo obrigatório'),
            tfCleinte: Yup.string().required('Campo obrigatório'),
            ruaCliente: Yup.string().required('Campo obrigatório'),
            nrCasaCliente: Yup.string().required('Campo obrigatório'),
            bairroCliente: Yup.string().required('Campo obrigatório'),
            cidadeCliente: Yup.string().required('Campo obrigatório'),
            preco: Yup.object().shape({
                moreninha: Yup.string().notRequired(),
                loirinha: Yup.string().notRequired(),
                pote1L: Yup.string().notRequired(),
                pote2L: Yup.string().notRequired(),
                sundae: Yup.string().notRequired(),
                plItu: Yup.string().notRequired(),
                plFruta: Yup.string().notRequired(),
                plCreme: Yup.string().notRequired(),
                plPacote: Yup.string().notRequired(),
                Balde10L: Yup.string().notRequired(),
                plSkimo: Yup.string().notRequired(),
                plPaleta: Yup.string().notRequired(),
            }).notRequired()
        }),
        onSubmit: hundleSubmitForm,
    });

    function cleanState() {
        setFieldValue("preco.moreninha", '');
        setFieldValue("preco.loirinha", '');
        setFieldValue("preco.plCreme", '');
        setFieldValue("preco.plFruta", '');
        setFieldValue("preco.plItu", '');
        setFieldValue("preco.pote1L", '');
        setFieldValue("preco.pote2L", '');
        setFieldValue("preco.sundae", '');
        setFieldValue("preco.plPacote", '');
        setFieldValue("preco.Balde10L", '');
        setFieldValue("preco.plSkimo", '');
        setFieldValue("preco.plPaleta", '');

        setInitialValues({
            nmCliente: '',
            tfCleinte: '',
            ruaCliente: '',
            nrCasaCliente: '',
            bairroCliente: '',
            cidadeCliente: '',
            preco: {} as unknown as ValorProdutoModel,
        })
        setKey(Math.random());
    }

    //Formata valor do input
    function formatarValor(valor: string) {
        const inputText = valor.replace(/\D/g, "");
        let formattedText = "";
        if (inputText.length <= 2) {
            formattedText = inputText;
        } else {
            const regex = /^(\d*)(\d{2})$/;
            formattedText = inputText.replace(regex, '$1,$2');
        }
        return inputText ? "R$ " + formattedText : "";
    }

    //envia informações para o banco
    async function hundleSubmitForm() {

        setDataTable([...dataTable, values]);

        await addDoc(collection(db, "Clientes"), {
            ...values
        }).then(() => {
            setSuccess(true);
            setTimeout(() => { setSuccess(false) }, 2000)
        }).catch(() => {
            setFail(true)
            setTimeout(() => { setFail(false) }, 3000)
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
                                key={`tfCleinte-${key}`}
                                maxLength={12}
                                label='Telefone'
                                name='tfCleinte'
                                onBlur={handleBlur}
                                value={formatPhone(values.tfCleinte)}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.tfCleinte && errors.tfCleinte ? errors.tfCleinte : ''}
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
                    </ContainerInfoCliente>
                    <TextDivisao>Preço dos Produtos</TextDivisao>
                    {success &&
                        <ContainerAlert>
                            <Alert severity="success" style={{
                                position: 'absolute',
                                marginTop: '-20px',
                                width: '25rem'
                            }}>
                                <AlertTitle><strong>Sucesso</strong></AlertTitle>
                                Cliente Cadastrado com <strong>Sucesso!</strong>
                            </Alert>
                        </ContainerAlert>
                    }
                    {fail &&
                        <ContainerAlert>
                            <Alert severity="error" style={{
                                position: 'absolute',
                                marginTop: '-20px',
                                width: '25rem'
                            }}>
                                <AlertTitle><strong>Erro</strong></AlertTitle>
                                Erro ao Cadastrar novo Cliente.<strong>Tente novamente</strong>
                            </Alert>
                        </ContainerAlert>
                    }
                    <DivPreco>
                        <div>
                            <Input
                                key={`moreninha-${key}`}
                                maxLength={8}
                                label='Moreninha'
                                name='preco.moreninha'
                                onBlur={handleBlur}
                                styleDiv={{ marginTop: 4 }}
                                value={values.preco.moreninha}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.moreninha && errors.preco?.moreninha ? errors.preco.moreninha : ''}
                            />
                            <Input
                                key={`loirinha-${key}`}
                                maxLength={8}
                                label='Loirinha'
                                name='preco.loirinha'
                                onBlur={handleBlur}
                                value={values.preco.loirinha}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.loirinha && errors.preco?.loirinha ? errors.preco?.loirinha : ''}
                                styleDiv={{ marginTop: 4 }}
                            />
                            <Input
                                key={`plPaleta-${key}`}
                                maxLength={8}
                                label='Paleta de Picolé'
                                name='preco.loirinha'
                                onBlur={handleBlur}
                                value={values.preco.plPaleta}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.plPaleta && errors.preco?.plPaleta ? errors.preco?.plPaleta : ''}
                                styleDiv={{ marginTop: 4 }}
                            />

                        </div>
                        <div>
                            <Input
                                key={`pote1L-${key}`}
                                maxLength={8}
                                label='Pote 1 Litro'
                                name='preco.pote1L'
                                onBlur={handleBlur}
                                value={values.preco.pote1L}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.pote1L && errors.preco?.pote1L ? errors.preco?.pote1L : ''}
                                styleDiv={{ marginTop: 4 }}
                            />
                            <Input
                                key={`pote2L-${key}`}
                                maxLength={8}
                                label='Pote 2 Litros'
                                name='preco.pote2L'
                                onBlur={handleBlur}
                                value={values.preco.pote2L}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.pote2L && errors.preco?.pote2L ? errors.preco?.pote2L : ''}
                                styleDiv={{ marginTop: 4 }}
                            />
                            <Input
                                key={`Balde10L-${key}`}
                                maxLength={8}
                                label='Balde de 10 Litros'
                                onBlur={handleBlur}
                                name='preco.Balde10L'
                                styleDiv={{ marginTop: 4 }}
                                value={values.preco.Balde10L}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.Balde10L && errors.preco?.Balde10L ? errors.preco?.Balde10L : ''}
                            />
                        </div>
                        <div>
                            <Input
                                key={`sundae-${key}`}
                                maxLength={8}
                                label='Sundae'
                                name='preco.sundae'
                                onBlur={handleBlur}
                                value={values.preco.sundae}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.sundae && errors.preco?.sundae ? errors.preco?.sundae : ''}
                                styleDiv={{ marginTop: 4 }}
                            />
                            <Input
                                key={`plItu-${key}`}
                                maxLength={8}
                                label='Picolé Itu'
                                name='preco.plItu'
                                onBlur={handleBlur}
                                value={values.preco.plItu}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.plItu && errors.preco?.plItu ? errors.preco?.plItu : ''}
                                styleDiv={{ marginTop: 4 }}
                            />
                            <Input
                                key={`plPacote-${key}`}
                                maxLength={8}
                                label='Pacote Picolé'
                                onBlur={handleBlur}
                                name='preco.plPacote'
                                styleDiv={{ marginTop: 4 }}
                                value={values.preco.plPacote}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.plPacote && errors.preco?.plPacote ? errors.preco?.plPacote : ''}
                            />
                        </div>
                        <div>
                            <Input
                                key={`plCreme-${key}`}
                                maxLength={8}
                                label='Picolé De Leite'
                                name='preco.plCreme'
                                onBlur={handleBlur}
                                value={values.preco.plCreme}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.plCreme && errors.preco?.plCreme ? errors.preco?.plCreme : ''}
                                styleDiv={{ marginTop: 4 }}
                            />
                            <Input
                                key={`plFruta-${key}`}
                                maxLength={8}
                                label='Picolé de Fruta'
                                onBlur={handleBlur}
                                name='preco.plFruta'
                                styleDiv={{ marginTop: 4 }}
                                value={values.preco.plFruta}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.plFruta && errors.preco?.plFruta ? errors.preco?.plFruta : ''}
                            />
                            <Input
                                key={`plSkimo-${key}`}
                                maxLength={8}
                                label='Picolé Skimo'
                                onBlur={handleBlur}
                                name='preco.plSkimo'
                                styleDiv={{ marginTop: 4 }}
                                value={values.preco.plSkimo}
                                onChange={e => setFieldValue(e.target.name, formatarValor(e.target.value))}
                                error={touched.preco?.plSkimo && errors.preco?.plSkimo ? errors.preco?.plSkimo : ''}
                            />

                        </div>
                    </DivPreco>
                </div>
                <ContainerButton>
                    <Button
                        fontSize={18}
                        primary={false}
                        type={'button'}
                        children={'Cadastrar'}
                        onClick={handleSubmit}
                        style={{ margin: '1rem 4rem 1rem 100%', height: '4rem' }}
                    />
                </ContainerButton>

                {/*Tabela */}
                <div style={{ margin: '-3.5rem 0px -12px 3rem' }}>
                    <FiltroGeneric
                        data={dataTable}
                        carregarDados={setRecarregue}
                        setFilteredData={setDataTable}
                        type='cliente'
                    />
                </div>
                <GenericTable
                    columns={[
                        { label: 'Nome', name: 'nmCliente' },
                        { label: 'Telefone', name: 'tfCleinte' },
                        { label: 'Moreninha', name: 'preco.moreninha' },
                        { label: 'Loirinha', name: 'preco.loirinha' },
                        { label: 'Pote 1 Litro', name: 'preco.pote1L' },
                        { label: 'Pote 2 Litros', name: 'preco.pote2L' },
                        { label: 'Sundae', name: 'preco.sundae' },
                        { label: 'Picolé Itú', name: 'preco.plItu' },
                        { label: 'Picolé De Leite', name: 'preco.plCreme' },
                        { label: 'Picolé De Fruta', name: 'preco.plFruta' },
                    ]}
                    data={dataTable}
                    isLoading={loading}

                />
            </Box>
        </>
    )
}