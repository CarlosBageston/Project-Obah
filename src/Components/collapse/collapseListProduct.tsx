import { useEffect, useState } from 'react';
import { Grow, Button, Box, Grid, Collapse, Typography, Autocomplete, TextField } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import Input from '../input';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getItemsByQuery } from '../../hooks/queryFirebase';
import { useDispatch } from 'react-redux';
import { where } from 'firebase/firestore';
import useFormatCurrency from '../../hooks/formatCurrency';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface CollapseListProductProps<T> {
    initialItems?: T[];
    onAddItem?: (item: T) => void;
    onRemoveItem?: (item: T) => void;
    onEditItem?: (item: T) => void;
    isVisible: boolean;
    collectionName: string;
}

interface ItemProps {
    nmProduto: string,
    quantidade: string
}

const CollapseListProduct = <T,>({ initialItems, onAddItem, onRemoveItem, isVisible, onEditItem, collectionName }: CollapseListProductProps<T>) => {
    const [items, setItems] = useState<T[]>(initialItems ?? []);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [editItem, setEditItem] = useState<T | null>(null);
    const dispatch = useDispatch();
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    const { convertToNumber } = useFormatCurrency();

    const handleAddItem = (values: ItemProps) => {
        if (!suggestions.includes(values.nmProduto)) {
            setFieldError('nmProduto', 'Item inválido');
            return;
        }
        if (values.nmProduto && values.quantidade) {
            if (editItem) {
                const updatedItem = { ...editItem, nmProduto: values.nmProduto, quantidade: values.quantidade } as T;
                const newItems = items.map(item => (item as any).nmProduto === (editItem as any).nmProduto ? updatedItem : item)
                setItems(newItems);
                if (onEditItem) onEditItem(updatedItem);
            } else {
                const qntdFormatted = convertToNumber(values.quantidade);
                const newItem = { nmProduto: values.nmProduto, quantidade: qntdFormatted } as T;
                setItems(prev => [...prev, newItem]);
                if (onAddItem) onAddItem(newItem);
            }
        }
        resetForm()
        setEditItem(null);
    };

    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm, setFieldError } = useFormik<ItemProps>({
        initialValues: {
            nmProduto: '',
            quantidade: '',
        },
        validationSchema: Yup.object({
            nmProduto: Yup.string()
                .required('O nome do produto é obrigatório.')
                .test('valid-product', 'O produto inserido não é válido.', value => !value || suggestions.includes(value)),
            quantidade: Yup.string().required('A quantidade é obrigatória.')
        }),
        onSubmit: handleAddItem
    });
    useEffect(() => {
        if (initialItems) {
            setItems(initialItems);
        }
    }, [initialItems])



    const handleRemoveItem = (nmProduto: string) => {
        setItems(prev => prev.filter(item => (item as any).nmProduto !== nmProduto));
        const removedItem = items.find(item => (item as any).nmProduto === nmProduto);
        if (removedItem && onRemoveItem) onRemoveItem(removedItem);
    };

    const handleEditItem = (item: T) => {
        setEditItem(item);
        setFieldValue('nmProduto', (item as any).nmProduto);
        setFieldValue('quantidade', (item as any).quantidade);
    };

    const renderItem = (item: T) => (
        <Box
            key={(item as any).nmProduto}
            sx={{
                padding: 2,
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
                    <Button onClick={() => handleRemoveItem((item as any).nmProduto)}>
                        <DeleteIcon style={{ color: '#535353' }} />
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                    <Typography>
                        Nome: {(item as any).nmProduto}
                    </Typography>
                    <Typography>
                        Qntd.: {(item as any).quantidade.toString().replace('.', ',')}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    async function fetchSuggestions() {
        const { data } = await getItemsByQuery<T>(
            collectionName,
            [
                where('nmProduto', '>=', values.nmProduto),
                where('nmProduto', '<=', values.nmProduto + '\uf8ff')
            ],
            dispatch
        );
        setSuggestions(data.map(item => (item as any).nmProduto));
    }

    useEffect(() => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const newTimeout = setTimeout(() => {
            if (values.nmProduto) {
                fetchSuggestions();
            } else {
                setSuggestions([]);
            }
        }, 500);

        setDebounceTimeout(newTimeout);
        return () => {
            if (newTimeout) {
                clearTimeout(newTimeout);
            }
        };
    }, [values.nmProduto]);

    return (
        <div style={{ marginLeft: '4%' }}>
            <Collapse in={isVisible}>
                <Box mb={2}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={2}>
                            <Autocomplete
                                freeSolo
                                disabled={editItem !== null}
                                options={suggestions}
                                value={values.nmProduto}
                                onInputChange={(event, newInputValue) => setFieldValue('nmProduto', newInputValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Nome do produto"
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
                                type="text"
                                value={values.quantidade}
                                onChange={(e) => setFieldValue('quantidade', e.target.value.replace('.', ','))}
                                label='Quantidade'
                                error=''
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
                    {items.map((item) => (
                        <Grow key={(item as any).id}>
                            {renderItem(item)}
                        </Grow>
                    ))}
                </TransitionGroup>
            </Collapse>
        </div>
    );
};

export default CollapseListProduct;
