import React, { useEffect, useState } from 'react';
import { BiSearchAlt } from 'react-icons/bi'
import { CgPlayListSearch } from 'react-icons/cg'
import { FormControl, Autocomplete, TextField, AutocompleteChangeReason } from '@mui/material';
import { ContainerFilter, ContainerInput, StyledButton, ButtonFilter, ContainerButton } from './style'
import ClienteModel from '../../Pages/admin/cadastroClientes/model/cliente';
import ProdutosModel from '../../Pages/admin/cadastroProdutos/model/produtos';
import { isArray } from 'lodash';

interface FilterProps {
    label: string,
    values: string
}


interface Props {
    data: any[],
    setFilteredData: (data: any[]) => void,
    type: "cliente" | "produto" | "Entrega" | "estoque",
    carregarDados: React.Dispatch<React.SetStateAction<boolean>>,
    filter?: FilterProps[]
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

const FiltroGeneric = ({ data, setFilteredData, type, carregarDados, filter }: Props) => {
    const [valueClient, setValueClient] = useState<any>();
    const [valueproduct, setValueproduct] = useState<any>();
    const [objectSearch, setObjectSearch] = useState<FilterProps | undefined>();
    const [showInput, setShowInput] = useState<boolean>(false);
    const [search, setSearch] = useState<boolean>(false);
    const [uniqueNames, setUniqueNames] = useState<any[]>([]);


    /**
     * Função para  atraso nas operações, configurando o estado de pesquisa e a exibição do input.
     */
    function handleAtraso() {
        setTimeout(() => {
            setSearch(true);
            setTimeout(() => {
                setShowInput(true);
            }, 400);
        }, 200);
    }

    /**
     * Função para chamar a filtragem com base no tipo especificado (cliente ou produto).
     */
    function callFilter() {
        carregarDados(false)
        if (valueClient) filterByType(valueClient)
        else filterByType(valueproduct)
    }

    /**
    * Cancela a filtragem, restaurando os dados originais e redefinindo os valores relacionados.
    */
    const cancelFiltered = () => {
        setFilteredData(data);
        carregarDados(true)
        setValueproduct([])
        setValueClient('')
    };

    /**
     * Função chamada ao pressionar a tecla Enter no input, realiza a filtragem conforme o tipo especificado.
     * @param e - Evento de teclado associado à entrada de texto.
     */
    function onKeyPressCallFilter(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            carregarDados(false)
            if (valueClient) filterByType(valueClient)
            else filterByType(valueproduct)
        }

    }

    /**
     * Filtra os dados pelo cliente fornecido e atualiza o estado dos dados filtrados.
     *
     * @param {ClienteModel} clientes - Objeto contendo informações do cliente para filtragem.
     * @returns {void}
     */
    const filterByCliente = (clientes: ClienteModel): void => {
        if (clientes) {
            const clienteEncontrado = data.filter(cliente => cliente.nmCliente === clientes);
            setFilteredData(clienteEncontrado);
        }
    };

    /**
     * Filtra os dados pela entrega fornecida e atualiza o estado dos dados filtrados.
     *
     * @param {ClienteModel} clientes - Objeto contendo informações do cliente para filtragem.
     * @returns {void}
     */
    const filterByEntrega = (clientes: ClienteModel): void => {
        if (clientes) {
            const clienteEncontrado = data.filter(cli => cli.cliente.nmCliente === clientes);
            setFilteredData(clienteEncontrado);
        }
    };

    /**
     * Filtra os dados pelo produto fornecido e atualiza o estado dos dados filtrados.
     *
     * @param {ProdutosModel} produtos - Objeto contendo informações do produto para filtragem.
     * @returns {void}
     */
    const filterByProduto = (produtos: ProdutosModel): void => {
        if (produtos && produtos.nmProduto) {
            const produtosEncontrados = data.filter(produto => produto.nmProduto === produtos.nmProduto);
            setFilteredData(produtosEncontrados);
        }
    };

    /**
     * Filtra os dados pela pesquisa de produto fornecida e atualiza o estado dos dados filtrados.
     *
     * @param {ProdutosModel | ProdutosModel[]} produtos - Objeto ou array de objetos contendo informações do produto para filtragem.
     * @returns {void}
     */
    const filterBySearch = (produtos: ProdutosModel | ProdutosModel[]): void => {
        if (produtos && objectSearch && objectSearch.values && isArray(produtos)) {
            const chaveBusca = objectSearch.values;
            const valoresChave = produtos.map((produto: any) => produto[chaveBusca]);
            const produtosEncontrados = data.filter(produto => valoresChave.includes(produto[chaveBusca]));
            setFilteredData(produtosEncontrados);
            setObjectSearch(undefined);
        }
    };

    /**
     * Filtra os dados com base no cliente ou produto fornecido e atualiza o estado dos dados filtrados.
     *
     * @param {ClienteModel | ProdutosModel | ProdutosModel[]} clientesOrProdutos - Objeto, ou array de objetos, contendo informações do cliente ou do produto para filtragem.
     * @returns {void}
     */
    const filterByType = (clientesOrProdutos: ClienteModel & ProdutosModel & (ProdutosModel | ProdutosModel[])) => {
        const filterFunction = filterFunctions[type];
        filterFunction(clientesOrProdutos);
    };

    /**
     * Objeto contendo as funções de filtro disponíveis, mapeadas pelos tipos correspondentes.
     * Cada função de filtro é responsável por filtrar os dados com base no tipo especificado.
     */
    const filterFunctions = {
        cliente: filterByCliente,
        Entrega: filterByEntrega,
        produto: filterByProduto,
        estoque: filterBySearch
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
    function handleAutoCompleteSearch(newValue: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            cancelFiltered()
        } else if (newValue) {
            if (objectSearch) {
                const foundProduct = data.filter(item => item[objectSearch.values] === newValue);
                if (foundProduct) {
                    setValueproduct(foundProduct);
                }
            }
        }
    }
    function handleAutoCompleteTypeFilter(newValue: any, reason: AutocompleteChangeReason) {
        if (reason === 'clear' || reason === 'removeOption') {
            cancelFiltered()
        } else if (newValue) {
            const values = filter?.find(item => item.label === newValue);
            setObjectSearch(values)
            const valueKeys = values?.values.split(',').map(key => key.trim());
            const filteredNames = data.flatMap(item => valueKeys?.map(key => item[key])).filter(Boolean);
            setUniqueNames([...new Set(filteredNames)]);
        }
    }

    useEffect(() => {
        if (data && data.length) {
            setUniqueNames(
                type === 'produto' || type === 'estoque'
                    ? [...new Set(data.map(item => item.nmProduto))] :
                    type === 'Entrega' ? [...new Set(data.map(item => item.cliente.nmCliente))]
                        : [...new Set(data.map(item => item.nmCliente))]
            );
        }
    }, [data, type]);
    return (
        <>
            {type !== "estoque" && !filter ?
                <div>
                    <FormControl
                        variant="standard"
                        sx={{ m: 1, minWidth: 120 }}
                        style={{ paddingRight: '3rem' }}
                    >
                        <ContainerFilter>
                            <ContainerInput isVisible={showInput}>
                                <Autocomplete
                                    id="tags-standard"
                                    options={uniqueNames}
                                    getOptionLabel={(produto: string) => { return produto; }}
                                    onChange={(e, newValue, reason) => handleAutoComplete(newValue, reason)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            onKeyDown={onKeyPressCallFilter}
                                            variant="standard"
                                            label="Filtro"
                                            placeholder="Selecione..."
                                        />
                                    )}
                                />
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
                :
                <div>
                    <FormControl
                        variant="standard"
                        sx={{ m: 1, minWidth: 120 }}
                        style={{ paddingRight: '3rem' }}
                    >
                        <ContainerFilter>
                            <ContainerInput style={{ width: '8rem' }} isVisible={showInput}>
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
                            <ContainerInput isVisible={showInput}>
                                <Autocomplete
                                    id="tags-standard"
                                    options={uniqueNames}
                                    disabled={!objectSearch}
                                    getOptionLabel={(produto: string) => { return produto; }}
                                    onChange={(e, newValue, reason) => handleAutoCompleteSearch(newValue, reason)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            onKeyDown={onKeyPressCallFilter}
                                            variant="standard"
                                            label="Pesquisa"
                                            placeholder="Selecione..."
                                        />
                                    )}
                                />
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
            }
        </>
    );
};

export default FiltroGeneric;
