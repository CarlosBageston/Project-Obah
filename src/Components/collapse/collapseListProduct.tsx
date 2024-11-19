import { useEffect, useState } from 'react';
import { Grow, Button, Box, Grid, Collapse, Typography, Autocomplete, TextField } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import Input from '../input';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useDebouncedSuggestions from '../../hooks/useDebouncedSuggestions';
import SituacaoProduto from '../../enumeration/situacaoProduto';
import { formatDescription } from '../../utils/formattedString';
import useHandleInputKeyPress from '../../hooks/useHandleInputKeyPress';
import { convertToNumber, formatCurrencyRealTime, NumberFormatForBrazilianCurrency } from '../../hooks/formatCurrency';

interface CollapseListProductProps<T> {
    initialItems: T[];
    nameArray: string;
    isVisible: boolean;
    collectionName: string;
    setFieldValueExterno: (field: string, value: any) => any;
    searchMateriaPrima?: boolean,
    tpProdutoSearch?: SituacaoProduto,
    labelInput?: string
    labelAutoComplete?: string
    typeValueInput?: 'number' | 'currency',

}

interface ItemProps {
    nmProduto: string,
    quantidade: number | null,
    vlUnitario: number | null,
    vlVendaProduto: number | null
}

const CollapseListProduct = <T,>({
    initialItems,
    nameArray,
    isVisible,
    collectionName,
    setFieldValueExterno,
    labelAutoComplete,
    typeValueInput,
    labelInput,
    tpProdutoSearch,
    searchMateriaPrima = false
}: CollapseListProductProps<T>) => {
    const [items, setItems] = useState<T[]>(initialItems ?? []);
    const [editItem, setEditItem] = useState<T | null>(null);
    const dispatch = useDispatch();
    const [key, setKey] = useState<number>(0);
    const { onKeyPressHandleSubmit } = useHandleInputKeyPress();

    const handleAddItem = (values: ItemProps) => {
        if (values.nmProduto && (values.quantidade || values.vlVendaProduto)) {
            if (editItem) {
                const updatedItem = {
                    ...editItem,
                    nmProduto: values.nmProduto,
                    quantidade: values.quantidade ? convertToNumber(values.quantidade.toString()) : null,
                    vlVendaProduto: values.vlVendaProduto ? formatCurrencyRealTime(values.vlVendaProduto.toString()) : null,
                    vlUnitario: values.vlUnitario ? values.vlUnitario : null
                } as T;
                const newItems = items.map(item => (item as any).nmProduto === (editItem as any).nmProduto ? updatedItem : item)
                setItems(newItems);
                setFieldValueExterno(nameArray, initialItems.map(i => (i as any).nmProduto === (updatedItem as any).nmProduto ? updatedItem : i));
            } else {
                const newItem = {
                    nmProduto: values.nmProduto,
                    quantidade: values.quantidade ? convertToNumber(values.quantidade.toString()) : null,
                    vlVendaProduto: values.vlVendaProduto ? formatCurrencyRealTime(values.vlVendaProduto.toString()) : null,
                    vlUnitario: values.vlUnitario
                } as T
                setItems(prev => [...prev, newItem]);
                setFieldValueExterno(nameArray, [...initialItems, newItem]);
            }
        }
        setEditItem(null);
        resetForm();
        setKey(Math.random());
    };
    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ItemProps>({
        initialValues: {
            nmProduto: '',
            quantidade: null,
            vlUnitario: null,
            vlVendaProduto: null
        },
        validationSchema: Yup.object({
            nmProduto: Yup.string()
                .required('O nome do produto é obrigatório.')
                // .test('valid-product', 'O produto inserido não é válido.', value => {
                //     console.log(value)
                //     console.log(suggestions)
                //     return !value || (suggestions?.find((i: any) => i.nmProduto === value) ? true : false);
                // })
                .test('unique-product', 'esse Item ja existe na lista.', value => {
                    if (editItem) return true;
                    if (!value) return true;
                    return !items.some((item: any) => item.nmProduto === value);
                }),
            quantidade: Yup.string()
                .nullable()
                .test('quantidade-optional', 'Campo Obrigatório.', function (value) {
                    if (typeValueInput === 'number' && !value) return false;
                    return true;
                }),
            vlVendaProduto: Yup.string()
                .nullable()
                .test('vlVendaProduto-optional', 'Campo Obrigatório.', function (value) {
                    if (typeValueInput === 'currency' && !value) return false;
                    return true;
                })
        }),
        onSubmit: handleAddItem
    });
    const suggestions: ItemProps[] = useDebouncedSuggestions<ItemProps>(formatDescription(values.nmProduto), collectionName, dispatch, "Produto", tpProdutoSearch, searchMateriaPrima);


    useEffect(() => {
        if (initialItems) {
            setItems(initialItems);
        }
    }, [initialItems])

    const handleRemoveItem = (nmProduto: string) => {
        setItems(prev => prev.filter(item => (item as any).nmProduto !== nmProduto));
        const removedItem = items.find(item => (item as any).nmProduto === nmProduto);
        if (!removedItem) return;
        setFieldValueExterno(nameArray, initialItems.filter(i => (i as any).nmProduto !== (removedItem as any).nmProduto));
    };

    const handleEditItem = (item: any) => {
        setEditItem(item);
        setFieldValue('nmProduto', item.nmProduto);
        setFieldValue('vlVendaProduto', item.vlVendaProduto);
        setFieldValue('quantidade', item.quantidade);
        setFieldValue('vlUnitario', item.vlUnitario);
    };

    const renderItem = (item: any) => (
        <Box
            key={item.nmProduto}
            sx={{
                padding: '8px',
                margin: 0.5,
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                height: '8rem',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                position: 'relative',
                width: '15rem'
            }}
        >
            <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={() => handleEditItem(item)}>
                        <EditIcon />
                    </Button>
                    <Button onClick={() => handleRemoveItem(item.nmProduto)}>
                        <DeleteIcon style={{ color: '#535353' }} />
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                    <Typography>
                        Nome: {item.nmProduto}
                    </Typography>
                    <Typography>
                        {typeValueInput === 'currency' ? `Valor: ${NumberFormatForBrazilianCurrency(item.vlVendaProduto)}` : `Quantidade: ${item.quantidade}`}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <div>
            <Collapse in={isVisible}>
                <Box mb={2}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={2}>
                            <Autocomplete
                                key={key}
                                freeSolo
                                style={{ height: '70px' }}
                                disabled={editItem !== null}
                                options={suggestions}
                                getOptionLabel={(option: any) => option && option.nmProduto ? option.nmProduto : ""}
                                value={suggestions.find((item: any) => item.nmProduto === values.nmProduto) || null}
                                onChange={(_, selectedOption: any) => selectedOption && setFieldValue('vlUnitario', selectedOption.vlUnitario)}
                                onInputChange={(_, newInputValue) => setFieldValue('nmProduto', newInputValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={labelAutoComplete || 'Nome do Produto'}
                                        variant="standard"
                                        error={touched.nmProduto && Boolean(errors.nmProduto)}
                                        helperText={touched.nmProduto && errors.nmProduto}
                                        onBlur={handleBlur}
                                    />
                                )}
                            />

                        </Grid>
                        <Grid item xs={2}>
                            <Input
                                key={key}
                                type="text"
                                value={(typeValueInput === 'currency' ? (typeof values.vlVendaProduto === 'number' ? NumberFormatForBrazilianCurrency(values.vlVendaProduto) : values.vlVendaProduto) : values.quantidade) as number}
                                onChange={(e) => {
                                    if (typeValueInput === 'currency') setFieldValue('vlVendaProduto', formatCurrencyRealTime(e.target.value))
                                    else setFieldValue('quantidade', e.target.value.replace('.', ','))
                                }}
                                onKeyUp={(e) => { onKeyPressHandleSubmit(e, handleSubmit) }}
                                label={labelInput || 'Quantidade'}
                                error={(touched.vlVendaProduto && errors.vlVendaProduto ? errors.vlVendaProduto : '') || (touched.quantidade && errors.quantidade ? errors.quantidade : '')}
                                name=''
                            />
                        </Grid>
                        <Grid item xs={1.3}>
                            <Button onClick={() => handleSubmit()} variant="contained" color="primary" fullWidth>
                                {editItem ? "Editar" : "Adicionar"}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
                <TransitionGroup style={{ display: 'flex', flexWrap: 'wrap', height: '15rem' }}>
                    {items.map((item: any) => (
                        <Grow key={item.id}>
                            {renderItem(item)}
                        </Grow>
                    ))}
                </TransitionGroup>
            </Collapse>
        </div>
    );
};

export default CollapseListProduct;
