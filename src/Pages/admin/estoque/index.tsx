import React, { useState, useEffect } from "react";

import {
    Box,
    Title,
} from './style'
import FiltroGeneric from "../../../Components/filtro";
import GenericTable from "../../../Components/table";
import GetData from "../../../firebase/getData";
import ComprasModel from "../compras/model/compras";
import ProdutoModel from "../vendas/model/vendas";
import EstoqueModel from "./model/estoque";




export default function Estoque() {
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [dataTableEstoque, setDataTableEstoque] = useState<EstoqueModel[]>([])

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
                const { cdProduto, nmProduto, quantidade } = venda;
                if (!quantidadeCompras[nmProduto]) {
                    quantidadeCompras[nmProduto] = { cdProduto, nmProduto, quantidadeTotal: 0 };
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
        setDataTableEstoque(resultado)

    }, [vendasDataTable, dataTable]);
    return (
        <Box>
            <Title>Estoque</Title>
            {/*Tabala */}
            <div style={{ margin: '-3.5rem 0px -12px 3rem' }}>
                <FiltroGeneric data={dataTableEstoque} setFilteredData={setDataTableEstoque} carregarDados={setRecarregue} type="produto" />
            </div>
            <GenericTable
                columns={[
                    { label: 'Código', name: 'cdProduto' },
                    { label: 'Nome', name: 'nmProduto' },
                    { label: 'Quantidade', name: 'quantidadeTotal' },
                    { label: 'Status', name: 'stEstoque' },
                ]}
                data={dataTableEstoque}
                isLoading={loading}
            />
        </Box>
    );
}