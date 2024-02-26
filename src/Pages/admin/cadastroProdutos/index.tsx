/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Yup from 'yup';
import { db } from "../../../firebase";
import ProdutoModel from "./model/produtos";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import GetData from "../../../firebase/getData";
import { FormikTouched, useFormik } from 'formik';
import { useState, useEffect, lazy } from "react";
import { BoxTitleDefault } from "../estoque/style";
import EstoqueModel from '../estoque/model/estoque';
import ComprasModel from '../compras/model/compras';
import GenericTable from "../../../Components/table";
import FiltroGeneric from "../../../Components/filtro";
import { useDispatch, useSelector } from 'react-redux';
import FormAlert from "../../../Components/FormAlert/formAlert";
import { InputConfig } from "../../../Components/isEdit/isEdit";
import { State, setLoading } from '../../../store/reducer/reducer';
import SituacaoProduto from "../../../enumeration/situacaoProduto";
import ModalDelete from '../../../Components/FormAlert/modalDelete';
import CompraHistoricoModel from '../compras/model/comprahistoricoModel';
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, } from "@mui/material";

const IsEdit = lazy(() => import('../../../Components/isEdit/isEdit'));
const IsAdding = lazy(() => import('../../../Components/isAdding/isAdding'));

import {
    Box,
    Title,
    DivInput,
    ContainerInputs,
    ContainerButton,
    DivSituacaoProduto,
} from './style';

//hooks
import { useNavigate } from 'react-router-dom';
import { useUniqueNames } from '../../../hooks/useUniqueName';
import useFormatCurrency from '../../../hooks/formatCurrency';
import AlertDialog from '../../../Components/FormAlert/dialogForm';
import { ProdutosSemQuantidadeError, calculateTotalValue } from '../../../hooks/useCalculateTotalValue';

const objClean: ProdutoModel = {
    cdProduto: '',
    nmProduto: '',
    vlUnitario: 0,
    vlVendaProduto: 0,
    tpProduto: null,
    stEntrega: false,
    mpFabricado: [],
    stMateriaPrima: false,
    kgProduto: 1
}

function CadastroProduto() {
    const [key, setKey] = useState<number>(0);
    const [error, setError] = useState<string>();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const [selected, setSelected] = useState<ProdutoModel | undefined>();
    const [isVisibleTpProuto, setIsVisibleTpProduto] = useState<boolean>(false);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [initialValues, setInitialValues] = useState<ProdutoModel>({ ...objClean });

    const history = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state: State) => state.user);
    const { convertToNumber, formatCurrency, formatCurrencyRealTime } = useFormatCurrency();

    //realizando busca no banco de dados
    const {
        dataTable,
        loading: isLoading,
        setDataTable
    } = GetData('Produtos', recarregue) as { dataTable: ProdutoModel[], loading: boolean, setDataTable: (data: ProdutoModel[]) => void };
    const {
        dataTable: dataTableCompraHistorico,
    } = GetData('Compra Historico', recarregue) as { dataTable: ComprasModel[] };

    const {
        dataTable: dataTableEstoque,
    } = GetData('Estoque', recarregue) as { dataTable: EstoqueModel[] };

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ProdutoModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            nmProduto: Yup.string().required('Campo obrigatório'),
            cdProduto: Yup.string().required('Campo obrigatório').test('valueUnique', 'Esse código já está cadastrado', value => {
                const cod = dataTable.find(cod => cod.cdProduto === value)
                if (cod) return false
                return true
            }),
            vlUnitario: Yup.string().required('Campo obrigatório').test('stMateriaPrima1', 'Campo obrigatório', function (value, context) {
                const { parent } = context;
                if (parent.stMateriaPrima) return true
                const numericValue = value.replace(/[^\d]/g, '');
                return parseFloat(numericValue) > 0
            }),
            vlVendaProduto: Yup.string().required('Campo obrigatório').test('stMateriaPrima', 'Campo obrigatório', function (value, context) {
                const { parent } = context;
                if (parent.stMateriaPrima) return true
                const numericValue = value.replace(/[^\d]/g, '');
                return parseFloat(numericValue) > 0
            }),
            tpProduto: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório'),
            mpFabricado: Yup.array().test("array vazio", 'Campo obrigatório', function (value) {
                const tpProduto = this.resolve(Yup.ref('tpProduto'));
                if (tpProduto === SituacaoProduto.FABRICADO && (!value || value.length === 0)) return false;
                return true;
            }).nullable()
        }),
        onSubmit: handleSubmitForm,
    });

    /**
     * Limpa o estado, redefinindo os valores iniciais e gerando uma nova chave aleatória.
     */
    function cleanState() {
        setInitialValues({
            cdProduto: '',
            nmProduto: '',
            vlUnitario: 0,
            vlVendaProduto: 0,
            tpProduto: null,
            stEntrega: false,
            mpFabricado: [],
            stMateriaPrima: false,
            kgProduto: 1
        })
        setKey(Math.random());
    }

    /**
     * Configuração dos campos de entrada para o formulário.
     */
    const inputsConfig: InputConfig[] = [
        { label: 'Nome', propertyName: 'nmProduto' },
        { label: 'Código do Produto', propertyName: 'cdProduto' },
        { label: 'Valor de Venda', propertyName: 'vlVendaProduto', isCurrency: true },
        { label: 'Valor Pago', propertyName: 'vlUnitario', isCurrency: true, isDisable: selected?.tpProduto === SituacaoProduto.FABRICADO },
    ];

    /**
     * Salva um Historico de Compras para que essa tabela tenha todos os produtos salvos e com valores atualizados.
     * @param valuesUpdate objeto que ta sendo atualizado o estoque
     */
    async function savePurchaseHistory(valuesUpdate: ProdutoModel) {
        const filteredValuesUpdate: CompraHistoricoModel = {
            nmProduto: valuesUpdate.nmProduto,
            cdProduto: valuesUpdate.cdProduto,
            vlUnitario: valuesUpdate.vlUnitario,
            mpFabricado: valuesUpdate.mpFabricado ? valuesUpdate.mpFabricado : [],
            qntMinima: null,
            tpProduto: valuesUpdate.tpProduto,
            quantidade: 0,
            stMateriaPrima: valuesUpdate.stMateriaPrima,
            kgProduto: valuesUpdate.kgProduto,
            nrOrdem: 1
        }
        await addDoc(collection(db, "Compra Historico"), {
            ...filteredValuesUpdate
        })
    }

    /**
     * Envia o formulário, realizando a lógica de conversão de moeda e atualizando o histórico de compras.
     */
    async function handleSubmitForm() {
        dispatch(setLoading(true))
        values.vlVendaProduto = convertToNumber(values.vlVendaProduto.toString())
        values.vlUnitario = convertToNumber(values.vlUnitario.toString())
        if (values.mpFabricado.length > 0) {
            values.mpFabricado.forEach(mp => {
                const quantidade = mp.quantidade ? parseFloat(mp.quantidade.toString().replace(',', '.')) : 0;
                return mp.quantidade = quantidade;
            });
        }
        savePurchaseHistory(values)
        await addDoc(collection(db, "Produtos"), {
            ...values
        })
            .then(() => {
                dispatch(setLoading(false))
                setSubmitForm(true);
                setDataTable([...dataTable, values]);
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            })
            .catch(() => {
                dispatch(setLoading(false))
                setSubmitForm(false);
                setTimeout(() => { setSubmitForm(undefined) }, 3000)
            });
        resetForm()
        setFieldValue('tpProduto', null)
        cleanState()
    }

    /**
     * Exclui uma linha da tabela e do banco de dados.
     * 
     * Este método exclui a entrada correspondente na coleção "Produtos" e, se aplicável, na coleção "Estoque".
     * Após a exclusão, atualiza o estado da tabela.
     */
    async function handleDeleteRow() {
        setOpenDelete(false)
        if (selected) {
            const refID: string = selected.id ?? '';
            await deleteDoc(doc(db, "Produtos", refID)).then(() => {
                const newDataTable = dataTable.filter(row => row.id !== selected.id);
                setDataTable(newDataTable);
            });
            const stock = dataTableEstoque.find(stock => stock.nmProduto === selected.nmProduto)
            if (stock) {
                const refIdEstoque: string = stock.id ?? ''
                await deleteDoc(doc(db, "Estoque", refIdEstoque))
            }
        }
        setSelected(undefined)
    }

    /**
     * Edita uma linha da tabela e do banco de dados.
     * 
     * Este método atualiza o documento correspondente na coleção "Produtos" com os dados da linha editada.
     * Após a edição, atualiza o estado da tabela.
     */
    async function handleEditRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            const refTable = doc(db, "Produtos", refID);

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

    /**
     * calcular o valor total e atualizar o estado durante a edição ou criação.
     * 
     * calcula e atualiza o valor total com base nos dados fornecidos, considerando se é uma edição ou criação.
     * Se ocorrer um erro durante o cálculo, como a ausência de quantidade em produtos, ele captura e trata a exceção.
     */
    useEffect(() => {
        let somaFormat = 0.00;
        if (isEdit && selected) {
            somaFormat = calculateTotalValue(selected.mpFabricado, dataTableCompraHistorico);
            setSelected((prevSelected) => ({
                ...prevSelected,
                vlUnitario: parseFloat(somaFormat.toFixed(2)),
            } as ProdutoModel | undefined));
        } else {
            try {
                somaFormat = calculateTotalValue(values.mpFabricado, dataTableCompraHistorico);
                setFieldValue('vlUnitario', formatCurrency(somaFormat.toString()));
            } catch (error) {
                if (error instanceof ProdutosSemQuantidadeError) {
                    setError(error.produtosSemQuantidade)
                }
            }
        }
    }, [values.mpFabricado, isEdit, selected?.mpFabricado]);

    /**
     * controla a visibilidade do tipo de produto.
     * 
     * atualiza o estado para controlar a visibilidade do tipo de produto com base no valor selecionado.
     */
    useEffect(() => {
        if (values.tpProduto === SituacaoProduto.FABRICADO) return setIsVisibleTpProduto(true)
        return setIsVisibleTpProduto(false)
    }, [values.tpProduto])

    /**
     * ajusta o tipo de produto com base no status de matéria-prima.
     * 
     * ajusta dinamicamente o tipo de produto com base no status de matéria-prima, 
     * atualizando o campo correspondente no formulário.
     */
    useEffect(() => {
        if (values.stMateriaPrima) { setFieldValue('tpProduto', SituacaoProduto.COMPRADO); }
        else { setFieldValue('tpProduto', null); }
    }, [values.stMateriaPrima])


    return (
        <Box>
            <Title>Cadastro de Novos Produtos</Title>
            <ContainerInputs>
                <DivInput>
                    <Input
                        key={`nmProduto-${key}`}
                        label="Nome"
                        name="nmProduto"
                        onBlur={handleBlur}
                        value={values.nmProduto}
                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                        error={touched.nmProduto && errors.nmProduto ? errors.nmProduto : ''}
                        styleDiv={{ marginTop: 4 }}
                        style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                    />
                    <Input
                        key={`cdProduto-${key}`}
                        name="cdProduto"
                        onBlur={handleBlur}
                        label="Código do Produto"
                        value={values.cdProduto}
                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                        error={touched.cdProduto && errors.cdProduto ? errors.cdProduto : ''}
                        styleDiv={{ marginTop: 4 }}
                        style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                    />
                    <DivSituacaoProduto>
                        <FormControl
                            variant="standard"
                            sx={{ mb: 2, minWidth: 120 }}
                            style={{ width: '13rem', display: 'flex', justifyContent: 'center', marginRight: '12px' }}
                        >
                            <InputLabel style={{ color: '#4d68af', fontWeight: 'bold', paddingLeft: 4 }} id="standard-label">Situação do produto</InputLabel>
                            <Select
                                key={`tpProduto-${key}`}
                                name='tpProduto'
                                id="standard"
                                onBlur={handleBlur}
                                label="Selecione..."
                                labelId="standard-label"
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                value={values.tpProduto ?? ''}
                                style={{ borderBottom: '1px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                            >
                                <MenuItem
                                    value={SituacaoProduto.FABRICADO}
                                >
                                    Fabricado
                                </MenuItem>
                                <MenuItem
                                    value={SituacaoProduto.COMPRADO}
                                >
                                    Comprado
                                </MenuItem>
                            </Select>
                            {touched.tpProduto && errors.tpProduto && (
                                <div style={{ color: 'red' }}>{errors.tpProduto}</div>
                            )}
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={values.stEntrega}
                                    onChange={(e) => setFieldValue("stEntrega", e.target.checked)}
                                />
                            }
                            label="Venda no atacado?"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={values.stMateriaPrima}
                                    onChange={(e) => setFieldValue("stMateriaPrima", e.target.checked)}
                                />
                            }
                            label="Matéria-Prima ?"
                        />
                    </DivSituacaoProduto>
                </DivInput>
                <DivInput>
                    <Input
                        key={`vlVendaProduto-${key}`}
                        label="Valor Venda"
                        onBlur={handleBlur}
                        name="vlVendaProduto"
                        value={values.vlVendaProduto ? values.vlVendaProduto : ''}
                        onChange={e => setFieldValue(e.target.name, formatCurrencyRealTime(e.target.value))}
                        error={touched.vlVendaProduto && errors.vlVendaProduto ? errors.vlVendaProduto : ''}
                        styleDiv={{ marginTop: 4 }}
                        style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                        disabled={values.stMateriaPrima}
                    />
                    <Input
                        key={`vlUnitario-${key}`}
                        label="Valor Pago"
                        onBlur={handleBlur}
                        name="vlUnitario"
                        disabled={values.tpProduto === SituacaoProduto.FABRICADO || values.stMateriaPrima}
                        raisedLabel={values.tpProduto === SituacaoProduto.FABRICADO}
                        value={values.vlUnitario && values.vlUnitario.toString() !== "R$ 0,00" ? values.vlUnitario : ''}
                        onChange={e => setFieldValue(e.target.name, formatCurrencyRealTime(e.target.value))}
                        error={touched.vlUnitario && errors.vlUnitario ? errors.vlUnitario : ''}
                        styleDiv={{ marginTop: 4 }}
                        style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                    />
                    {values.tpProduto === SituacaoProduto.FABRICADO ?
                        <FormControl
                            variant="standard"
                            style={{ width: '13rem', display: 'flex', justifyContent: 'center', marginTop: '10px' }}
                        >
                            <InputLabel style={{ color: '#4d68af', fontWeight: 'bold' }}>Redimento Em Kg</InputLabel>
                            <Select
                                style={{ borderBottom: '1px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                                value={values.kgProduto}
                                label="Age"
                                onChange={e => setFieldValue('kgProduto', e.target.value)}
                            >
                                {Array.from({ length: 15 }, (_, index) => index + 1).map(value => (
                                    <MenuItem key={value} value={value}>{`${value} Kg`}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        : null
                    }
                </DivInput>
            </ContainerInputs>
            {/*Adicionando Produto */}
            <IsAdding
                addingScreen="Produto"
                data={useUniqueNames(dataTableCompraHistorico, values.tpProduto, SituacaoProduto.COMPRADO, dataTable)}
                isAdding={isVisibleTpProuto}
                products={values.mpFabricado}
                setFieldValue={setFieldValue}
                setIsVisibleTpProduto={setIsVisibleTpProduto}
                errors={errors.mpFabricado as FormikTouched<any> | undefined}
                touched={touched}
            />

            {/* Editar o Produto */}
            <IsEdit
                editingScreen='Produto'
                setSelected={setSelected}
                selected={selected}
                handleEditRow={handleEditRow}
                inputsConfig={inputsConfig}
                isEdit={isEdit}
                products={selected ? selected.mpFabricado : []}
                setIsEdit={setIsEdit}
                newData={useUniqueNames(dataTableCompraHistorico, values.tpProduto, SituacaoProduto.COMPRADO, dataTable, isEdit)}
            />
            <ModalDelete open={openDelete} onDeleteClick={handleDeleteRow} onCancelClick={() => setOpenDelete(false)} />
            <AlertDialog open={error ? true : false} nmProduto={error} onOKClick={() => { setError(undefined); history('/atualizar-estoque') }} />
            <ContainerButton>
                <Button
                    label='Cadastrar Produto'
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    style={{ margin: '1rem 4rem 2rem 95%', height: '4rem', width: '12rem' }}
                />

                <FormAlert submitForm={submitForm} name={'Produto'} styleLoadingMarginTop='-7rem' />
            </ContainerButton>

            {/*Tabala */}

            <BoxTitleDefault>
                <div>
                    <FiltroGeneric data={dataTable} setFilteredData={setDataTable} carregarDados={setRecarregue} type="produto" />
                </div>
            </BoxTitleDefault>
            <GenericTable
                columns={[
                    { label: 'Código', name: 'cdProduto' },
                    { label: 'Nome', name: 'nmProduto' },
                    { label: 'Valor Venda', name: 'vlVendaProduto', isCurrency: true },
                    { label: 'Valor Pago', name: 'vlUnitario', isCurrency: true },
                ]}
                data={dataTable}
                isLoading={isLoading}
                isdisabled={selected ? false : true}
                onSelectedRow={setSelected}
                onEdit={() => {
                    if (selected) {
                        setIsEdit(true)
                        setInitialValues(selected)
                    } else {
                        return
                    }
                }}
                onDelete={() => setOpenDelete(true)}
            />
        </Box>
    );
}

export default CadastroProduto;