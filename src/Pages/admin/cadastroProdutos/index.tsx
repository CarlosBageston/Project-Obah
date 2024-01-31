import * as Yup from 'yup';
import { db } from "../../../firebase";
import ProdutoModel from "./model/produtos";
import Input from "../../../Components/input";
import Button from "../../../Components/button";
import GetData from "../../../firebase/getData";
import { FormikTouched, useFormik } from 'formik';
import { useState, useEffect, lazy } from "react";
import { BoxTitleDefault } from "../estoque/style";
import ComprasModel from "../compras/model/compras";
import GenericTable from "../../../Components/table";
import FiltroGeneric from "../../../Components/filtro";
import { useDispatch, useSelector } from 'react-redux';
import FormAlert from "../../../Components/FormAlert/formAlert";
import { InputConfig } from "../../../Components/isEdit/isEdit";
import { State, setLoading } from '../../../store/reducer/reducer';
import SituacaoProduto from "../../../enumeration/situacaoProduto";
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
import { useUniqueNames } from '../../../hooks/useUniqueName';
import useFormatCurrency from '../../../hooks/formatCurrency';
import { calculateTotalValue } from '../../../hooks/useCalculateTotalValue';

const objClean: ProdutoModel = {
    cdProduto: '',
    nmProduto: '',
    vlUnitario: 0,
    vlVendaProduto: 0,
    tpProduto: null,
    stEntrega: false,
    mpFabricado: [],
    nrOrdem: 0
}

function CadastroProduto() {
    const [key, setKey] = useState<number>(0);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [selected, setSelected] = useState<ProdutoModel | undefined>();
    const [isVisibleTpProuto, setIsVisibleTpProduto] = useState<boolean>(false);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [initialValues, setInitialValues] = useState<ProdutoModel>({ ...objClean });
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
        dataTable: comprasDataTable,
    } = GetData('Compras', recarregue) as { dataTable: ComprasModel[] };

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
            vlUnitario: Yup.string().required('Campo obrigatório').test('vlUnitario', 'Campo Obrigatório', (value) => {
                const numericValue = value.replace(/[^\d]/g, '');
                return parseFloat(numericValue) > 0;
            }),
            vlVendaProduto: Yup.string().required('Campo obrigatório').test('vlVendaProduto', 'Campo Obrigatório', (value) => {
                const numericValue = value.replace(/[^\d]/g, '');
                return parseFloat(numericValue) > 0;
            }),
            tpProduto: Yup.number().transform((value) => (isNaN(value) ? undefined : value)).required('Campo obrigatório'),
            mpFabricado: Yup.array().test("array vazio", 'Campo obrigatório', function (value) {
                const tpProduto = this.resolve(Yup.ref('tpProduto'));
                if (tpProduto === SituacaoProduto.FABRICADO && (!value || value.length === 0)) {
                    return false;
                } else {
                    return true;
                }
            }).nullable()
        }),
        onSubmit: handleSubmitForm,
    });

    function cleanState() {
        setInitialValues({
            cdProduto: '',
            nmProduto: '',
            vlUnitario: 0,
            vlVendaProduto: 0,
            tpProduto: null,
            stEntrega: false,
            mpFabricado: [],
            nrOrdem: 0
        })
        setKey(Math.random());
    }
    const inputsConfig: InputConfig[] = [
        { label: 'Nome', propertyName: 'nmProduto' },
        { label: 'Código do Produto', propertyName: 'cdProduto' },
        { label: 'Valor de Venda', propertyName: 'vlVendaProduto', isCurrency: true },
        { label: 'Valor Pago', propertyName: 'vlUnitario', isCurrency: true, isDisable: selected?.tpProduto === SituacaoProduto.FABRICADO },
    ];
    //enviando formulario
    async function handleSubmitForm() {
        dispatch(setLoading(true))
        const valuesUpdate = { ...values, nrOrdem: 0 };
        valuesUpdate.vlVendaProduto = convertToNumber(valuesUpdate.vlVendaProduto.toString())
        valuesUpdate.vlUnitario = convertToNumber(valuesUpdate.vlUnitario.toString())
        valuesUpdate.mpFabricado.forEach(mp => {
            const quantidade = mp.quantidade ? parseFloat(mp.quantidade.toString().replace(',', '.')) : 0;
            return mp.quantidade = quantidade;
        });
        await addDoc(collection(db, "Produtos"), {
            ...valuesUpdate
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

    //deleta uma linha da tabela e do banco de dados
    async function handleDeleteRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            await deleteDoc(doc(db, "Produtos", refID)).then(() => {
                const newDataTable = dataTable.filter(row => row.id !== selected.id);
                setDataTable(newDataTable);
            });
        }
        setSelected(undefined)
    }

    //editar uma linha da tabela e do banco de dados
    async function handleEditRow() {
        if (selected) {
            const refID: string = selected.id ?? '';
            const refTable = doc(db, "Produtos", refID);

            selected.vlVendaProduto = convertToNumber(selected.vlVendaProduto.toString())
            selected.vlUnitario = convertToNumber(selected.vlUnitario.toString())

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


    useEffect(() => {
        let somaFormat = 0.00;
        if (isEdit && selected) {
            somaFormat = calculateTotalValue(selected.mpFabricado, comprasDataTable);
            setSelected((prevSelected) => ({
                ...prevSelected,
                vlUnitario: parseFloat(somaFormat.toFixed(2)),
            } as ProdutoModel | undefined));
        } else {
            somaFormat = calculateTotalValue(values.mpFabricado, comprasDataTable);
            setFieldValue('vlUnitario', formatCurrency(somaFormat.toString()));
        }
    }, [comprasDataTable, values.mpFabricado, isVisibleTpProuto, selected?.mpFabricado]);

    useEffect(() => {
        if (values.tpProduto === SituacaoProduto.FABRICADO) return setIsVisibleTpProduto(true)
        return setIsVisibleTpProduto(false)
    }, [values.tpProduto])

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
                            style={{ width: '13rem', display: 'flex', justifyContent: 'center' }}
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
                                value={values.tpProduto}
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
                    />
                    <Input
                        key={`vlUnitario-${key}`}
                        label="Valor Pago"
                        onBlur={handleBlur}
                        name="vlUnitario"
                        disabled={values.tpProduto === SituacaoProduto.FABRICADO}
                        raisedLabel={values.tpProduto === SituacaoProduto.FABRICADO}
                        value={values.vlUnitario && values.vlUnitario.toString() !== "R$ 0,00" ? values.vlUnitario : ''}
                        onChange={e => setFieldValue(e.target.name, formatCurrencyRealTime(e.target.value))}
                        error={touched.vlUnitario && errors.vlUnitario ? errors.vlUnitario : ''}
                        styleDiv={{ marginTop: 4 }}
                        style={{ borderBottom: '2px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a' }}
                    />
                </DivInput>
            </ContainerInputs>
            {/*Adicionando Produto */}
            <IsAdding
                addingScreen="Produto"
                data={useUniqueNames(comprasDataTable, values.tpProduto, SituacaoProduto.COMPRADO, dataTable)}
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
                newData={useUniqueNames(comprasDataTable, values.tpProduto, SituacaoProduto.COMPRADO, dataTable, undefined, isEdit)}
            />
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
                onDelete={handleDeleteRow}
            />
        </Box>
    );
}

export default CadastroProduto;