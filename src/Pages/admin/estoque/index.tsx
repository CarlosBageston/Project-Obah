import React, { useState, useEffect } from "react";

import {
    Box,
    Title,
    ContainerTables
} from './style'
import FiltroGeneric from "../../../Components/filtro";
import GenericTable from "../../../Components/table";
import GetData from "../../../firebase/getData";
import ComprasModel from "../compras/model/compras";
import ProdutoModel from "../vendas/model/vendas";
import EstoqueModel from "./model/estoque";
import SituacaoProduto from "../compras/enumeration/situacaoProduto";




export default function Estoque() {
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [dataTableFabricado, setDataTableFabricado] = useState<EstoqueModel[]>([])
    const [dataTableComprado, setDataTableComprado] = useState<EstoqueModel[]>([])

    const {
        dataTable,
        loading,
        setDataTable
    } = GetData('Compras', recarregue) as { dataTable: ComprasModel[], loading: boolean, setDataTable: (data: ComprasModel[]) => void }
    const {
        dataTable: vendasDataTable,
        loading: vendasLoading,
        setDataTable: setVendasDataTable
    } = GetData('Vendas', recarregue) as { dataTable: ProdutoModel[], loading: boolean, setDataTable: (data: ProdutoModel[]) => void }


    useEffect(() => {
        const quantidadeVendas: { [key: string]: EstoqueModel } = {};
        const quantidadeCompras: { [key: string]: EstoqueModel } = {};

        if (vendasDataTable.length !== 0) {
            vendasDataTable.forEach(venda => {
                if (venda.produtoEscaniado !== undefined) {
                    const produtosEscaniados = venda.produtoEscaniado;
                    produtosEscaniados.forEach(produto => {
                        const { cdProduto, nmProduto, quantidadeVenda } = produto;
                        if (!quantidadeVendas[nmProduto]) {
                            quantidadeVendas[nmProduto] = { cdProduto, nmProduto, quantidadeTotal: 0 };
                        }
                        quantidadeVendas[nmProduto].quantidadeTotal += quantidadeVenda;
                    });
                }
            });
        }

        if (dataTable.length !== 0) {
            dataTable.forEach(venda => {
                const { cdProduto, nmProduto, quantidade, tpProduto } = venda;
                if (!quantidadeCompras[nmProduto]) {
                    quantidadeCompras[nmProduto] = { cdProduto, tpProduto, nmProduto, quantidadeTotal: 0 };
                }
                quantidadeCompras[nmProduto].quantidadeTotal += Number(quantidade);
            });
        }
        const resultado = [...Object.values(quantidadeCompras), ...Object.values(quantidadeVendas)].reduce((acc: EstoqueModel[], curr) => {
            const existingItemIndex = acc.findIndex((item) => item.nmProduto === curr.nmProduto);
            if (existingItemIndex > -1) {
                acc[existingItemIndex].quantidadeTotal -= curr.quantidadeTotal;
            } else {
                acc.push(curr);
            }
            return acc;
        }, []);
        const tipoFabricado = resultado.filter(tipo => tipo.tpProduto === SituacaoProduto.FABRICADO)
        const tipoComprado = resultado.filter(tipo => tipo.tpProduto === SituacaoProduto.COMPRADO)
        setDataTableFabricado(tipoFabricado)
        setDataTableComprado(tipoComprado)

    }, [vendasDataTable, dataTable]);

    return (
        <Box>
            <Title>Estoque</Title>
            <ContainerTables>
                {/*Tabala Fabricado*/}
                <div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ margin: '0rem 0px -12px -1rem' }}>
                            <FiltroGeneric data={dataTableFabricado} setFilteredData={setDataTableFabricado} carregarDados={setRecarregue} type="produto" />
                        </div>
                        <div>
                            <p>Tabela Fabricado</p>
                        </div>

                    </div>
                    <GenericTable
                        columns={[
                            { label: 'Código', name: 'cdProduto' },
                            { label: 'Nome', name: 'nmProduto' },
                            { label: 'Quantidade', name: 'quantidadeTotal' },
                            { label: 'Status', name: 'stEstoque' },
                        ]}
                        data={dataTableFabricado}
                        isLoading={loading}
                        styleDiv={{ margin: '0px 1rem 0px 0px', width: '43.8rem' }}
                    />
                </div>
                {/*Tabala Comprado*/}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ margin: '0rem 0px -12px -1rem' }}>
                            <FiltroGeneric data={dataTableComprado} setFilteredData={setDataTableComprado} carregarDados={setRecarregue} type="produto" />
                        </div>
                        <div>
                            <p>Tabela Compra</p>
                        </div>

                    </div>
                    <GenericTable
                        columns={[
                            { label: 'Código', name: 'cdProduto' },
                            { label: 'Nome', name: 'nmProduto' },
                            { label: 'Quantidade', name: 'quantidadeTotal' },
                            { label: 'Status', name: 'stEstoque' },
                        ]}
                        data={dataTableComprado}
                        isLoading={loading}
                        styleDiv={{ margin: '0px 0rem 0px 0px', width: '43.8rem' }}
                    />
                </div>
            </ContainerTables>
        </Box>
    );
}