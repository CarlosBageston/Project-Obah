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
import { EntregaModel } from "../entregas/model/entrega";




export default function Estoque() {
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [dataTableFabricado, setDataTableFabricado] = useState<EstoqueModel[]>([])
    const [dataTableComprado, setDataTableComprado] = useState<EstoqueModel[]>([])

    const {
        dataTable,
        loading,
    } = GetData('Compras', recarregue) as { dataTable: ComprasModel[], loading: boolean, setDataTable: (data: ComprasModel[]) => void }
    const {
        dataTable: vendasDataTable,
    } = GetData('Vendas', recarregue) as { dataTable: ProdutoModel[], loading: boolean, setDataTable: (data: ProdutoModel[]) => void }
    const {
        dataTable: entregasDataTable,
    } = GetData('Entregas', recarregue) as { dataTable: EntregaModel[], loading: boolean, setDataTable: (data: EntregaModel[]) => void }

    useEffect(() => {
        let quantidadeVendas: { [key: string]: EstoqueModel } = {};
        const quantidadeCompras: { [key: string]: EstoqueModel } = {};

        if (vendasDataTable.length !== 0) {
            vendasDataTable.forEach(venda => {
                if (venda.produtoEscaniado !== undefined) {
                    const produtosEscaniados = venda.produtoEscaniado;
                    produtosEscaniados.forEach(produto => {
                        const { cdProduto, nmProduto, quantidadeVenda, tpProduto } = produto;
                        if (!quantidadeVendas[nmProduto]) {
                            quantidadeVendas[nmProduto] = { cdProduto, nmProduto, quantidadeTotal: 0, tpProduto };
                        }
                        quantidadeVendas[nmProduto].quantidadeTotal += quantidadeVenda;
                    });
                }
            });
        }

        if (dataTable.length !== 0) {
            dataTable.forEach(venda => {
                const { cdProduto, nmProduto, quantidade, tpProduto, cxProduto, kgProduto } = venda;
                if (!quantidadeCompras[nmProduto]) {
                    quantidadeCompras[nmProduto] = { cdProduto, tpProduto, nmProduto, quantidadeTotal: 0, cxProduto, kgProduto };
                }
                if (cxProduto) {
                    const qntCaixa = cxProduto * Number(quantidade)
                    quantidadeCompras[nmProduto].quantidadeTotal += qntCaixa;
                } else if (kgProduto) {
                    const qntKG = kgProduto * Number(quantidade)
                    quantidadeCompras[nmProduto].quantidadeTotal += qntKG;
                } else {
                    quantidadeCompras[nmProduto].quantidadeTotal += Number(quantidade);
                }
            });
        }
        if (entregasDataTable.length !== 0) {
            entregasDataTable.forEach(entrega => {
                const { quantidades } = entrega;
                Object.entries(quantidades).forEach(([produto, quantidade]) => {
                    if (!quantidadeVendas[produto]) {
                        quantidadeVendas[produto] = { cdProduto: '', tpProduto: null, nmProduto: produto, quantidadeTotal: 0 };
                    }
                    if (quantidade !== 0) {
                        quantidadeVendas[produto].quantidadeTotal += Number(quantidade) || 0;
                    }
                });
            });
            quantidadeVendas = Object.entries(quantidadeVendas)
                .filter(([produto, info]) => info.quantidadeTotal !== 0)
                .reduce((acc, [produto, info]) => {
                    acc[produto] = info;
                    return acc;
                }, {} as { [produto: string]: typeof quantidadeVendas[keyof typeof quantidadeVendas] });
        }

        const resultado = [...Object.values(quantidadeCompras), ...Object.values(quantidadeVendas)].reduce((acc: EstoqueModel[], curr) => {
            const existingItemIndex = acc.findIndex((item) => item.nmProduto === curr.nmProduto);
            if (existingItemIndex > -1) {
                if (curr.quantidadeTotal < 0 && Math.abs(curr.quantidadeTotal) > acc[existingItemIndex].quantidadeTotal) {
                    acc[existingItemIndex].quantidadeTotal = acc[existingItemIndex].quantidadeTotal - (-1 * curr.quantidadeTotal);
                } else {
                    acc[existingItemIndex].quantidadeTotal -= curr.quantidadeTotal;
                }
            } else {
                if (curr.quantidadeTotal < 0) {
                    curr.quantidadeTotal = -1 * curr.quantidadeTotal;
                }
                acc.push(curr);
            }
            return acc;
        }, []);

        const tipoFabricado = resultado.filter(tipo => tipo.tpProduto === SituacaoProduto.FABRICADO)
        const tipoComprado = resultado.filter(tipo => tipo.tpProduto === SituacaoProduto.COMPRADO)
        setDataTableFabricado(tipoFabricado)
        setDataTableComprado(tipoComprado)

    }, [vendasDataTable, dataTable, entregasDataTable]);

    return (
        <Box>
            <Title>Estoque</Title>
            <div>
                {/*Tabala Fabricado*/}
                <div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ margin: '-3.5rem 0px -12px 3rem' }}>
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
                    />
                </div>
                {/*Tabala Comprado*/}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ margin: '-3.5rem 0px -12px 3rem' }}>
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
                            { label: 'Quantidade na Caixa', name: 'cxProduto' },
                            { label: 'Quantidade KG', name: 'kgProduto' },
                            { label: 'Status', name: 'stEstoque' },
                        ]}
                        data={dataTableComprado}
                        isLoading={loading}
                    />
                </div>
            </div>
        </Box>
    );
}