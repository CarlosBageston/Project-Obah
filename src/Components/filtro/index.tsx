import React, { Dispatch, SetStateAction, useState } from 'react';
import { BiSearchAlt } from 'react-icons/bi'
import { FormControl, Autocomplete, TextField, AutocompleteChangeReason } from '@mui/material';
import { ContainerFilter, ContainerInput, ButtonFilter, ContainerButton } from './style'
import { DocumentData, endAt, orderBy, QueryDocumentSnapshot, startAt } from 'firebase/firestore';
import { getItemsByQuery } from '../../hooks/queryFirebase';
import { useDispatch } from 'react-redux';

interface FilterProps {
    label: string,
    values: string
}


interface Props {
    setFilteredData: (data: any[]) => void,
    carregarDados: React.Dispatch<React.SetStateAction<boolean>>,
    filter: FilterProps[],
    setLastVisible: Dispatch<SetStateAction<QueryDocumentSnapshot<DocumentData> | null>>
    collectionName?: string
}

/**
 * FiltroGeneric Component
 * 
 * @param data Dados a serem filtrados
 * @param setFilteredData Função para definir os dados filtrados
 * @param type Tipo de filtro: "cliente" ou "produto"
 * @param carregarDados Função para atualizar o estado de carregamento dos dados
 * 
 * Este componente exibe um campo de filtro que permite ao usuário selecionar um valor para filtrar os dados fornecidos.
 * Dependendo do tipo de filtro especificado, o componente renderiza um Autocomplete com opções de clientes ou produtos.
 * Quando um valor é selecionado no Autocomplete, a função de filtro correspondente é chamada para filtrar os dados.
 * O componente também permite cancelar o filtro e redefinir os dados filtrados para os dados originais.
 */

const GenericFilter = ({ setFilteredData, carregarDados, filter, setLastVisible, collectionName }: Props) => {
    const [valueItem, setValueItem] = useState<string>('');
    const [objectSearch, setObjectSearch] = useState<FilterProps | undefined>();
    const dispatch = useDispatch()

    /**
     * Função para chamar a filtragem com base no tipo especificado (cliente ou produto).
     */
    function callFilter() {
        filterByItem();
    }

    /**
    * Cancela a filtragem, restaurando os dados originais e redefinindo os valores relacionados.
    */
    const cancelFiltered = () => {
        carregarDados(true)
        setLastVisible(null)
        setValueItem('')
    };

    /**
     * Função chamada ao pressionar a tecla Enter no input, realiza a filtragem conforme o tipo especificado.
     * @param e - Evento de teclado associado à entrada de texto.
     */
    function onKeyPressCallFilter(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            filterByItem();
        }

    }

    const filterByItem = async () => {
        carregarDados(false)
        if (!objectSearch?.values || !valueItem) {
            console.warn("Campos de busca ou valores inválidos.");
            return;
        }

        try {
            const constraints = [
                orderBy(objectSearch.values),
                startAt(valueItem),
                endAt(valueItem + '\uf8ff')
            ];

            const { data } = await getItemsByQuery(collectionName ?? '', constraints, dispatch);
            setFilteredData(data);
        } catch (error) {
            console.error('Erro ao filtrar itens:', error);
        }
    };

    function handleAutoCompleteTypeFilter(newValue: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            cancelFiltered()
        } else if (newValue) {
            const values = filter?.find(item => item.label === newValue);
            setObjectSearch(values)
        }
    }

    return (
        <>
            <div>
                <FormControl
                    variant="standard"
                    sx={{ m: 1, minWidth: 120 }}
                    style={{ paddingRight: '3rem' }}
                >
                    <ContainerFilter>
                        <ContainerInput style={{ width: '9rem' }}>
                            <Autocomplete
                                id="tags-standard"
                                options={filter?.map(item => item.label) ?? []}
                                getOptionLabel={(produto: string) => { return produto; }}
                                onChange={(e, newValue, reason) => handleAutoCompleteTypeFilter(newValue, reason)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        onKeyDown={onKeyPressCallFilter}
                                        variant="standard"
                                        label="Tipo de Filtro"
                                        placeholder="Selecione..."
                                    />
                                )}
                            />
                        </ContainerInput>
                        <ContainerInput style={{ paddingLeft: '1rem' }}>
                            <TextField
                                id="standard-basic"
                                label="Filtro"
                                variant="standard"
                                value={valueItem}
                                onChange={(e) => setValueItem(e.target.value)}
                                onKeyDown={onKeyPressCallFilter}
                            />
                        </ContainerInput>
                        <ContainerButton>
                            <div style={{ display: 'flex' }}>
                                <ButtonFilter
                                    type="button"
                                    onClick={callFilter}
                                    startIcon={<BiSearchAlt size={25} />}
                                >
                                </ButtonFilter>
                            </div>
                        </ContainerButton>
                    </ContainerFilter>
                </FormControl>
            </div >
        </>
    );
};

export default GenericFilter;
