import React, { useEffect, useState } from 'react';
import { Grow, Button, Box, Grid, Collapse, Typography, Autocomplete, TextField } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import Input from '../input';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getItemsByQuery } from '../../hooks/queryFirebase';
import { useDispatch } from 'react-redux';
import { where } from 'firebase/firestore';

interface CollapseListProductProps<T> {
    initialItems?: T[];
    onAddItem?: (item: T) => void;
    onRemoveItem?: (item: T) => void;
    onEditItem?: (item: T) => void;
    isVisible: boolean;
    collectionName: string;
}

const CollapseListProduct = <T,>({ initialItems, onAddItem, onRemoveItem, isVisible, onEditItem, collectionName }: CollapseListProductProps<T>) => {
    const [items, setItems] = useState<T[]>(initialItems ?? []);
    const [inputValue, setInputValue] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [editItem, setEditItem] = useState<T | null>(null);
    const dispatch = useDispatch();
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (initialItems) {
            setItems(initialItems);
        }
    }, [initialItems])

    const handleAddItem = () => {
        if (inputValue && quantidade) {
            if (editItem) {
                // Editar o item existente
                const updatedItem = { ...editItem, nmProduto: inputValue, quantidade } as T;
                const newItems = items.map(item => (item as any).nmProduto === (editItem as any).nmProduto ? updatedItem : item)
                setItems(newItems);
                if (onEditItem) onEditItem(updatedItem);
            } else {
                // Adicionar novo item
                const newItem = { nmProduto: inputValue, quantidade } as T;
                setItems(prev => [...prev, newItem]);
                if (onAddItem) onAddItem(newItem);
            }
        }
        // Limpar os campos
        setInputValue('');
        setQuantidade('');
        setEditItem(null);
    };

    const handleRemoveItem = (nmProduto: string) => {
        setItems(prev => prev.filter(item => (item as any).nmProduto !== nmProduto));
        const removedItem = items.find(item => (item as any).nmProduto === nmProduto);
        if (removedItem && onRemoveItem) onRemoveItem(removedItem);
    };

    const handleEditItem = (item: T) => {
        setEditItem(item);
        setInputValue((item as any).nmProduto);
        setQuantidade((item as any).quantidade);
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
                        <DeleteIcon />
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                    <Typography>
                        Nome: {(item as any).nmProduto}
                    </Typography>
                    <Typography>
                        Qntd.: {(item as any).quantidade}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    async function fetchSuggestions() {
        const { data } = await getItemsByQuery<T>(
            collectionName,
            [
                where('nmProduto', '>=', inputValue),
                where('nmProduto', '<=', inputValue + '\uf8ff')
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
            if (inputValue) {
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
    }, [inputValue]);

    return (
        <div style={{ marginLeft: '4%' }}>
            <Collapse in={isVisible}>
                <Box mb={2}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={2}>
                            <Autocomplete
                                freeSolo
                                options={suggestions}
                                value={inputValue}
                                onInputChange={(event, newInputValue) => {
                                    setInputValue(newInputValue);
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Nome do produto" variant="standard" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Input
                                type="text"
                                value={quantidade}
                                onChange={(e) => setQuantidade(e.target.value)}
                                label='Quantidade'
                                error=''
                                name=''
                            />
                        </Grid>
                        <Grid item xs={1.3}>
                            <Button onClick={handleAddItem} variant="contained" color="primary" fullWidth>
                                {editItem ? "Editar" : "Adicionar"}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
                <TransitionGroup style={{ display: 'flex', flexWrap: 'wrap', height: '15rem' }}>
                    {items.map((item) => (
                        <Grow key={(item as any).nmProduto}>
                            {renderItem(item)}
                        </Grow>
                    ))}
                </TransitionGroup>
            </Collapse>
        </div>
    );
};

export default CollapseListProduct;
