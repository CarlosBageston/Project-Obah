import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io'
import { BiSearchAlt } from 'react-icons/bi'
import { CgPlayListSearch } from 'react-icons/cg'
import { FormControl, Autocomplete, TextField } from '@mui/material';
import { ContainerFilter, ContainerInput, StyledButton, ButtonFilter, ContainerButton } from './style'

interface Props {
    data: any[],
    setFilteredData: (data: any[]) => void,
    type: "cliente" | "produto",
    carregarDados: React.Dispatch<React.SetStateAction<boolean>>
    clienteProps?: string,

}
const FiltroGeneric = ({ data, setFilteredData, type, carregarDados, clienteProps }: Props) => {
    const [valueClient, setValueClient] = useState<any>();
    const [valueproduct, setValueproduct] = useState<any>();
    const [showInput, setShowInput] = useState<boolean>(false);
    const [search, setSearch] = useState<boolean>(false);
    function handleAtraso() {
        setTimeout(() => {
            setSearch(true);
            setTimeout(() => {
                setShowInput(true);
            }, 800);
        }, 500);
    }
    function callFilter() {
        carregarDados(false)
        if (type === 'cliente') {
            filterByCliente(valueClient)
        } else {
            filterByProduto(valueproduct)
        }

    }
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


    let selectComponent = null;
    if (type === 'produto') {
        selectComponent = (
            <Autocomplete
                id="tags-standard"
                options={data}
                getOptionLabel={(produto: any) => produto.nmProduto}
                onChange={(event, value) => setValueproduct(value)}
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
                onChange={(event, value) => setValueClient(value)}
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
                                style={{ transition: 'transform 1s, opacity 1s' }}
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
                                <ButtonFilter
                                    type="button"
                                    onClick={cancelFiltered}
                                    startIcon={<IoMdClose size={25} color='red' />}
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
