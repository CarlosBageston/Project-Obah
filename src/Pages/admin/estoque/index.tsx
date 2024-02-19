import EstoqueModel from "./model/estoque";
import GetData from "../../../firebase/getData";
import React, { useState, useEffect } from "react";
import GenericTable from "../../../Components/table";
import FiltroGeneric from "../../../Components/filtro";
import {
    Box,
    Title,
    BoxTitleDefault,
    DivTitleDefault,
    BoxFilterDefault,
    TitleTableDefault,
    BoxTitleFilterDefault,
} from './style';
import SituacaoProduto from "../../../enumeration/situacaoProduto";

function Estoque() {
    const [recarregue, setRecarregue] = useState<boolean>(true);
    const [dataTableFabricado, setDataTableFabricado] = useState<EstoqueModel[]>([])
    const [dataTableComprado, setDataTableComprado] = useState<EstoqueModel[]>([])

    const {
        dataTable: estoqueDataTable,
        loading,
    } = GetData('Estoque', recarregue) as { dataTable: EstoqueModel[], loading: boolean }

    useEffect(() => {
        const atualizadoEstoque = estoqueDataTable.map(estoque => {
            estoque.stEstoque = estoque.qntMinima > estoque.quantidade ? 'Comprar' : 'Bom';
            return { ...estoque };
        });

        const comprados = atualizadoEstoque.filter(estoque => estoque.tpProduto === SituacaoProduto.COMPRADO);
        const fabricados = atualizadoEstoque.filter(estoque => estoque.tpProduto === SituacaoProduto.FABRICADO);

        setDataTableComprado(comprados);
        setDataTableFabricado(fabricados);
    }, [estoqueDataTable]);
    return (
        <Box>
            <Title>Estoque</Title>
            <div>
                {/*Tabala Fabricado*/}
                <div>
                    <BoxTitleFilterDefault>
                        <BoxTitleDefault>
                            <div>
                                <FiltroGeneric data={dataTableFabricado} setFilteredData={setDataTableFabricado} carregarDados={setRecarregue} type="produto" />
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
                            { label: 'Quantidade', name: 'quantidade', isInfinite: true },
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
                                <FiltroGeneric data={dataTableComprado} setFilteredData={setDataTableComprado} carregarDados={setRecarregue} type="produto" />
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
                            { label: 'Quantidade', name: 'quantidade', isInfinite: true },
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

export default Estoque;