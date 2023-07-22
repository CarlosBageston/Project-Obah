import EstoqueModel from "./model/estoque";
import GetData from "../../../firebase/getData";
import VendasModel from "../vendas/model/vendas";
import React, { useState, useEffect } from "react";
import ComprasModel from "../compras/model/compras";
import GenericTable from "../../../Components/table";
import FiltroGeneric from "../../../Components/filtro";
import { EntregaModel } from "../entregas/model/entrega";
import SituacaoProduto from "../compras/enumeration/situacaoProduto";
import {
    Box,
    Title,
    BoxTitleDefault,
    DivTitleDefault,
    BoxFilterDefault,
    TitleTableDefault,
    BoxTitleFilterDefault,
} from './style'




export default function Estoque() {
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [dataTableFabricado, setDataTableFabricado] = useState<EstoqueModel[]>([])
    const [dataTableComprado, setDataTableComprado] = useState<EstoqueModel[]>([])

    //realizando busca no banco de dados
    const {
        dataTable: comprasDataTable,
    } = GetData('Compras', recarregue) as { dataTable: ComprasModel[] }
    const {
        dataTable: vendasDataTable,
    } = GetData('Vendas', recarregue) as { dataTable: VendasModel[] }
    const {
        dataTable: entregasDataTable,
        loading,
    } = GetData('Entregas', recarregue) as { dataTable: EntregaModel[], loading: boolean, setDataTable: (data: EntregaModel[]) => void }

    useEffect(() => {
        let quantidadeVendas: { [key: string]: EstoqueModel } = {};
        const quantidadeCompras: { [key: string]: EstoqueModel } = {};
        console.log(comprasDataTable)
        if (vendasDataTable.length) {
            vendasDataTable.forEach(venda => {
                if (venda.produtoEscaniado) {
                    const produtosEscaniados = venda.produtoEscaniado;
                    produtosEscaniados.forEach(produto => {
                        const { cdProduto, nmProduto, quantidadeVenda, tpProduto, mpFabricado } = produto;
                        if (!quantidadeVendas[nmProduto]) {
                            quantidadeVendas[nmProduto] = { cdProduto, nmProduto, quantidadeTotal: 0, tpProduto, mpFabricado };
                        }
                        quantidadeVendas[nmProduto].quantidadeTotal += quantidadeVenda;
                    });
                }

            });
        }
        if (entregasDataTable.length) {
            entregasDataTable.forEach(entrega => {
                const { quantidades } = entrega;
                Object.entries(quantidades).forEach(([produto, quantidade]) => {
                    if (!quantidadeVendas[produto]) {
                        quantidadeVendas[produto] = { cdProduto: '', tpProduto: null, nmProduto: produto, quantidadeTotal: 0 };
                    }
                    if (quantidade) {
                        quantidadeVendas[produto].quantidadeTotal += Number(quantidade);
                    }
                });
            });
            quantidadeVendas = Object.entries(quantidadeVendas)
                .filter(([produto, info]) => info.quantidadeTotal)
                .reduce((acc, [produto, info]) => {
                    acc[produto] = info;
                    return acc;
                }, {} as { [produto: string]: typeof quantidadeVendas[keyof typeof quantidadeVendas] });
        }
        if (comprasDataTable.length) {
            comprasDataTable.forEach(venda => {
                const { cdProduto, nmProduto, quantidade, tpProduto, cxProduto, kgProduto, qntMinima } = venda;
                if (!quantidadeCompras[nmProduto]) {
                    quantidadeCompras[nmProduto] = { cdProduto, tpProduto, nmProduto, quantidadeTotal: 0, cxProduto, kgProduto, qntMinima };
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
        const resultado = [...Object.values(quantidadeCompras), ...Object.values(quantidadeVendas)].reduce((estoque: EstoqueModel[], vendido) => {
            const existingItemIndex = estoque.findIndex((item) => item.nmProduto === vendido.nmProduto);

            if (existingItemIndex > -1) {
                if (vendido.quantidadeTotal < 0 && Math.abs(vendido.quantidadeTotal) > estoque[existingItemIndex].quantidadeTotal) {
                    estoque[existingItemIndex].quantidadeTotal = estoque[existingItemIndex].quantidadeTotal - (-1 * vendido.quantidadeTotal);
                } else {
                    estoque[existingItemIndex].quantidadeTotal -= vendido.quantidadeTotal;
                }
                if (vendido.mpFabricado && vendido.mpFabricado.length > 0) {

                    vendido.mpFabricado.forEach((mp) => {
                        const existingMpIndex = estoque.findIndex((item) => item.nmProduto === mp.nmProduto);

                        if (existingMpIndex > -1) {
                            const total = Number(mp.quantidade) * vendido.quantidadeTotal
                            estoque[existingMpIndex].quantidadeTotal -= total;
                        }
                    });
                }
            } else {
                if (vendido.quantidadeTotal < 0) {
                    vendido.quantidadeTotal = -1 * vendido.quantidadeTotal;
                }
                estoque.push(vendido);
            }
            return estoque;
        }, []);
        const tipoFabricado = resultado.filter(tipo => tipo.tpProduto === SituacaoProduto.FABRICADO)
        const tipoComprado = resultado.filter(tipo => tipo.tpProduto === SituacaoProduto.COMPRADO)
        tipoFabricado.map(item => {
            if (item.qntMinima) {
                if (item.qntMinima > item.quantidadeTotal) return item.stEstoque = 'Fabricar'
                return item.stEstoque = 'Ok'
            }
        })
        tipoComprado.map(item => {
            if (item.qntMinima) {
                if (item.qntMinima > item.quantidadeTotal) return item.stEstoque = 'Comprar'
                return item.stEstoque = 'Ok'
            }
        })
        setDataTableFabricado(tipoFabricado)
        setDataTableComprado(tipoComprado)

    }, [vendasDataTable, comprasDataTable, entregasDataTable]);

    return (
        <Box>
            <Title>Estoque</Title>
            <div>
                {/*Tabala Fabricado*/}
                <div>
                    <BoxTitleFilterDefault>
                        <BoxTitleDefault>
                            <div>
                                <FiltroGeneric data={dataTableComprado} setFilteredData={setDataTableComprado} carregarDados={setRecarregue} type="produto" />
                            </div>
                        </BoxTitleDefault>
                        <BoxFilterDefault>
                            <DivTitleDefault>
                                <TitleTableDefault>Tabela Fabricado</TitleTableDefault>
                            </DivTitleDefault>
                        </BoxFilterDefault>
                    </BoxTitleFilterDefault>
                    <GenericTable
                        columns={[
                            { label: 'Código', name: 'cdProduto' },
                            { label: 'Nome', name: 'nmProduto' },
                            { label: 'Quantidade', name: 'quantidadeTotal' },
                            { label: 'Status', name: 'stEstoque' },
                        ]}
                        data={dataTableFabricado}
                        isLoading={loading}
                        isVisibleEdit
                        isVisibledDelete
                    />
                </div>
                {/*Tabala Comprado*/}
                <div>
                    <BoxTitleFilterDefault>
                        <BoxTitleDefault>
                            <div>
                                <FiltroGeneric data={dataTableFabricado} setFilteredData={setDataTableFabricado} carregarDados={setRecarregue} type="produto" />
                            </div>
                        </BoxTitleDefault>
                        <BoxFilterDefault>
                            <DivTitleDefault>
                                <TitleTableDefault>Tabela Compra</TitleTableDefault>
                            </DivTitleDefault>
                        </BoxFilterDefault>
                    </BoxTitleFilterDefault>

                    <GenericTable
                        columns={[
                            { label: 'Código', name: 'cdProduto' },
                            { label: 'Nome', name: 'nmProduto' },
                            { label: 'Quantidade', name: 'quantidadeTotal' },
                            { label: 'Status', name: 'stEstoque' },
                        ]}
                        data={dataTableComprado}
                        isLoading={loading}
                        isVisibleEdit
                        isVisibledDelete
                    />
                </div>
            </div>
        </Box>
    );
}