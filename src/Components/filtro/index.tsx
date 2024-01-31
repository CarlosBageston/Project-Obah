import React, { useEffect, useState } from 'react';
import { BiSearchAlt } from 'react-icons/bi'
import { CgPlayListSearch } from 'react-icons/cg'
import { FormControl, Autocomplete, TextField, AutocompleteChangeReason } from '@mui/material';
import { ContainerFilter, ContainerInput, StyledButton, ButtonFilter, ContainerButton } from './style'

interface Props {
    data: any[],
    setFilteredData: (data: any[]) => void,
    type: "cliente" | "produto",
    carregarDados: React.Dispatch<React.SetStateAction<boolean>>
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

const FiltroGeneric = ({ data, setFilteredData, type, carregarDados }: Props) => {
    const uniqueNames = [...new Set(data.map(item => item.nmProduto))];
    const [valueClient, setValueClient] = useState<any>();
    const [valueproduct, setValueproduct] = useState<any>();
    const [showInput, setShowInput] = useState<boolean>(false);
    const [search, setSearch] = useState<boolean>(false);
    function handleAtraso() {
        setTimeout(() => {
            setSearch(true);
            setTimeout(() => {
                setShowInput(true);
            }, 400);
        }, 200);
    }
    function callFilter() {
        carregarDados(false)
        if (type === 'cliente') {
            filterByCliente(valueClient)
        } else {
            filterByProduto(valueproduct)
        }

    }

    useEffect(() => {

    }, [data])
    //quando o tipo de filtro for cliente, ele chama essa função 
    const filterByCliente = (clientes: any) => {
        if (clientes || clientes.nmCliente) {
            const clienteEncontrado = data.filter(cliente => cliente.nmCliente === clientes.nmCliente)
            setFilteredData(clienteEncontrado)
        }
    };
    const filterByProduto = (produtos: any) => {
        if (produtos || produtos.nmProduto) {
            const produtosEncontrados = data.filter((produto) => produto.nmProduto === produtos.nmProduto);
            setFilteredData(produtosEncontrados)
        }
    };
    const cancelFiltered = () => {
        setFilteredData(data);
        carregarDados(true)
        setValueproduct([])
        setValueClient('')
    };
    function handleAutoComplete(newValue: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            cancelFiltered()
        } else if (newValue) {
            if (type === 'produto') {
                const foundProduct = data.find(product => product.nmProduto === newValue)
                setValueproduct(foundProduct)
            } else {
                setValueClient(newValue)
            }
        }
    }
    let selectComponent = null;
    if (type === 'produto') {
        selectComponent = (
            <Autocomplete
                id="tags-standard"
                options={uniqueNames}
                getOptionLabel={(produto: string) => produto}
                onChange={(e, newValue, reason) => handleAutoComplete(newValue, reason)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="standard"
                        label="Filtro"
                        placeholder="Selecione..."
                    />
                )}
            />
        );
    } else {
        selectComponent = (
            <Autocomplete
                id="tags-standard"
                options={data}
                getOptionLabel={(cliente: any) => cliente.nmCliente}
                onChange={(e, value, reason) => handleAutoComplete(value, reason)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="standard"
                        label="Filtro"
                        placeholder="Selecione..."
                    />
                )}
            />
        );
    }
    return (
        <div>
            <FormControl
                variant="standard"
                sx={{ m: 1, minWidth: 120 }}
                style={{ paddingRight: '3rem' }}
            >
                <ContainerFilter>
                    <ContainerInput isVisible={showInput}>
                        {selectComponent}
                    </ContainerInput>
                    <ContainerButton>
                        {!showInput ? (
                            <StyledButton
                                type="button"
                                className={`${search ? 'flip-out' : ''}`}
                                onClick={handleAtraso}
                                startIcon={<CgPlayListSearch size={30} />}
                                style={{ transition: 'transform 0.2s, opacity 1s' }}
                            >
                            </StyledButton>
                        ) : (
                            <div style={{ display: 'flex' }}>

                                <ButtonFilter
                                    type="button"
                                    onClick={callFilter}
                                    startIcon={<BiSearchAlt size={25} />}
                                >
                                </ButtonFilter>
                            </div>
                        )}
                    </ContainerButton>
                </ContainerFilter>
            </FormControl>
        </div >
    );
};

export default FiltroGeneric;
