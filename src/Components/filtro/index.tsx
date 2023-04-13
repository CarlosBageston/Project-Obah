import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Input from '../input';
import { HiOutlineDocumentSearch } from 'react-icons/hi'
import { CgCloseR } from 'react-icons/cg'
import { CgPlayListSearch } from 'react-icons/cg'

import { ContainerFilter, ContainerInput, StyledButton, ButtonFilter, ContainerButton } from './style'

interface Props {
    data: any[],
    setFilteredData: (data: any[]) => void,
    type: "date" | "cliente" | "produto",
    carregarDados: React.Dispatch<React.SetStateAction<boolean>>
    clienteProps?: string,

}
const FiltroGeneric = ({ data, setFilteredData, type, carregarDados, clienteProps }: Props) => {
    const [filtroMes, setFiltroMes] = useState<number>(1);
    const [valueClient, setValueClient] = useState<string>('');
    const [valueproduct, setValueproduct] = useState<string>('');
    const [sumValorPago, setSumValorPago] = useState<number>(0);
    const [filtrado, setFiltrado] = useState<boolean>(false);
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
        setFiltrado(true)
        if (type === 'date') {
            if (filtroMes !== null && filtroMes !== undefined) {
                const filteredData = data.filter(item => {
                    const parts = item.dtCompra.split('/');
                    const mesCompra = parseInt(parts[1], 10) - 1;
                    return mesCompra === filtroMes - 1;
                });

                const valoresPagos = filteredData
                    .map(item => Number(item.totalPago?.match(/\d+/g)?.join(".")))
                    .filter(valor => !isNaN(valor));

                const somaVlPago = valoresPagos.reduce((total, valor) => total + valor, 0);

                setFilteredData(filteredData);
                setSumValorPago(somaVlPago);
            }
        } else if (type === 'cliente') {
            filterByCliente(valueClient)
        } else {
            filterByProduto(valueproduct)
        }

    }
    //quando o tipo de filtro for cliente, ele chama essa função 
    const filterByCliente = (clientes: string) => {
        const clienteEncontrado = data.filter(cliente => cliente.nmCliente === clientes)
        setFilteredData(clienteEncontrado)
    };
    const filterByProduto = (produtos: string) => {
        const produtoEncontrado = data.filter(produto => produto.nmProduto === produtos)
        setFilteredData(produtoEncontrado)
    };
    const cancelFiltered = () => {
        setFiltrado(false)
        setFiltroMes(1);
        setFilteredData(data);
        setSumValorPago(0)
        carregarDados(true)
        setValueproduct('')
        setValueClient('')
    };


    const mapMes = [
        { label: 'janeiro', value: 1 },
        { label: 'fevereiro', value: 2 },
        { label: 'março', value: 3 },
        { label: 'abril', value: 4 },
        { label: 'maio', value: 5 },
        { label: 'junho', value: 6 },
        { label: 'julho', value: 7 },
        { label: 'agosto', value: 8 },
        { label: 'setembro', value: 9 },
        { label: 'outubro', value: 10 },
        { label: 'novembro', value: 11 },
        { label: 'dezembro', value: 12 },
    ]

    let selectComponent = null;
    if (type === 'date') {
        selectComponent = (
            <Select
                name='Data'
                id="standard"
                label="Selecione..."
                labelId="standard-label"
                onChange={(event) => setFiltroMes(Number(event.target.value))}
                value={filtroMes}
                style={{ borderBottom: '1px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a', paddingLeft: 8, width: '10rem' }}
                MenuProps={{
                    autoFocus: false,
                    PaperProps: {
                        style: {
                            height: 200,
                            overflow: 'auto'
                        }
                    }
                }}
            >
                {mapMes.map(mes => (
                    <MenuItem
                        key={mes.label}
                        value={mes.value}
                    >
                        {mes.label}
                    </MenuItem>
                ))}
            </Select>
        );
    } else if (type === 'produto') {
        selectComponent = (
            <Select
                name='Produto'
                id="standard"
                label="Selecione..."
                labelId="standard-label"
                onChange={(event) => setValueproduct(event.target.value)}
                value={valueproduct}
                style={{ borderBottom: '1px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a', paddingLeft: 8, width: '10rem' }}
                MenuProps={{
                    autoFocus: false,
                    PaperProps: {
                        style: {
                            height: 200,
                            overflow: 'auto'
                        }
                    }
                }}
            >
                {data.map(produto => (
                    <MenuItem
                        key={produto.nmProduto}
                        value={produto.nmProduto}
                    >
                        {produto.nmProduto}
                    </MenuItem>
                ))}
            </Select>
        );
    } else {
        selectComponent = (
            <Select
                name='Produto'
                id="standard"
                label="Selecione..."
                labelId="standard-label"
                onChange={(event) => setValueClient(event.target.value)}
                value={valueClient}
                style={{ borderBottom: '1px solid #6e6dc0', color: 'black', backgroundColor: '#b2beed1a', paddingLeft: 8, width: '10rem' }}
                MenuProps={{
                    autoFocus: false,
                    PaperProps: {
                        style: {
                            height: 200,
                            overflow: 'auto'
                        }
                    }
                }}
            >
                {data.map(cliente => (
                    <MenuItem
                        key={cliente.nmCliente}
                        value={cliente.nmCliente}
                    >
                        {cliente.nmCliente}
                    </MenuItem>
                ))}
            </Select>
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
                        <InputLabel style={{ color: '#4d68af', fontWeight: 'bold' }} id="standard-label">
                            {type === 'date' ? 'Filtrar Data' : type === 'produto' ? 'Filtrar Produto' : 'Filtrar Cliente'}
                        </InputLabel>
                        {selectComponent}
                    </ContainerInput>
                    <ContainerButton>
                        {!showInput ? (
                            <StyledButton
                                type="button"
                                className={`${search ? 'flip-out' : ''}`}
                                onClick={handleAtraso}
                                startIcon={<CgPlayListSearch size={40} />}
                                style={{ transition: 'transform 1s, opacity 1s' }}
                            >
                            </StyledButton>
                        ) : (
                            filtrado ? (
                                <ButtonFilter
                                    type="button"
                                    onClick={cancelFiltered}
                                    startIcon={<CgCloseR size={40} />}
                                >
                                </ButtonFilter>
                            ) : (
                                <ButtonFilter
                                    type="button"
                                    onClick={callFilter}
                                    className={`${showInput ? 'flip-enter' : ''}`}
                                    startIcon={<HiOutlineDocumentSearch size={40} />}
                                    style={{ transition: 'transform 1s, opacity 1s' }}
                                >
                                </ButtonFilter>
                            )
                        )}
                    </ContainerButton>
                </ContainerFilter>
                {showInput ?
                    type === 'date' ? (
                        <ContainerInput isVisible={showInput}>
                            <Input
                                disabled
                                error=""
                                label="Valor Pago"
                                name="sumValorPago"
                                onChange={e => e}
                                value={sumValorPago ? `R$ ${sumValorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
                                raisedLabel={sumValorPago ? true : false}
                                styleLabel={{ fontSize: 18 }}
                                style={{
                                    color: 'black',
                                    opacity: 1,
                                    borderBottom: '2px solid #c7c6f3',
                                    backgroundColor: '#e0e0e04f',
                                    marginBottom: 10,
                                    width: '10rem',
                                    fontSize: '16px'
                                }}
                                styleDiv={{ marginTop: 4 }}
                            />
                        </ContainerInput>
                    ) : (
                        null
                    )
                    :
                    null
                }

            </FormControl>
        </div >
    );
};

export default FiltroGeneric;
