import React, { Dispatch, SetStateAction, useState } from 'react';
import { BiSearchAlt } from 'react-icons/bi'
import { FormControl, Autocomplete, TextField, AutocompleteChangeReason } from '@mui/material';
import { ContainerFilter, ContainerInput, ButtonFilter, ContainerButton } from './style'
import { DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore';
import useHandleInputKeyPress from '../../hooks/useHandleInputKeyPress';

interface FilterProps {
    label: string,
    values: string
}


interface Props {
    carregarDados: React.Dispatch<React.SetStateAction<boolean>>,
    filter: FilterProps[],
    setLastVisible: Dispatch<SetStateAction<QueryDocumentSnapshot<DocumentData> | null>>
    fetchPageData: (direction?: "next" | "previous", filters?: any) => Promise<void>
    setAppliedFilters: Dispatch<SetStateAction<any[]>>
    setPage: Dispatch<SetStateAction<number>>
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

const GenericFilter = ({ setPage, carregarDados, filter, setLastVisible, setAppliedFilters, fetchPageData }: Props) => {
    const [valueItem, setValueItem] = useState<string>('');
    const [objectSearch, setObjectSearch] = useState<FilterProps | undefined>();
    const { onKeyPressHandleSubmit } = useHandleInputKeyPress();
    //TODO: Não ta funcionando o filtro em estoque
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
        setAppliedFilters([]);
        setPage(1);
        carregarDados(true)
        setLastVisible(null)
        setValueItem('')
    };

    const filterByItem = async () => {
        carregarDados(false);
        if (!objectSearch?.values || !valueItem) {
            console.warn("Campos de busca ou valores inválidos.");
            return;
        }
        let nmField = objectSearch?.values
        if (nmField === 'nmProduto' || nmField === 'nmCliente') {
            nmField = objectSearch?.values.concat("Formatted");
        }

        const constraints = [
            where(nmField, '>=', valueItem),
            where(nmField, '<=', valueItem + '\uf8ff')
        ];
        setAppliedFilters(constraints);
        setPage(1);
        fetchPageData('next', constraints);
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
                                        onKeyDown={(e) => onKeyPressHandleSubmit(e, filterByItem)}
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
                                onKeyDown={(e) => onKeyPressHandleSubmit(e, filterByItem)}
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
